import { useState, type ChangeEvent } from 'react'
import { FileDown, Upload } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { parseCsv, toCsv, downloadCsv } from '../../lib/csv'
import { LEAD_CSV_HEADERS, IMPORT_TEMPLATE_EXAMPLE_ROW, csvRowToLead } from '../../lib/leads'
import type { KanbanTask } from '../../data/mock'
import './tasks-forms.css'

interface ImportDialogProps {
  onClose: () => void
  onImport: (tasks: KanbanTask[]) => void
}

export function ImportDialog({ onClose, onImport }: ImportDialogProps) {
  const [summary, setSummary] = useState<{ imported: number; skipped: number } | null>(null)

  function handleDownloadTemplate() {
    const csv = toCsv([...LEAD_CSV_HEADERS], [IMPORT_TEMPLATE_EXAMPLE_ROW])
    downloadCsv('crown-crm-template-leads.csv', csv)
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const rows = parseCsv(text)
      if (rows.length < 2) {
        setSummary({ imported: 0, skipped: 0 })
        return
      }
      const [headerRow, ...dataRows] = rows
      const headers = headerRow.map((h) => h.trim())
      const leads: KanbanTask[] = []
      let skipped = 0

      for (const row of dataRows) {
        const lead = csvRowToLead(row, headers)
        if (lead) leads.push(lead)
        else skipped++
      }

      onImport(leads)
      setSummary({ imported: leads.length, skipped })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <Modal title="Import Lead" onClose={onClose}>
      <div className="import-steps">
        <div className="import-step">
          <span className="import-step-label">1. Unduh Template</span>
          <button type="button" className="import-template-link" onClick={handleDownloadTemplate}>
            <FileDown size={15} /> Download Template CSV
          </button>
        </div>

        <div className="import-step">
          <span className="import-step-label">2. Isi &amp; Upload</span>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>
            Isi template sesuai kolom (temperature: Hot/Warm/Cold, status: inquiry/survey/kontrak/berjalan/selesai,
            tanggal format YYYY-MM-DD), lalu upload di sini.
          </p>
          <label className="import-template-link" style={{ cursor: 'pointer' }}>
            <Upload size={15} /> Pilih File CSV
            <input type="file" accept=".csv,text/csv" className="import-file-input" onChange={handleFile} hidden />
          </label>
        </div>

        {summary && (
          <div className={`import-summary${summary.skipped > 0 ? ' has-errors' : ''}`}>
            {summary.imported} lead berhasil diimport
            {summary.skipped > 0 ? `, ${summary.skipped} baris dilewati karena data tidak valid.` : '.'}
          </div>
        )}
      </div>
    </Modal>
  )
}
