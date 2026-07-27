import { Link } from 'react-router-dom'
import {
  Crown,
  Car,
  ShieldCheck,
  Sparkles,
  Check,
  Quote,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  Users,
} from 'lucide-react'
import { useLandingContent } from '../lib/landingContent'
import { vehicles } from '../data/mock'
import { packages, testimonials } from '../data/landing'
import { formatRupiah } from '../lib/format'
import './LandingPage.css'

export function LandingPage() {
  const { content } = useLandingContent()
  const { hero, contact } = content
  const showcase = vehicles.slice(0, 3)

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-brand">
          <span className="landing-logo">
            <Crown size={18} />
          </span>
          <span>Crown Car Rental</span>
        </div>
        <nav className="landing-nav-links">
          <a href="#paket">Paket</a>
          <a href="#armada">Armada</a>
          <a href="#testimoni">Testimoni</a>
          <a href="#kontak">Kontak</a>
        </nav>
        <Link to="/login" className="landing-nav-cta">
          Masuk
        </Link>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-hero-content">
          <span className="landing-hero-tag">
            <Sparkles size={14} /> {hero.eyebrow}
          </span>
          <h1>{hero.headline}</h1>
          <p>{hero.subheadline}</p>
          <div className="landing-hero-actions">
            <a href={hero.ctaWhatsapp} target="_blank" rel="noreferrer" className="landing-btn-primary">
              <MessageCircle size={16} /> {hero.ctaLabel}
            </a>
            <a href="#paket" className="landing-btn-ghost">
              Lihat Paket
            </a>
          </div>
          <div className="landing-hero-stats">
            <div>
              <Car size={18} />
              <div>
                <strong>32</strong>
                <span>Armada Aktif</span>
              </div>
            </div>
            <div>
              <ShieldCheck size={18} />
              <div>
                <strong>120+</strong>
                <span>Kontrak Selesai</span>
              </div>
            </div>
            <div>
              <Users size={18} />
              <div>
                <strong>15+</strong>
                <span>Mitra Affiliate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="paket">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Paket & Harga</span>
          <h2>Sewa bulanan, sesuai kebutuhan Anda</h2>
          <p>Untuk pernikahan maupun operasional perusahaan — kontrak fleksibel, dapat diperpanjang setiap bulan.</p>
        </div>
        <div className="landing-packages">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`landing-package-card${pkg.highlighted ? ' highlighted' : ''}`}>
              {pkg.highlighted && <span className="landing-package-badge">Paling Diminati</span>}
              <h3>{pkg.name}</h3>
              <span className="landing-package-audience">{pkg.audience}</span>
              <strong className="landing-package-price">{pkg.monthlyPrice}</strong>
              <ul>
                {pkg.features.map((f) => (
                  <li key={f}>
                    <Check size={14} /> {f}
                  </li>
                ))}
              </ul>
              <a href={hero.ctaWhatsapp} target="_blank" rel="noreferrer" className="landing-package-cta">
                Tanya Ketersediaan
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="armada">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Showcase Armada</span>
          <h2>Sebagian armada unggulan kami</h2>
          <p>Semua unit terawat rutin dengan pengemudi berpengalaman.</p>
        </div>
        <div className="landing-fleet-grid">
          {showcase.map((v) => (
            <div key={v.id} className="landing-fleet-card">
              <span className="landing-fleet-icon">
                <Car size={20} />
              </span>
              <h3>{v.name}</h3>
              <span className="landing-fleet-category">{v.category}</span>
              <strong>{formatRupiah(v.monthlyRate)}</strong>
              <span className="landing-fleet-sub">/bulan</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="testimoni">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Testimoni</span>
          <h2>Dipercaya klien wedding & korporat</h2>
        </div>
        <div className="landing-testimonial-grid">
          {testimonials.map((t) => (
            <div key={t.id} className="landing-testimonial-card">
              <Quote size={20} className="landing-quote-icon" />
              <p>&ldquo;{t.quote}&rdquo;</p>
              <div className="landing-testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer" id="kontak">
        <div className="landing-footer-brand">
          <span className="landing-logo">
            <Crown size={18} />
          </span>
          <span>Crown Car Rental</span>
          <p>Sewa mobil bulanan untuk wedding &amp; korporat.</p>
        </div>
        <div className="landing-footer-contact">
          <div>
            <MessageCircle size={15} /> {contact.whatsapp}
          </div>
          <div>
            <Mail size={15} /> {contact.email}
          </div>
          <div>
            <MapPin size={15} /> {contact.address}
          </div>
          <div>
            <Clock size={15} /> {contact.hours}
          </div>
        </div>
      </footer>
    </div>
  )
}
