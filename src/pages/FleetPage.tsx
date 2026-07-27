import { Car, Users } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { vehicles, type VehicleStatus } from '../data/mock'
import { formatRupiah } from '../lib/format'
import './FleetPage.css'

const STATUS_TONE: Record<VehicleStatus, 'success' | 'warning' | 'danger'> = {
  Tersedia: 'success',
  Disewa: 'warning',
  Maintenance: 'danger',
}

export function FleetPage() {
  const counts = vehicles.reduce(
    (acc, v) => {
      acc[v.status] += 1
      return acc
    },
    { Tersedia: 0, Disewa: 0, Maintenance: 0 } as Record<VehicleStatus, number>,
  )

  return (
    <div className="fleet">
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
        {vehicles.map((v) => (
          <Card key={v.id} className="fleet-card">
            <div className="fleet-card-top">
              <span className="fleet-icon">
                <Car size={20} />
              </span>
              <Badge tone={STATUS_TONE[v.status]}>{v.status}</Badge>
            </div>
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
          </Card>
        ))}
      </div>
    </div>
  )
}
