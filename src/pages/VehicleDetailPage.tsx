import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, Users, Check, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { IconButton } from '../components/ui/IconButton'
import { VehicleEventFormModal } from '../components/fleet/VehicleEventFormModal'
import type { Vehicle, VehicleCategory, VehicleEvent, VehicleStatus } from '../data/mock'
import {
  fetchVehicles,
  updateVehicle,
  deleteVehicle,
  fetchVehicleEvents,
  createVehicleEvent,
  updateVehicleEvent,
  deleteVehicleEvent,
} from '../api/vehicles'
import { fetchLeads } from '../api/leads'
import { formatRupiah } from '../lib/format'
import { EVENT_TYPE_META } from '../lib/vehicleEvents'
import '../components/fleet/fleet-detail.css'

const STATUS_TONE: Record<VehicleStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Tersedia: 'success',
  Disewa: 'warning',
  Maintenance: 'danger',
  Terjual: 'neutral',
}

const CATEGORIES: VehicleCategory[] = ['City Car', 'Wedding', 'Corporate', 'Electric Car']
const STATUSES: VehicleStatus[] = ['Tersedia', 'Disewa', 'Maintenance', 'Terjual']
const RENTED_STATUSES = ['kontrak', 'berjalan', 'selesai']

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [events, setEvents] = useState<VehicleEvent[]>([])
  const [rentalCount, setRentalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventTarget, setEventTarget] = useState<VehicleEvent | null | undefined>(undefined)

  const [editingVehicle, setEditingVehicle] = useState(false)
  const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState(false)
  const [editForm, setEditForm] = useState<Omit<Vehicle, 'id' | 'createdAt'> | null>(null)

  const load = useCallback(() => {
    if (!id) return
    Promise.all([fetchVehicles(), fetchVehicleEvents(id), fetchLeads()])
      .then(([vehicles, eventRows, leads]) => {
        const found = vehicles.find((v) => v.id === id) ?? null
        setVehicle(found)
        setEvents(eventRows)
        if (found) {
          const count = leads.filter(
            (l) => l.vehicle.toLowerCase().includes(found.name.toLowerCase()) && RENTED_STATUSES.includes(l.status)
          ).length
          setRentalCount(count)
        }
      })
      .catch(() => setError('Gagal memuat data armada.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const procurement = [...events]
    .filter((e) => e.type === 'procurement')
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  const sale = [...events]
    .filter((e) => e.type === 'sale')
    .sort((a, b) => b.date.localeCompare(a.date))[0]
  const totalService = events.filter((e) => e.type === 'service').reduce((sum, e) => sum + e.amount, 0)
  const totalExpense = events.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)

  function handleSaveEvent(payload: Omit<VehicleEvent, 'id' | 'vehicleId' | 'createdAt'> & { id?: string }) {
    if (!id) return
    const { id: eventId, ...rest } = payload
    const request = eventId ? updateVehicleEvent(id, eventId, rest) : createVehicleEvent(id, rest)
    request
      .then(() => {
        setEventTarget(undefined)
        load()
      })
      .catch(() => setError('Gagal menyimpan riwayat.'))
  }

  function handleDeleteEvent(eventId: string) {
    if (!id) return
    deleteVehicleEvent(id, eventId)
      .then(() => {
        setEventTarget(undefined)
        load()
      })
      .catch(() => setError('Gagal menghapus riwayat.'))
  }

  function startEditVehicle() {
    if (!vehicle) return
    const { id: _vid, createdAt: _createdAt, ...rest } = vehicle
    setEditForm(rest)
    setConfirmDeleteVehicle(false)
    setEditingVehicle(true)
  }

  function handleSaveVehicle() {
    if (!vehicle || !editForm) return
    updateVehicle(vehicle.id, editForm)
      .then(() => {
        setEditingVehicle(false)
        load()
      })
      .catch(() => setError('Gagal menyimpan perubahan armada.'))
  }

  function handleDeleteVehicle() {
    if (!vehicle) return
    deleteVehicle(vehicle.id)
      .then(() => navigate('/fleet', { replace: true }))
      .catch(() => setError('Gagal menghapus armada.'))
  }

  if (loading) {
    return <p className="kanban-empty">Memuat data armada...</p>
  }

  if (!vehicle) {
    return (
      <div className="vehicle-detail-page">
        <Link to="/fleet" className="vehicle-back-link">
          <ArrowLeft size={15} /> Kembali ke Armada
        </Link>
        <p className="login-error">Armada tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="vehicle-detail-page">
      <Link to="/fleet" className="vehicle-back-link">
        <ArrowLeft size={15} /> Kembali ke Armada
      </Link>

      <Card className="vehicle-detail">
        {editingVehicle && editForm ? (
          <div className="vehicle-detail-header">
            {vehicle.image ? (
              <img src={vehicle.image} alt={vehicle.name} className="vehicle-detail-image" />
            ) : (
              <div className="vehicle-detail-image vehicle-detail-image-empty" />
            )}
            <div className="vehicle-detail-heading vehicle-edit-form">
              <div className="vehicle-edit-row">
                <input
                  className="vehicle-edit-input vehicle-edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nama mobil"
                />
                <input
                  className="vehicle-edit-input vehicle-edit-year"
                  type="number"
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}
                />
              </div>
              <div className="vehicle-edit-row">
                <select
                  className="vehicle-edit-input"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as VehicleCategory })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  className="vehicle-edit-input"
                  value={editForm.plate}
                  onChange={(e) => setEditForm({ ...editForm, plate: e.target.value })}
                  placeholder="Plat nomor"
                />
                <input
                  className="vehicle-edit-input vehicle-edit-seats"
                  type="number"
                  min={1}
                  value={editForm.seats}
                  onChange={(e) => setEditForm({ ...editForm, seats: Number(e.target.value) })}
                />
              </div>
              <div className="vehicle-edit-row">
                <select
                  className="vehicle-edit-input"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as VehicleStatus })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  className="vehicle-edit-input"
                  type="number"
                  min={0}
                  value={editForm.monthlyRate}
                  onChange={(e) => setEditForm({ ...editForm, monthlyRate: Number(e.target.value) })}
                  placeholder="Tarif bulanan"
                />
              </div>
              <input
                className="vehicle-edit-input"
                value={editForm.image ?? ''}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                placeholder="URL foto (opsional)"
              />

              <div className="vehicle-edit-actions">
                <IconButton onClick={handleSaveVehicle} title="Simpan">
                  <Check size={15} />
                </IconButton>
                <IconButton onClick={() => setEditingVehicle(false)} title="Batal">
                  <X size={15} />
                </IconButton>
                <button
                  type="button"
                  className="vehicle-delete-link"
                  onClick={() => (confirmDeleteVehicle ? handleDeleteVehicle() : setConfirmDeleteVehicle(true))}
                >
                  <Trash2 size={13} /> {confirmDeleteVehicle ? 'Yakin hapus?' : 'Hapus Armada'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="vehicle-detail-header">
            {vehicle.image ? (
              <img src={vehicle.image} alt={vehicle.name} className="vehicle-detail-image" />
            ) : (
              <div className="vehicle-detail-image vehicle-detail-image-empty" />
            )}
            <div className="vehicle-detail-heading">
              <div className="vehicle-detail-title-row">
                <h3>
                  {vehicle.name} <span className="vehicle-detail-year">{vehicle.year}</span>
                </h3>
                <IconButton onClick={startEditVehicle} title="Edit armada">
                  <Pencil size={15} />
                </IconButton>
              </div>
              <div className="vehicle-detail-meta">
                {vehicle.category} • {vehicle.plate} •{' '}
                <span className="vehicle-detail-meta-seats">
                  <Users size={12} /> {vehicle.seats} kursi
                </span>
              </div>
              <Badge tone={STATUS_TONE[vehicle.status]}>{vehicle.status}</Badge>
            </div>
          </div>
        )}

        {error && <p className="login-error">{error}</p>}

        <div className="vehicle-detail-stats">
          <div className="vehicle-stat-box">
            <span>Harga Beli</span>
            <strong>{procurement ? formatRupiah(procurement.amount) : '—'}</strong>
            {procurement && <span className="vehicle-stat-sub">{formatDateShort(procurement.date)}</span>}
          </div>
          <div className="vehicle-stat-box">
            <span>Total Servis</span>
            <strong>{formatRupiah(totalService)}</strong>
          </div>
          <div className="vehicle-stat-box">
            <span>Total Pengeluaran</span>
            <strong>{formatRupiah(totalExpense)}</strong>
          </div>
          <div className="vehicle-stat-box">
            <span>Harga Jual</span>
            <strong>{sale ? formatRupiah(sale.amount) : 'Belum terjual'}</strong>
          </div>
          <div className="vehicle-stat-box">
            <span>Sudah Disewa</span>
            <strong>{rentalCount}x</strong>
          </div>
          <div className="vehicle-stat-box">
            <span>Tarif Bulanan</span>
            <strong>{formatRupiah(vehicle.monthlyRate)}</strong>
          </div>
        </div>

        <div className="vehicle-history">
          <div className="vehicle-history-head">
            <h4>Riwayat</h4>
            <Button type="button" variant="ghost" onClick={() => setEventTarget(null)}>
              <Plus size={14} /> Tambah Riwayat
            </Button>
          </div>

          <div className="vehicle-event-list">
            {events.map((ev) => {
              const meta = EVENT_TYPE_META[ev.type]
              const Icon = meta.icon
              return (
                <button
                  key={ev.id}
                  type="button"
                  className={`vehicle-event-row vehicle-event-row-clickable ${meta.cssClass}`}
                  onClick={() => setEventTarget(ev)}
                >
                  <span className="vehicle-event-icon">
                    <Icon size={14} />
                  </span>
                  <div className="vehicle-event-body">
                    <div className="vehicle-event-top">
                      <strong>{meta.label}</strong>
                      <span className="vehicle-event-date">{formatDateShort(ev.date)}</span>
                    </div>
                    {ev.description && <span className="vehicle-event-desc">{ev.description}</span>}
                  </div>
                  <span className="vehicle-event-amount">{formatRupiah(ev.amount)}</span>
                </button>
              )
            })}
            {events.length === 0 && <div className="kanban-empty">Belum ada riwayat</div>}
          </div>
        </div>
      </Card>

      {eventTarget !== undefined && (
        <VehicleEventFormModal
          event={eventTarget}
          onClose={() => setEventTarget(undefined)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  )
}
