import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { fetchSiteSettings, updateSiteSettings, type SiteSettings } from '../api/settings'
import { uploadImage } from '../api/uploads'
import '../pages/BlogFormPage.css'
import './SettingsPage.css'

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
  }
}

export function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<SiteSettings>(emptySettings())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSiteSettings()
      .then(setForm)
      .catch(() => setError('Gagal memuat pengaturan situs.'))
      .finally(() => setLoading(false))
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    uploadImage(file)
      .then(({ url }) => setForm((prev) => ({ ...prev, heroImage: url })))
      .catch(() => setError('Gagal mengunggah foto.'))
      .finally(() => {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
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
      })
      .catch(() => setError('Gagal menyimpan pengaturan.'))
      .finally(() => setSaving(false))
  }

  if (loading) {
    return <p className="kanban-empty">Memuat pengaturan...</p>
  }

  return (
    <div className="blog-form-page">
      <Card className="blog-form-card">
        <h2 className="settings-title">Pengaturan Website</h2>
        {error && <p className="login-error">{error}</p>}
        {saved && <p className="settings-saved">Perubahan tersimpan.</p>}

        <form className="blog-form" onSubmit={handleSubmit}>
          <label className="blog-field">
            <span>Foto Hero (halaman depan crowncar.id)</span>
            <div className="settings-hero-upload">
              {form.heroImage && (
                <img src={form.heroImage} alt="Foto hero" className="settings-hero-preview" />
              )}
              <div className="settings-hero-upload-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  id="hero-image-input"
                  className="settings-file-input"
                />
                <label htmlFor="hero-image-input" className="btn btn-ghost settings-upload-btn">
                  <Upload size={14} /> {uploading ? 'Mengunggah...' : 'Ganti Foto'}
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

          <div className="blog-field-row">
            <label className="blog-field">
              <span>Nomor WhatsApp</span>
              <input
                value={form.contactWhatsapp}
                onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
              />
            </label>
            <label className="blog-field">
              <span>Email</span>
              <input
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </label>
          </div>

          <div className="blog-field-row">
            <label className="blog-field">
              <span>Alamat</span>
              <input
                value={form.contactAddress}
                onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
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

          <div className="blog-form-actions">
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
