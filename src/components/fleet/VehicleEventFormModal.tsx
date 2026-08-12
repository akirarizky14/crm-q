import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { VehicleEvent, VehicleEventType } from '../../data/mock'
import { EVENT_TYPE_META, EVENT_TYPE_OPTIONS } from '../../lib/vehicleEvents'
import '../tasks/tasks-forms.css'

interface VehicleEventFormModalProps {
  event: VehicleEvent | null
  onClose: () => void
  onSave: (event: Omit<VehicleEvent, 'id' | 'vehicleId' | 'createdAt'> & { id?: string }) => void
  onDelete?: (eventId: string) => void
}

function emptyForm(): Omit<VehicleEvent, 'id' | 'vehicleId' | 'createdAt'> {
  return {
    type: 'service',
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    description: '',
  }
}

export function VehicleEventFormModal({ event, onClose, onSave, onDelete }: VehicleEventFormModalProps) {
  const [form, setForm] = useState<Omit<VehicleEvent, 'id' | 'vehicleId' | 'createdAt'>>(
    event ? { type: event.type, date: event.date, amount: event.amount, description: event.description } : emptyForm()
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave({ id: event?.id, ...form })
  }

  return (
    <Modal title={event ? 'Edit Riwayat' : 'Tambah Riwayat'} onClose={onClose}>
      <form className="lead-form" onSubmit={handleSubmit}>
        <label className="lead-field">
          <span>Jenis</span>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VehicleEventType })}>
            {EVENT_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_META[t].label}
              </option>
            ))}
          </select>
        </label>

        <label className="lead-field">
          <span>Tanggal</span>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </label>

        <label className="lead-field">
          <span>Nominal (Rp)</span>
          <input
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
        </label>

        <label className="lead-field">
          <span>Keterangan</span>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Contoh: Servis berkala 20.000 km"
          />
        </label>

        <div className="lead-form-actions">
          <Button type="submit">{event ? 'Simpan Perubahan' : 'Tambah Riwayat'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          {event && onDelete && (
            <button
              type="button"
              className="lead-delete-btn"
              onClick={() => (confirmDelete ? onDelete(event.id) : setConfirmDelete(true))}
            >
              <Trash2 size={14} /> {confirmDelete ? 'Yakin hapus?' : 'Hapus'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
