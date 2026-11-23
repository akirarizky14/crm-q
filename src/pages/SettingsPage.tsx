import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { updateSiteSettings, type SiteSettings } from '../api/settings'
import { uploadImage } from '../api/uploads'
import { ApiError } from '../api/client'
import './SettingsPage.css'

const CROWN_URL = import.meta.env.VITE_CROWN_URL || 'http://localhost:5173'

export function SettingsPage() {
  const [draft, setDraft] = useState<Partial<SiteSettings>>({})
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'crown-cms-patch') {
        setDraft((d) => ({ ...d, ...e.data.patch }))
        setDirty(true)
        setSaved(false)
        return
      }

      if (e.data?.type === 'crown-cms-upload') {
        const { requestId, file } = e.data
        const source = e.source as Window | null
        const fail = (message: string) => {
          setError(`Upload gambar gagal: ${message}`)
          source?.postMessage({ type: 'crown-cms-upload-result', requestId, error: message }, '*')
        }
        if (!(file instanceof Blob)) {
          fail('Data file dari preview tidak valid.')
          return
        }
        setError('')
        uploadImage(file as File)
          .then(({ url }) => source?.postMessage({ type: 'crown-cms-upload-result', requestId, url }, '*'))
          .catch((err: unknown) => {
            // Pass the server's reason (file too large, wrong type, session expired…) through
            // instead of a bare "Upload gagal", so the cause is visible.
            fail(
              err instanceof ApiError
                ? err.message
                : 'Tidak bisa terhubung ke server. Cek koneksi atau VITE_API_URL.'
            )
          })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  function handleSave() {
    setSaving(true)
    setError('')
    updateSiteSettings(draft)
      .then(() => {
        setDirty(false)
        setDraft({})
        setSaved(true)
      })
      .catch(() => setError('Gagal menyimpan pengaturan.'))
      .finally(() => setSaving(false))
  }

  return (
    <div className="settings-live-editor">
      <div className="settings-preview-toolbar">
        <span>Live Preview crowncar.id — klik langsung teks atau gambar untuk edit</span>
        <div className="settings-toolbar-actions">
          {error && <span className="settings-error">{error}</span>}
          {saved && !dirty && <span className="settings-saved">Tersimpan.</span>}
          <Button type="button" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          <button
            type="button"
            className="settings-refresh-btn"
            onClick={() => setIframeKey((k) => k + 1)}
            title="Muat ulang preview"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
      <iframe
        key={iframeKey}
        className="settings-preview-frame"
        src={`${CROWN_URL}/?cms=1`}
        title="Live preview crowncar.id"
      />
    </div>
  )
}
