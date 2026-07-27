import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Upload, Download, Pencil, ChevronDown } from 'lucide-react'
import { taskColumns, initialTasks, type KanbanTask, type TaskStatus } from '../data/mock'
import { TEMPERATURE_META, LEAD_CSV_HEADERS, leadToCsvRow, generateLeadId } from '../lib/leads'
import { toCsv, downloadCsv } from '../lib/csv'
import { formatRupiah } from '../lib/format'
import { Button } from '../components/ui/Button'
import { LeadFormModal } from '../components/tasks/LeadFormModal'
import { ImportDialog } from '../components/tasks/ImportDialog'
import './TasksPage.css'

const STORAGE_KEY = 'crown-crm-tasks'

function loadTasks(): KanbanTask[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return initialTasks
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialTasks
  } catch {
    return initialTasks
  }
}

function saveTasks(tasks: KanbanTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function monthRange(offset: number): { from: string; to: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
}

function TaskCard({
  task,
  dragging = false,
  onEdit,
}: {
  task: KanbanTask
  dragging?: boolean
  onEdit?: (task: KanbanTask) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  }
  const temp = TEMPERATURE_META[task.temperature]
  const TempIcon = temp.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-card${dragging ? ' task-card-overlay' : ''}`}
    >
      <div className="task-card-top">
        <span className={`task-temp ${temp.cssClass}`}>
          <TempIcon size={11} /> {temp.label}
        </span>
        {onEdit && (
          <button
            type="button"
            className="task-edit-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            title="Edit lead"
          >
            <Pencil size={12} />
          </button>
        )}
      </div>
      <strong>{task.title}</strong>
      <span className="task-customer">{task.customer}</span>
      <span className="task-vehicle">{task.vehicle}</span>
      <div className="task-footer">
        <span className="task-amount">{formatRupiah(task.amount)}</span>
        <span className="task-due">{formatDateShort(task.dueDate)}</span>
      </div>
    </div>
  )
}

function Column({
  id,
  title,
  tasks,
  onEdit,
}: {
  id: TaskStatus
  title: string
  tasks: KanbanTask[]
  onEdit: (task: KanbanTask) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="kanban-column">
      <div className="kanban-column-head">
        <h4>{title}</h4>
        <span className="kanban-count">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className={`kanban-dropzone${isOver ? ' is-over' : ''}`}>
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onEdit={onEdit} />
        ))}
        {tasks.length === 0 && <div className="kanban-empty">Tidak ada task</div>}
      </div>
    </div>
  )
}

export function TasksPage() {
  const [tasks, setTasks] = useState<KanbanTask[]>(loadTasks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [formTarget, setFormTarget] = useState<KanbanTask | null | undefined>(undefined)
  const [showImport, setShowImport] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  useEffect(() => {
    if (!showExportMenu) return
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  function updateTasks(next: KanbanTask[]) {
    setTasks(next)
    saveTasks(next)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const newStatus = over.id as TaskStatus
    updateTasks(tasks.map((t) => (t.id === active.id ? { ...t, status: newStatus } : t)))
  }

  function handleSaveLead(task: KanbanTask) {
    if (task.id) {
      updateTasks(tasks.map((t) => (t.id === task.id ? task : t)))
    } else {
      updateTasks([...tasks, { ...task, id: generateLeadId() }])
    }
    setFormTarget(undefined)
  }

  function handleDeleteLead(id: string) {
    updateTasks(tasks.filter((t) => t.id !== id))
    setFormTarget(undefined)
  }

  function handleImport(imported: KanbanTask[]) {
    if (imported.length > 0) updateTasks([...tasks, ...imported])
  }

  function exportRange(from: string, to: string) {
    const filtered = tasks.filter((t) => t.createdAt >= from && t.createdAt <= to)
    const csv = toCsv([...LEAD_CSV_HEADERS], filtered.map(leadToCsvRow))
    downloadCsv(`crown-crm-leads-${from}_${to}.csv`, csv)
    setShowExportMenu(false)
  }

  function exportAll() {
    const csv = toCsv([...LEAD_CSV_HEADERS], tasks.map(leadToCsvRow))
    downloadCsv('crown-crm-leads-semua.csv', csv)
    setShowExportMenu(false)
  }

  const activeTask = tasks.find((t) => t.id === activeId)

  return (
    <div className="tasks-page">
      <div className="tasks-toolbar">
        <Button type="button" onClick={() => setFormTarget(null)}>
          <Plus size={15} /> Tambah Lead
        </Button>
        <Button type="button" variant="ghost" onClick={() => setShowImport(true)}>
          <Upload size={15} /> Import
        </Button>
        <div className="tasks-export-wrap" ref={exportMenuRef}>
          <Button type="button" variant="ghost" onClick={() => setShowExportMenu((v) => !v)}>
            <Download size={15} /> Export <ChevronDown size={13} />
          </Button>
          {showExportMenu && (
            <div className="tasks-export-menu">
              <button
                type="button"
                onClick={() => {
                  const { from, to } = monthRange(0)
                  exportRange(from, to)
                }}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => {
                  const { from, to } = monthRange(-1)
                  exportRange(from, to)
                }}
              >
                Bulan Lalu
              </button>
              <button type="button" onClick={exportAll}>
                Semua
              </button>
              <div className="tasks-export-custom">
                <span>Rentang Kustom</span>
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                <button
                  type="button"
                  disabled={!customFrom || !customTo}
                  onClick={() => exportRange(customFrom, customTo)}
                >
                  Export Rentang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-board scrollbar-thin">
          {taskColumns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks.filter((t) => t.status === col.id)}
              onEdit={(task) => setFormTarget(task)}
            />
          ))}
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} dragging /> : null}</DragOverlay>
      </DndContext>

      {formTarget !== undefined && (
        <LeadFormModal
          task={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSave={handleSaveLead}
          onDelete={handleDeleteLead}
        />
      )}

      {showImport && <ImportDialog onClose={() => setShowImport(false)} onImport={handleImport} />}
    </div>
  )
}
