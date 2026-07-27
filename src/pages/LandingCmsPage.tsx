import { useState } from 'react'
import { ExternalLink, Sparkles, MessageCircle, Check } from 'lucide-react'
import { useLandingContent } from '../lib/landingContent'
import { defaultLandingContent } from '../data/landing'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import './LandingCmsPage.css'

export function LandingCmsPage() {
  const { content, updateHero, updateContact, resetToDefault } = useLandingContent()
  const [hero, setHero] = useState(content.hero)
  const [contact, setContact] = useState(content.contact)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateHero(hero)
    updateContact(contact)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    resetToDefault()
    setHero(defaultLandingContent.hero)
    setContact(defaultLandingContent.contact)
  }

  return (
    <div className="landing-cms">
      <div className="landing-cms-toolbar">
        <a href="/" target="_blank" rel="noreferrer" className="landing-cms-preview-link">
          <ExternalLink size={14} /> Lihat Landing Page
        </a>
      </div>

      <div className="landing-cms-grid">
        <div className="landing-cms-forms">
          <Card className="section-card">
            <div className="section-head">
              <h3>Hero</h3>
            </div>
            <label className="cms-field">
              <span>Eyebrow / Tag</span>
              <input value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
            </label>
            <label className="cms-field">
              <span>Headline</span>
              <textarea
                rows={2}
                value={hero.headline}
                onChange={(e) => setHero({ ...hero, headline: e.target.value })}
              />
            </label>
            <label className="cms-field">
              <span>Subheadline</span>
              <textarea
                rows={3}
                value={hero.subheadline}
                onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
              />
            </label>
            <div className="cms-field-row">
              <label className="cms-field">
                <span>Label Tombol CTA</span>
                <input value={hero.ctaLabel} onChange={(e) => setHero({ ...hero, ctaLabel: e.target.value })} />
              </label>
              <label className="cms-field">
                <span>Link WhatsApp CTA</span>
                <input
                  value={hero.ctaWhatsapp}
                  onChange={(e) => setHero({ ...hero, ctaWhatsapp: e.target.value })}
                />
              </label>
            </div>
          </Card>

          <Card className="section-card">
            <div className="section-head">
              <h3>Info Kontak</h3>
            </div>
            <div className="cms-field-row">
              <label className="cms-field">
                <span>WhatsApp</span>
                <input
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                />
              </label>
              <label className="cms-field">
                <span>Email</span>
                <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </label>
            </div>
            <label className="cms-field">
              <span>Alamat</span>
              <input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
            </label>
            <label className="cms-field">
              <span>Jam Operasional</span>
              <input value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} />
            </label>
          </Card>

          <div className="landing-cms-actions">
            <Button type="button" onClick={handleSave}>
              {saved ? (
                <>
                  <Check size={15} /> Tersimpan
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
              Reset ke Default
            </Button>
          </div>
        </div>

        <div className="landing-cms-preview">
          <span className="landing-cms-preview-label">Preview Hero</span>
          <div className="cms-hero-preview">
            <div className="cms-hero-preview-glow" />
            <span className="cms-hero-tag">
              <Sparkles size={13} /> {hero.eyebrow || 'Eyebrow'}
            </span>
            <h2>{hero.headline || 'Headline landing page'}</h2>
            <p>{hero.subheadline || 'Subheadline akan tampil di sini.'}</p>
            <span className="cms-hero-cta">
              <MessageCircle size={14} /> {hero.ctaLabel || 'Label CTA'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
