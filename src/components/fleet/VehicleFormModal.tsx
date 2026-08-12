import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { Vehicle, VehicleCategory, VehicleStatus } from '../../data/mock'
import './fleet-forms.css'

const CATEGORIES: VehicleCategory[] = ['City Car', 'Wedding', 'Corporate', 'Electric Car']
const STATUSES: VehicleStatus[] = ['Tersedia', 'Disewa', 'Maintenance', 'Terjual']

interface VehicleFormModalProps {
  vehicle: Vehicle | null
  onClose: () => void
  onSave: (vehicle: Omit<Vehicle, 'createdAt'>) => void
  onDelete?: (id: string) => void
}

function emptyForm(): Omit<Vehicle, 'id' | 'createdAt'> {
  return {
    name: '',
    category: 'City Car',
    year: new Date().getFullYear(),
    plate: '',
    monthlyRate: 0,
    status: 'Tersedia',
    seats: 4,
    image: '',
  }
}

export function VehicleFormModal({ vehicle, onClose, onSave, onDelete }: VehicleFormModalProps) {
  const [form, setForm] = useState<Omit<Vehicle, 'id' | 'createdAt'>>(vehicle ? { ...vehicle } : emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.plate.trim()) return
    onSave({ id: vehicle?.id ?? '', ...form })
  }

  return (
    <Modal title={vehicle ? 'Edit Armada' : 'Tambah Armada'} onClose={onClose}>
      <form className="vehicle-form" onSubmit={handleSubmit}>
        <label className="vehicle-field">
          <span>Nama Mobil</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Daihatsu Sigra"
            required
          />
        </label>

        <div className="vehicle-field-row">
          <label className="vehicle-field">
            <span>Kategori</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as VehicleCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="vehicle-field">
            <span>Tahun</span>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="vehicle-field-row">
          <label className="vehicle-field">
            <span>Plat Nomor</span>
            <input
              value={form.plate}
              onChange={(e) => setForm({ ...form, plate: e.target.value })}
              placeholder="B 1 CRW"
              required
            />
          </label>
          <label className="vehicle-field">
            <span>Kursi</span>
            <input
              type="number"
              min={1}
              value={form.seats}
              onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="vehicle-field-row">
          <label className="vehicle-field">
            <span>Tarif Bulanan (Rp)</span>
            <input
              type="number"
              min={0}
              value={form.monthlyRate}
              onChange={(e) => setForm({ ...form, monthlyRate: Number(e.target.value) })}
            />
          </label>
          <label className="vehicle-field">
            <span>Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="vehicle-field">
          <span>URL Foto (opsional)</span>
          <input
            value={form.image ?? ''}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://..."
          />
        </label>

        <div className="vehicle-form-actions">
          <Button type="submit">{vehicle ? 'Simpan Perubahan' : 'Tambah Armada'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          {vehicle && onDelete && (
            <button
              type="button"
              className="vehicle-delete-btn"
              onClick={() => (confirmDelete ? onDelete(vehicle.id) : setConfirmDelete(true))}
            >
              <Trash2 size={14} /> {confirmDelete ? 'Yakin hapus?' : 'Hapus Armada'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
