import { useState, type ChangeEvent } from 'react'
import { FileDown, Upload } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { isTemplateExample, rowToLead, templateExampleLead } from '../../lib/leads'
import { downloadLeadsWorkbook, readLeadRows, UnsupportedFileError } from '../../lib/leadsExcel'
import type { KanbanTask } from '../../data/mock'
import './tasks-forms.css'

interface ImportDialogProps {
  onClose: () => void
  onImport: (tasks: KanbanTask[]) => Promise<{ created: number; failed: number }>
}

interface ImportSummary {
  imported: number
  skipped: number
  failed: number
}

export function ImportDialog({ onClose, onImport }: ImportDialogProps) {
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [fileError, setFileError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  function handleDownloadTemplate() {
    setBusy('Menyiapkan template...')
    downloadLeadsWorkbook('crown-crm-template-leads.xlsx', [templateExampleLead()])
      .catch(() => setFileError('Gagal membuat template Excel.'))
      .finally(() => setBusy(null))
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setSummary(null)
    setFileError('')
    setBusy('Membaca file...')
    try {
      const { headers, rows } = await readLeadRows(file)
      const leads: KanbanTask[] = []
      let skipped = 0
      for (const row of rows) {
        const lead = rowToLead(row, headers)
        if (!lead) skipped++
        else if (!isTemplateExample(lead)) leads.push(lead)
      }

      if (leads.length === 0) {
        setSummary({ imported: 0, skipped, failed: 0 })
        return
      }

      setBusy(`Mengimpor ${leads.length} lead...`)
      const { created, failed } = await onImport(leads)
      setSummary({ imported: created, skipped, failed })
    } catch (err) {
      setFileError(
        err instanceof UnsupportedFileError
          ? err.message
          : 'File tidak bisa dibaca. Pastikan file Excel (.xlsx) dari template ini.'
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal title="Import Lead" onClose={onClose}>
      <div className="import-steps">
        <div className="import-step">
          <span className="import-step-label">1. Unduh Template</span>
          <button type="button" className="import-template-link" onClick={handleDownloadTemplate} disabled={busy !== null}>
            <FileDown size={15} /> Download Template Excel
          </button>
        </div>

        <div className="import-step">
          <span className="import-step-label">2. Isi &amp; Upload</span>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>
            Isi sheet <strong>Leads</strong> di template. Kolom bertanda * wajib diisi; Temperature dan Status
            tinggal pilih dari dropdown. Petunjuk lengkap ada di sheet <strong>Petunjuk</strong>.
          </p>
          <label
            className="import-template-link"
            style={{ cursor: busy !== null ? 'wait' : 'pointer', opacity: busy !== null ? 0.6 : 1 }}
          >
            <Upload size={15} /> {busy ?? 'Pilih File Excel'}
            <input
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="import-file-input"
              onChange={handleFile}
              disabled={busy !== null}
              hidden
            />
          </label>
        </div>

        {fileError && <div className="import-summary has-errors">{fileError}</div>}

        {summary && (
          <div className={`import-summary${summary.skipped > 0 || summary.failed > 0 ? ' has-errors' : ''}`}>
            {summary.imported} lead berhasil diimport.
            {summary.skipped > 0 &&
              ` ${summary.skipped} baris dilewati (Nama Deal, Customer, No. Telepon, dan Mobil / Armada wajib diisi).`}
            {summary.failed > 0 && ` ${summary.failed} lead gagal disimpan ke server.`}
          </div>
        )}
      </div>
    </Modal>
  )
}
