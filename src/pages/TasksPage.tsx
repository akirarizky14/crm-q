import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import {
  Plus,
  Upload,
  Download,
  Pencil,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  CalendarDays,
} from 'lucide-react'
import { taskColumns, type KanbanTask, type LeadTemperature, type TaskStatus } from '../data/mock'
import { TEMPERATURE_META, TEMPERATURE_OPTIONS } from '../lib/leads'
import { fetchLeads, fetchLeadsPage, createLead, updateLead, deleteLead } from '../api/leads'
import { downloadLeadsWorkbook } from '../lib/leadsExcel'
import { formatRupiah } from '../lib/format'
import { Button } from '../components/ui/Button'
import { LeadFormModal } from '../components/tasks/LeadFormModal'
import { ImportDialog } from '../components/tasks/ImportDialog'
import './TasksPage.css'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300
const STATUSES: TaskStatus[] = taskColumns.map((c) => c.id)

type TempFilter = LeadTemperature | 'all'

interface ColumnData {
  items: KanbanTask[]
  total: number
  loading: boolean
}

function perStatus<T>(make: (status: TaskStatus) => T): Record<TaskStatus, T> {
  return Object.fromEntries(STATUSES.map((s) => [s, make(s)])) as Record<TaskStatus, T>
}

// Board state lives in the URL so a refresh (or a shared link) keeps the same view.
// Defaults (page 1, no search, all temperatures, current month) are left out of the URL.
const PARAM = {
  search: 'q',
  from: 'from',
  to: 'to',
  page: (s: TaskStatus) => `${s}_page`,
  columnSearch: (s: TaskStatus) => `${s}_q`,
  columnTemp: (s: TaskStatus) => `${s}_temp`,
}

function setOrDelete(params: URLSearchParams, key: string, value: string, defaultValue = '') {
  if (value === defaultValue) params.delete(key)
  else params.set(key, value)
}

