import { useState } from 'react'
import { Handshake, Users, Wallet, Link as LinkIcon, Check, Copy } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { affiliates, affiliateSummary, type AffiliateStatus } from '../data/mock'
import { formatRupiah, formatRupiahShort } from '../lib/format'
import './AffiliatePage.css'

const STATUS_TONE: Record<AffiliateStatus, 'success' | 'neutral'> = {
  Aktif: 'success',
  Nonaktif: 'neutral',
}

export function AffiliatePage() {
  const [copied, setCopied] = useState(false)
  const referralLink = 'https://crowncarrental.id/ref/CROWN-AFF'

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="affiliate">
      <section className="affiliate-stat-row">
        <Card className="affiliate-stat">
          <span className="affiliate-stat-icon">
            <Handshake size={18} />
          </span>
          <div>
            <span className="affiliate-stat-label">Total Affiliate</span>
            <strong>{affiliateSummary.totalAffiliates}</strong>
          </div>
        </Card>
        <Card className="affiliate-stat">
          <span className="affiliate-stat-icon">
            <Users size={18} />
          </span>
          <div>
            <span className="affiliate-stat-label">Referral Bulan Ini</span>
            <strong>{affiliateSummary.referralsThisMonth}</strong>
          </div>
        </Card>
        <Card className="affiliate-stat">
          <span className="affiliate-stat-icon">
            <Wallet size={18} />
          </span>
          <div>
            <span className="affiliate-stat-label">Komisi Dibayarkan</span>
            <strong>{formatRupiahShort(affiliateSummary.commissionPaid)}</strong>
          </div>
        </Card>
      </section>

      <div className="affiliate-body">
        <Card className="section-card affiliate-table-card">
          <div className="section-head">
            <h3>Mitra Affiliate</h3>
          </div>
          <div className="affiliate-table-wrap scrollbar-thin">
            <table className="affiliate-table">
              <thead>
                <tr>
                  <th>Nama Mitra</th>
                  <th>Tipe</th>
                  <th>Kode Referral</th>
                  <th>Referral</th>
                  <th>Komisi</th>
                  <th>Diterima</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((a) => (
                  <tr key={a.id}>
                    <td className="affiliate-name">{a.name}</td>
                    <td>{a.type}</td>
                    <td>
                      <code className="affiliate-code">{a.referralCode}</code>
                    </td>
                    <td>{a.totalReferrals}</td>
                    <td>{a.commissionRate}%</td>
                    <td>{formatRupiah(a.commissionEarned)}</td>
                    <td>
                      <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card variant="dark" className="referral-card">
          <span className="referral-icon">
            <LinkIcon size={16} />
          </span>
          <h3>Link Referral Anda</h3>
          <p>Bagikan link ini ke wedding organizer atau event planner untuk mendapatkan komisi setiap kontrak sewa bulanan yang berhasil.</p>
          <div className="referral-link-row">
            <span className="referral-link">{referralLink}</span>
            <button type="button" className="referral-copy" onClick={copyLink}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
