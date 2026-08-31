import { useEffect, useRef, useState, type FormEvent } from 'react'
import { RefreshCw, Upload } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { fetchSiteSettings, updateSiteSettings, type SiteSettings } from '../api/settings'
import { uploadImage } from '../api/uploads'
import '../pages/BlogFormPage.css'
import './SettingsPage.css'

const CROWN_URL = import.meta.env.VITE_CROWN_URL || 'http://localhost:5173'

type Section = 'navbar' | 'hero' | 'footer'

function emptySettings(): SiteSettings {
  return {
    heroEyebrow: '',
    heroHeadline: '',
    heroSubheadline: '',
    heroCtaLabel: '',
    heroCtaWhatsapp: '',
    contactWhatsapp: '',
    contactEmail: '',
    contactAddress: '',
    contactHours: '',
    heroImage: '',
    navbarLogo: '',
    navbarCtaLabel: '',
    footerTagline: '',
    footerSecondaryWhatsapp: '',
    footerInstagram: '',
    footerMapsUrl: '',
    footerCopyright: '',
  }
}

export function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<'heroImage' | 'navbarLogo' | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<SiteSettings>(emptySettings())
  const [activeSection, setActiveSection] = useState<Section | null>(null)
  const [iframeKey, setIframeKey] = useState(0)

  const heroFileRef = useRef<HTMLInputElement>(null)
  const logoFileRef = useRef<HTMLInputElement>(null)
  const navbarSectionRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const footerSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSiteSettings()
      .then(setForm)
      .catch(() => setError('Gagal memuat pengaturan situs.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type !== 'crown-cms-edit') return
      const section = e.data.section as Section
      const target =
        section === 'navbar' ? navbarSectionRef.current : section === 'hero' ? heroSectionRef.current : section === 'footer' ? footerSectionRef.current : null
      if (!target) return
      setActiveSection(section)
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.setTimeout(() => setActiveSection((s) => (s === section ? null : s)), 2000)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  function handleImageUpload(field: 'heroImage' | 'navbarLogo', file: File | undefined, inputEl: HTMLInputElement | null) {
    if (!file) return
    setUploadingField(field)
    setError('')
    uploadImage(file)
      .then(({ url }) => setForm((prev) => ({ ...prev, [field]: url })))
      .catch(() => setError('Gagal mengunggah foto.'))
      .finally(() => {
        setUploadingField(null)
        if (inputEl) inputEl.value = ''
      })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    updateSiteSettings(form)
      .then((saved) => {
        setForm(saved)
        setSaved(true)
        setIframeKey((k) => k + 1)
      })
      .catch(() => setError('Gagal menyimpan pengaturan.'))
      .finally(() => setSaving(false))
  }

  if (loading) {
    return <p className="kanban-empty">Memuat pengaturan...</p>
  }

  return (
    <div className="settings-live-editor">
      <div className="settings-preview-col">
        <div className="settings-preview-toolbar">
          <span>Live Preview crowncar.id — klik navbar, hero, atau footer untuk edit</span>
          <button
            type="button"
            className="settings-refresh-btn"
            onClick={() => setIframeKey((k) => k + 1)}
            title="Muat ulang preview"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        <iframe
          key={iframeKey}
          className="settings-preview-frame"
          src={`${CROWN_URL}/?cms=1`}
          title="Live preview crowncar.id"
        />
      </div>

      <div className="settings-form-panel">
        <Card className="blog-form-card">
          {error && <p className="login-error">{error}</p>}
          {saved && <p className="settings-saved">Perubahan tersimpan.</p>}

          <form className="blog-form" onSubmit={handleSubmit}>
            <div ref={navbarSectionRef} className={`settings-section ${activeSection === 'navbar' ? 'highlight' : ''}`}>
              <h3 className="settings-section-title">Navbar</h3>

              <label className="blog-field">
                <span>Logo</span>
                <div className="settings-hero-upload">
                  {form.navbarLogo && <img src={form.navbarLogo} alt="Logo" className="settings-logo-preview" />}
                  <div className="settings-hero-upload-actions">
                    <input
                      ref={logoFileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => handleImageUpload('navbarLogo', e.target.files?.[0], logoFileRef.current)}
                      id="navbar-logo-input"
                      className="settings-file-input"
                    />
                    <label htmlFor="navbar-logo-input" className="btn btn-ghost settings-upload-btn">
                      <Upload size={14} /> {uploadingField === 'navbarLogo' ? 'Mengunggah...' : 'Ganti Logo'}
                    </label>
                  </div>
                </div>
              </label>

              <label className="blog-field">
                <span>Label Tombol (kanan atas)</span>
                <input
                  value={form.navbarCtaLabel ?? ''}
                  onChange={(e) => setForm({ ...form, navbarCtaLabel: e.target.value })}
                  placeholder="Sewa Sekarang"
                />
              </label>
            </div>

            <div ref={heroSectionRef} className={`settings-section ${activeSection === 'hero' ? 'highlight' : ''}`}>
              <h3 className="settings-section-title">Hero (halaman depan)</h3>

              <label className="blog-field">
                <span>Foto Hero</span>
                <div className="settings-hero-upload">
                  {form.heroImage && <img src={form.heroImage} alt="Foto hero" className="settings-hero-preview" />}
                  <div className="settings-hero-upload-actions">
                    <input
                      ref={heroFileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => handleImageUpload('heroImage', e.target.files?.[0], heroFileRef.current)}
                      id="hero-image-input"
                      className="settings-file-input"
                    />
                    <label htmlFor="hero-image-input" className="btn btn-ghost settings-upload-btn">
                      <Upload size={14} /> {uploadingField === 'heroImage' ? 'Mengunggah...' : 'Ganti Foto'}
                    </label>
                  </div>
                </div>
              </label>

              <label className="blog-field">
                <span>Eyebrow</span>
                <input
                  value={form.heroEyebrow}
                  onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })}
                />
              </label>

              <label className="blog-field">
                <span>Judul Utama</span>
                <input
                  value={form.heroHeadline}
                  onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                />
              </label>

              <label className="blog-field">
                <span>Sub-judul</span>
                <textarea
                  rows={3}
                  value={form.heroSubheadline}
                  onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
                />
              </label>

              <label className="blog-field">
                <span>Label Tombol CTA</span>
                <input
                  value={form.heroCtaLabel}
                  onChange={(e) => setForm({ ...form, heroCtaLabel: e.target.value })}
                  placeholder="Lihat Mobil"
                />
              </label>
            </div>

            <div ref={footerSectionRef} className={`settings-section ${activeSection === 'footer' ? 'highlight' : ''}`}>
              <h3 className="settings-section-title">Footer</h3>

              <label className="blog-field">
                <span>Tagline</span>
                <textarea
                  rows={2}
                  value={form.footerTagline ?? ''}
                  onChange={(e) => setForm({ ...form, footerTagline: e.target.value })}
                />
              </label>

              <label className="blog-field">
                <span>Alamat</span>
                <input
                  value={form.contactAddress}
                  onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
                />
              </label>

              <label className="blog-field">
                <span>Link Google Maps</span>
                <input
                  value={form.footerMapsUrl ?? ''}
                  onChange={(e) => setForm({ ...form, footerMapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </label>

              <div className="blog-field-row">
                <label className="blog-field">
                  <span>WhatsApp Utama</span>
                  <input
                    value={form.contactWhatsapp}
                    onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                  />
                </label>
                <label className="blog-field">
                  <span>WhatsApp Kedua</span>
                  <input
                    value={form.footerSecondaryWhatsapp ?? ''}
                    onChange={(e) => setForm({ ...form, footerSecondaryWhatsapp: e.target.value })}
                  />
                </label>
              </div>

              <div className="blog-field-row">
                <label className="blog-field">
                  <span>Email</span>
                  <input
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  />
                </label>
                <label className="blog-field">
                  <span>Jam Operasional</span>
                  <input
                    value={form.contactHours}
                    onChange={(e) => setForm({ ...form, contactHours: e.target.value })}
                  />
                </label>
              </div>

              <div className="blog-field-row">
                <label className="blog-field">
                  <span>Instagram (tanpa @)</span>
                  <input
                    value={form.footerInstagram ?? ''}
                    onChange={(e) => setForm({ ...form, footerInstagram: e.target.value })}
                    placeholder="crowncarrental"
                  />
                </label>
                <label className="blog-field">
                  <span>Teks Copyright</span>
                  <input
                    value={form.footerCopyright ?? ''}
                    onChange={(e) => setForm({ ...form, footerCopyright: e.target.value })}
                  />
                </label>
              </div>
            </div>

            <div className="blog-form-actions">
              <Button type="submit" disabled={saving || uploadingField !== null}>
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
