import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Users } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { type Vehicle, type VehicleStatus } from '../data/mock'
import { formatRupiah } from '../lib/format'
import { VEHICLE_CATEGORY_ICON } from '../lib/vehicleIcons'
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles'
import { VehicleFormModal } from '../components/fleet/VehicleFormModal'
import './FleetPage.css'

const STATUS_TONE: Record<VehicleStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Tersedia: 'success',
  Disewa: 'warning',
  Maintenance: 'danger',
  Terjual: 'neutral',
}

export function FleetPage() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formTarget, setFormTarget] = useState<Vehicle | null | undefined>(undefined)

  function load() {
    fetchVehicles()
      .then(setVehicles)
      .catch(() => setError('Gagal memuat data armada dari server.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const counts = vehicles.reduce(
    (acc, v) => {
      acc[v.status] += 1
      return acc
    },
    { Tersedia: 0, Disewa: 0, Maintenance: 0, Terjual: 0 } as Record<VehicleStatus, number>,
  )

  function handleSaveVehicle(vehicle: Omit<Vehicle, 'createdAt'>) {
    const request = vehicle.id ? updateVehicle(vehicle.id, vehicle) : createVehicle(vehicle)
    request
      .then(() => {
        load()
        setFormTarget(undefined)
      })
      .catch(() => setError('Gagal menyimpan armada.'))
  }

  function handleDeleteVehicle(id: string) {
    deleteVehicle(id)
      .then(() => {
        load()
        setFormTarget(undefined)
      })
      .catch(() => setError('Gagal menghapus armada.'))
  }

  return (
    <div className="fleet">
      {loading && <p className="kanban-empty">Memuat data armada...</p>}
      {error && <p className="login-error">{error}</p>}

      <div className="fleet-toolbar">
        <Button type="button" onClick={() => setFormTarget(null)}>
          <Plus size={15} /> Tambah Armada
        </Button>
      </div>

      <section className="fleet-stat-row">
        <Card className="fleet-stat">
          <span className="fleet-stat-label">Total Armada</span>
          <strong>{vehicles.length}</strong>
        </Card>
        <Card className="fleet-stat">
          <span className="fleet-stat-label">Tersedia</span>
          <strong className="text-success">{counts.Tersedia}</strong>
        </Card>
        <Card className="fleet-stat">
          <span className="fleet-stat-label">Sedang Disewa</span>
          <strong className="text-warning">{counts.Disewa}</strong>
        </Card>
        <Card className="fleet-stat">
          <span className="fleet-stat-label">Maintenance</span>
          <strong className="text-danger">{counts.Maintenance}</strong>
        </Card>
      </section>

      <div className="fleet-grid">
        {vehicles.map((v) => {
          const Icon = VEHICLE_CATEGORY_ICON[v.category]
          return (
            <Card
              key={v.id}
              className="fleet-card fleet-card-clickable"
              onClick={() => navigate(`/fleet/${v.id}`)}
            >
              <div className="fleet-card-media">
                {v.image ? (
                  <img src={v.image} alt={v.name} className="fleet-media-image" />
                ) : (
                  <>
                    <span className="fleet-media-glow" />
                    <Icon size={64} className="fleet-media-icon" />
                  </>
                )}
                <span className="fleet-media-badge">
                  <Badge tone={STATUS_TONE[v.status]}>{v.status}</Badge>
                </span>
                <button
                  type="button"
                  className="fleet-edit-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFormTarget(v)
                  }}
                  title="Edit armada"
                >
                  <Pencil size={13} />
                </button>
              </div>
              <div className="fleet-card-body">
                <h3>{v.name}</h3>
                <span className="fleet-category">{v.category}</span>
                <div className="fleet-meta">
                  <span>{v.plate}</span>
                  <span className="fleet-meta-sep">•</span>
                  <span>
                    <Users size={12} /> {v.seats} kursi
                  </span>
                </div>
                <div className="fleet-rate">
                  <strong>{formatRupiah(v.monthlyRate)}</strong>
                  <span>/bulan</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {formTarget !== undefined && (
        <VehicleFormModal
          vehicle={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSave={handleSaveVehicle}
          onDelete={handleDeleteVehicle}
        />
      )}
    </div>
  )
}
