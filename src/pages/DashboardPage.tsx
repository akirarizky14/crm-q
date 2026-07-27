import { ArrowUpRight, MoreHorizontal, Phone, Mail, Calendar, Link as LinkIcon, Plus, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { Avatar, AvatarStack } from '../components/ui/Avatar'
import {
  dashboardStats,
  interactionHistory,
  funnelStages,
  funnelTotal,
  calendarMonth,
  calendarTasks,
  primaryContact,
} from '../data/mock'
import './DashboardPage.css'

export function DashboardPage() {
  return (
    <div className="dashboard">
      <section className="stat-row">
        {dashboardStats.map((s) => (
          <Card key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">
              <span className="stat-delta">{s.delta}</span>
              {s.sub}
            </div>
          </Card>
        ))}
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <Card className="section-card">
            <div className="section-head">
              <h3>Riwayat Kontrak</h3>
              <div className="section-head-actions">
                <IconButton title="Lainnya">
                  <MoreHorizontal size={16} />
                </IconButton>
                <IconButton title="Buka">
                  <ArrowUpRight size={16} />
                </IconButton>
              </div>
            </div>
            <div className="interaction-grid">
              {interactionHistory.map((item) => (
                <div key={item.id} className={`interaction-tile tile-${item.variant}`}>
                  <div className="tile-top">
                    <span className="tile-date">{item.date}</span>
                    <IconButton tone={item.variant === 'light' ? 'light' : 'dark'} title="Lainnya">
                      <MoreHorizontal size={14} />
                    </IconButton>
                  </div>
                  <div className="tile-body">
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>
                  <div className="tile-bottom">
                    <span className="tile-amount">{item.amount}</span>
                    <AvatarStack labels={Array.from({ length: item.people }, (_, i) => item.title + i)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="dashboard-row">
            <Card className="section-card calendar-card">
              <div className="section-head">
                <h3>Jadwal Task</h3>
                <Link to="/tasks" className="section-link">
                  Lihat semua
                </Link>
              </div>
              <div className="calendar-month">{calendarMonth}</div>
              <div className="calendar-grid">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const marked = calendarTasks.find((t) => t.day === day)
                  return (
                    <div key={day} className={`calendar-cell${marked ? ` marked-${marked.variant}` : ''}`}>
                      {day}
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="section-card">
              <div className="section-head">
                <h3>Pipeline Kontrak</h3>
                <IconButton title="Refresh">
                  <ArrowUpRight size={16} />
                </IconButton>
              </div>
              <div className="funnel-total">
                <span>Total Pipeline</span>
                <strong>{funnelTotal}</strong>
              </div>
              <div className="funnel-list">
                {funnelStages.map((stage) => (
                  <div key={stage.label} className="funnel-row">
                    <div className="funnel-row-head">
                      <span>{stage.label}</span>
                      <strong>{stage.amount}</strong>
                    </div>
                    <div className="funnel-bar-track">
                      <div className="funnel-bar-fill" style={{ width: `${stage.ratio * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="dashboard-side">
          <Card variant="dark" className="contact-card">
            <div className="section-head-actions contact-card-actions">
              <IconButton tone="dark" title="Telepon">
                <Phone size={15} />
              </IconButton>
              <IconButton tone="dark" title="Tambah">
                <Plus size={15} />
              </IconButton>
            </div>
            <Avatar label={primaryContact.initials} size={64} />
            <h3>
              {primaryContact.firstName} {primaryContact.lastName}
            </h3>
            <p className="contact-role">
              {primaryContact.role} — {primaryContact.company}
            </p>
          </Card>

          <Card className="section-card detail-card">
            <div className="section-head">
              <h3>Detail Informasi</h3>
              <IconButton title="Edit">
                <Pencil size={15} />
              </IconButton>
            </div>
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Nama Depan</dt>
                <dd>{primaryContact.firstName}</dd>
              </div>
              <div className="detail-row">
                <dt>Nama Belakang</dt>
                <dd>{primaryContact.lastName}</dd>
              </div>
              <div className="detail-row">
                <dt>
                  <Mail size={13} /> Email
                </dt>
                <dd>{primaryContact.email}</dd>
              </div>
              <div className="detail-row">
                <dt>
                  <Phone size={13} /> No. Telepon
                </dt>
                <dd>{primaryContact.phone}</dd>
              </div>
              <div className="detail-row">
                <dt>
                  <LinkIcon size={13} /> Perusahaan
                </dt>
                <dd>{primaryContact.company}</dd>
              </div>
              <div className="detail-row">
                <dt>
                  <Calendar size={13} /> Terakhir Dihubungi
                </dt>
                <dd>{primaryContact.lastContacted}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}
