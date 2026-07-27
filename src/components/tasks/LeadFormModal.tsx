import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { taskColumns, type KanbanTask, type LeadTemperature } from '../../data/mock'
import { TEMPERATURE_OPTIONS } from '../../lib/leads'
import './tasks-forms.css'

interface LeadFormModalProps {
  task: KanbanTask | null
  onClose: () => void
  onSave: (task: KanbanTask) => void
  onDelete?: (id: string) => void
}

function emptyForm(): Omit<KanbanTask, 'id'> {
  const today = new Date().toISOString().slice(0, 10)
  return {
    title: '',
    customer: '',
    phone: '',
    vehicle: '',
    temperature: 'Warm',
    amount: 0,
    createdAt: today,
    dueDate: today,
    status: 'inquiry',
    notes: '',
  }
}

export function LeadFormModal({ task, onClose, onSave, onDelete }: LeadFormModalProps) {
  const [form, setForm] = useState<Omit<KanbanTask, 'id'>>(task ? { ...task } : emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.customer.trim()) return
    onSave({ id: task?.id ?? '', ...form })
  }

  return (
    <Modal title={task ? 'Edit Lead' : 'Tambah Lead'} onClose={onClose}>
      <form className="lead-form" onSubmit={handleSubmit}>
        <label className="lead-field">
          <span>Nama Deal</span>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Wedding Amanda & Rizky"
            required
          />
        </label>

        <div className="lead-field-row">
          <label className="lead-field">
            <span>Customer</span>
            <input
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              placeholder="Nama customer / perusahaan"
              required
            />
          </label>
          <label className="lead-field">
            <span>No. Telepon</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62 812..." />
          </label>
        </div>

        <label className="lead-field">
          <span>Mobil / Armada</span>
          <input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Alphard 2024" />
        </label>

        <div className="lead-field-row">
          <label className="lead-field">
            <span>Temperature</span>
            <select
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: e.target.value as LeadTemperature })}
            >
              {TEMPERATURE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="lead-field">
            <span>Status / Stage</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as KanbanTask['status'] })}>
              {taskColumns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="lead-field-row">
          <label className="lead-field">
            <span>Nilai (Rp)</span>
            <input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="lead-field-row">
          <label className="lead-field">
            <span>Tanggal Masuk</span>
            <input type="date" value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} />
          </label>
          <label className="lead-field">
            <span>Target / Jatuh Tempo</span>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </label>
        </div>

        <label className="lead-field">
          <span>Catatan</span>
          <textarea rows={2} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>

        <div className="lead-form-actions">
          <Button type="submit">{task ? 'Simpan Perubahan' : 'Tambah Lead'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          {task && onDelete && (
            <button
              type="button"
              className="lead-delete-btn"
              onClick={() => (confirmDelete ? onDelete(task.id) : setConfirmDelete(true))}
            >
              <Trash2 size={14} /> {confirmDelete ? 'Yakin hapus?' : 'Hapus Lead'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