function parsePage(raw: string | null): number {
  const n = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

function parseTemp(raw: string | null): TempFilter {
  return TEMPERATURE_OPTIONS.includes(raw as LeadTemperature) ? (raw as LeadTemperature) : 'all'
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function toLocalIsoDate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function monthRange(offset: number): { from: string; to: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
  return { from: toLocalIsoDate(start), to: toLocalIsoDate(end) }
}

/** Inserts a task into a newest-first list at its created-date position (optimistic update). */
function insertByCreatedDesc(items: KanbanTask[], task: KanbanTask): KanbanTask[] {
  const index = items.findIndex((t) => t.createdAt <= task.createdAt)
  if (index === -1) return [...items, task]
  return [...items.slice(0, index), task, ...items.slice(index)]
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })
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
  data,
  page,
  search,
  temperature,
  onSearchChange,
  onTemperatureChange,
  onPageChange,
  onEdit,
}: {
  id: TaskStatus
  title: string
  data: ColumnData
  page: number
  search: string
  temperature: TempFilter
  onSearchChange: (value: string) => void
  onTemperatureChange: (value: TempFilter) => void
  onPageChange: (page: number) => void
  onEdit: (task: KanbanTask) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const isFiltered = search.trim() !== '' || temperature !== 'all'
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  return (
    <div className="kanban-column">
      <div className="kanban-column-head">
        <h4>{title}</h4>
        <span className="kanban-count">{data.total}</span>
      </div>
      <div className="kanban-column-filters">
        <div className="kanban-column-search">
          <Search size={12} />
          <input
            type="text"
            placeholder={`Cari di ${title}...`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => onSearchChange('')} title="Hapus pencarian">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="kanban-temp-filter" role="group" aria-label={`Filter suhu ${title}`}>
          <button
            type="button"
            className={temperature === 'all' ? 'is-active' : ''}
            onClick={() => onTemperatureChange('all')}
          >
            Semua
          </button>
          {TEMPERATURE_OPTIONS.map((temp) => (
            <button
              key={temp}
              type="button"
              className={`${TEMPERATURE_META[temp].cssClass}${temperature === temp ? ' is-active' : ''}`}
              onClick={() => onTemperatureChange(temperature === temp ? 'all' : temp)}
            >
              {TEMPERATURE_META[temp].label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`kanban-dropzone${isOver ? ' is-over' : ''}${data.loading ? ' is-loading' : ''}`}
      >
        {data.items.map((t) => (
          <TaskCard key={t.id} task={t} onEdit={onEdit} />
        ))}
        {data.items.length === 0 && (
          <div className="kanban-empty">
            {data.loading ? 'Memuat...' : isFiltered ? 'Tidak ada task yang cocok' : 'Tidak ada task'}
          </div>
        )}
      </div>
      {data.total > PAGE_SIZE && (
        <div className="kanban-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            title="Halaman sebelumnya"
          >
            <ChevronLeft size={13} />
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            title="Halaman berikutnya"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

export function TasksPage() {
  const [columns, setColumns] = useState<Record<TaskStatus, ColumnData>>(() =>
    perStatus(() => ({ items: [], total: 0, loading: true }))
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [versions, setVersions] = useState<Record<TaskStatus, number>>(() => perStatus(() => 0))
  const [error, setError] = useState('')
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)
  const [formTarget, setFormTarget] = useState<KanbanTask | null | undefined>(undefined)
  const [showImport, setShowImport] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const topScrollRef = useRef<HTMLDivElement>(null)
  const [boardScrollWidth, setBoardScrollWidth] = useState(0)
  const [boardOverflows, setBoardOverflows] = useState(false)
  // Whichever scrollbar the user is moving "owns" the sync until it goes quiet, so the
  // echoed scroll event from the other bar can't push back and cause jitter.
  const scrollOwner = useRef<'top' | 'board' | null>(null)
  const scrollOwnerTimer = useRef<number | undefined>(undefined)
  const latestRequest = useRef<Record<TaskStatus, number>>(perStatus(() => 0))
  const loadedKeys = useRef<Partial<Record<TaskStatus, string>>>({})
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Derived from the URL; memoized on searchParams so identities stay stable between renders.
  const { pages, columnSearch, columnTemp, search, dateFrom, dateTo } = useMemo(() => {
    const thisMonth = monthRange(0)
    return {
      pages: perStatus((s) => parsePage(searchParams.get(PARAM.page(s)))),
      columnSearch: perStatus((s) => searchParams.get(PARAM.columnSearch(s)) ?? ''),
      columnTemp: perStatus((s) => parseTemp(searchParams.get(PARAM.columnTemp(s)))),
      search: searchParams.get(PARAM.search) ?? '',
      // Missing → current month; present but empty → no bound ("Semua").
      dateFrom: searchParams.get(PARAM.from) ?? thisMonth.from,
      dateTo: searchParams.get(PARAM.to) ?? thisMonth.to,
    }
  }, [searchParams])

  function updateParams(mutate: (params: URLSearchParams) => void) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        mutate(next)
        return next
      },
      { replace: true }
    )
  }

  function setPage(status: TaskStatus, page: number) {
    updateParams((p) => setOrDelete(p, PARAM.page(status), String(page), '1'))
  }

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const debouncedColumnSearch = useDebouncedValue(columnSearch, SEARCH_DEBOUNCE_MS)

  // Each column fetches its own page from the server. A column only refetches when
  // something in its own query changed (its page, its filters, the shared filters,
  // or an explicit reload), so filtering one column doesn't reload the others.
  useEffect(() => {
    for (const status of STATUSES) {
      const query = {
        status,
        page: pages[status],
        pageSize: PAGE_SIZE,
        search: [debouncedSearch, debouncedColumnSearch[status]],
        temperature: columnTemp[status] === 'all' ? undefined : columnTemp[status],
        from: dateFrom || undefined,
        to: dateTo || undefined,
      }
      const key = JSON.stringify([query, versions[status]])
      if (loadedKeys.current[status] === key) continue
      loadedKeys.current[status] = key

      const requestId = ++latestRequest.current[status]
      setColumns((prev) => ({ ...prev, [status]: { ...prev[status], loading: true } }))
      fetchLeadsPage(query)
        .then((res) => {
          if (requestId !== latestRequest.current[status]) return
          const lastPage = Math.max(1, Math.ceil(res.total / PAGE_SIZE))
          if (res.items.length === 0 && query.page > lastPage) {
            // The page emptied out (after a move or delete) — step back to the last page.
            setPage(status, lastPage)
            return
          }
          setColumns((prev) => ({ ...prev, [status]: { items: res.items, total: res.total, loading: false } }))
        })
        .catch(() => {
          if (requestId !== latestRequest.current[status]) return
          setError('Gagal memuat data lead dari server.')
          setColumns((prev) => ({ ...prev, [status]: { ...prev[status], loading: false } }))
        })
    }
    // setPage only calls setSearchParams with an updater, so it never reads stale state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, columnTemp, versions, debouncedSearch, debouncedColumnSearch, dateFrom, dateTo])

  // Mirror the board's horizontal scrollbar above it, since the native one sits
  // below the (tall) columns and is easy to miss.
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const update = () => {
      setBoardScrollWidth(board.scrollWidth)
      setBoardOverflows(board.scrollWidth > board.clientWidth + 1)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  function handleBoardScroll(from: 'top' | 'board') {
    if (scrollOwner.current && scrollOwner.current !== from) return
    scrollOwner.current = from
    const source = from === 'top' ? topScrollRef.current : boardRef.current
    const target = from === 'top' ? boardRef.current : topScrollRef.current
    if (source && target) target.scrollLeft = source.scrollLeft
    window.clearTimeout(scrollOwnerTimer.current)
    scrollOwnerTimer.current = window.setTimeout(() => {
      scrollOwner.current = null
    }, 120)
  }

  useEffect(() => () => window.clearTimeout(scrollOwnerTimer.current), [])

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

  function reload(statuses: TaskStatus[] = STATUSES) {
    setVersions((prev) => {
      const next = { ...prev }
      for (const s of statuses) next[s] += 1
      return next
    })
  }

  function resetAllPages(params: URLSearchParams) {
    for (const s of STATUSES) params.delete(PARAM.page(s))
  }

  function handleGlobalSearch(value: string) {
    updateParams((p) => {
      setOrDelete(p, PARAM.search, value)
      resetAllPages(p)
    })
  }

  function handleColumnSearch(status: TaskStatus, value: string) {
    updateParams((p) => {
      setOrDelete(p, PARAM.columnSearch(status), value)
      p.delete(PARAM.page(status))
    })
  }

  function handleColumnTemp(status: TaskStatus, value: TempFilter) {
    updateParams((p) => {
      setOrDelete(p, PARAM.columnTemp(status), value, 'all')
      p.delete(PARAM.page(status))
    })
  }

  function handleDateRange(from: string, to: string) {
    const thisMonth = monthRange(0)
    updateParams((p) => {
      if (from === thisMonth.from && to === thisMonth.to) {
        p.delete(PARAM.from)
        p.delete(PARAM.to)
      } else {
        p.set(PARAM.from, from)
        p.set(PARAM.to, to)
      }
      resetAllPages(p)
    })
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTask((event.active.data.current?.task as KanbanTask | undefined) ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    const task = active.data.current?.task as KanbanTask | undefined
    if (!over || !task) return
    const from = task.status
    const to = over.id as TaskStatus
    if (from === to) return

    // Optimistically move the card, then reload both columns from the server.
    setColumns((prev) => ({
      ...prev,
      [from]: {
        ...prev[from],
        items: prev[from].items.filter((t) => t.id !== task.id),
        total: Math.max(0, prev[from].total - 1),
      },
      [to]: {
        ...prev[to],
        items: insertByCreatedDesc(prev[to].items, { ...task, status: to }),
        total: prev[to].total + 1,
      },
    }))
    updateLead(task.id, { status: to })
      .catch(() => setError('Gagal menyimpan perubahan status.'))
      .finally(() => reload([from, to]))
  }

  function handleSaveLead(task: KanbanTask) {
    const previousStatus = formTarget?.status
    if (task.id) {
      updateLead(task.id, task)
        .then(() => reload(previousStatus ? [previousStatus, task.status] : [task.status]))
        .catch(() => setError('Gagal menyimpan perubahan lead.'))
    } else {
      const { id: _unusedId, ...payload } = task
      createLead(payload)
        .then((created) => reload([created.status]))
        .catch(() => setError('Gagal menambahkan lead baru.'))
    }
    setFormTarget(undefined)
  }

  function handleDeleteLead(id: string) {
    const status = formTarget?.status
    deleteLead(id)
      .then(() => reload(status ? [status] : STATUSES))
      .catch(() => setError('Gagal menghapus lead.'))
    setFormTarget(undefined)
  }

  async function handleImport(imported: KanbanTask[]): Promise<{ created: number; failed: number }> {
    let created = 0
    let failed = 0
    // One at a time, last CSV row first: leads sharing a date are shown newest-inserted
    // first, so this makes the board list them in the same order as the CSV.
    for (const { id: _unusedId, ...payload } of [...imported].reverse()) {
      try {
        await createLead(payload)
        created++
      } catch {
        failed++
      }
    }
    if (created > 0) reload()
    return { created, failed }
  }

  function exportLeads(filename: string, from?: string, to?: string) {
    setShowExportMenu(false)
    fetchLeads({ from, to })
      .then((leads) => downloadLeadsWorkbook(filename, leads))
      .catch(() => setError('Gagal mengekspor data lead.'))
  }

  function exportRange(from: string, to: string) {
    exportLeads(`crown-crm-leads-${from}_${to}.xlsx`, from, to)
  }

  function exportAll() {
    exportLeads('crown-crm-leads-semua.xlsx')
  }

  function setDatePreset(preset: 'this' | 'last' | 'all') {
    if (preset === 'all') {
      handleDateRange('', '')
      return
    }
    const { from, to } = monthRange(preset === 'this' ? 0 : -1)
    handleDateRange(from, to)
  }

  const thisMonth = monthRange(0)
  const lastMonth = monthRange(-1)
  const activePreset =
    !dateFrom && !dateTo
      ? 'all'
      : dateFrom === thisMonth.from && dateTo === thisMonth.to
        ? 'this'
        : dateFrom === lastMonth.from && dateTo === lastMonth.to
          ? 'last'
          : 'custom'

  return (
    <div className="tasks-page">
      {error && <p className="login-error">{error}</p>}
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
              <button type="button" onClick={() => exportRange(thisMonth.from, thisMonth.to)}>
                Bulan Ini
              </button>
              <button type="button" onClick={() => exportRange(lastMonth.from, lastMonth.to)}>
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
        <div className="tasks-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Cari lead, customer, atau kendaraan..."
            value={search}
            onChange={(e) => handleGlobalSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="tasks-date-filter">
        <CalendarDays size={14} />
        <span className="tasks-date-label">Tanggal masuk</span>
        <div className="tasks-date-presets" role="group" aria-label="Preset tanggal">
          <button
            type="button"
            className={activePreset === 'this' ? 'is-active' : ''}
            onClick={() => setDatePreset('this')}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            className={activePreset === 'last' ? 'is-active' : ''}
            onClick={() => setDatePreset('last')}
          >
            Bulan Lalu
          </button>
          <button
            type="button"
            className={activePreset === 'all' ? 'is-active' : ''}
            onClick={() => setDatePreset('all')}
          >
            Semua
          </button>
        </div>
        <div className="tasks-date-range">
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => handleDateRange(e.target.value, dateTo)}
            aria-label="Dari tanggal"
          />
          <span>–</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => handleDateRange(dateFrom, e.target.value)}
            aria-label="Sampai tanggal"
          />
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {boardOverflows && (
          <div
            ref={topScrollRef}
            className="kanban-top-scroll kanban-scroll"
            onScroll={() => handleBoardScroll('top')}
            aria-hidden="true"
          >
            <div style={{ width: boardScrollWidth, height: 1 }} />
          </div>
        )}
        <div
          ref={boardRef}
          className="kanban-board kanban-scroll"
          onScroll={() => handleBoardScroll('board')}
        >
          {taskColumns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              data={columns[col.id]}
              page={pages[col.id]}
              search={columnSearch[col.id]}
              temperature={columnTemp[col.id]}
              onSearchChange={(value) => handleColumnSearch(col.id, value)}
              onTemperatureChange={(value) => handleColumnTemp(col.id, value)}
              onPageChange={(page) => setPage(col.id, page)}
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
