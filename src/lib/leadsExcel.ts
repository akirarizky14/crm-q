import type { CellValue, Worksheet } from 'exceljs'
import { taskColumns, type KanbanTask } from '../data/mock'
import { parseCsv } from './csv'
import { LEAD_COLUMNS, TEMPERATURE_OPTIONS, isTemplateExample, statusLabel } from './leads'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const SHEET_NAME = 'Leads'
/** Rows below the data that still get the Temperature/Status dropdowns, for typing new leads. */
const EXTRA_INPUT_ROWS = 300

// exceljs is ~1 MB, so it is only loaded when someone actually imports or exports.
async function loadExcelJs(): Promise<typeof import('exceljs')> {
  const mod = (await import('exceljs')) as typeof import('exceljs') & { default?: typeof import('exceljs') }
  return mod.default ?? mod
}

/** A YYYY-MM-DD string as a Date at UTC midnight, which Excel shows as exactly that day. */
function isoToExcelDate(iso: string): Date | string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))) : iso
}

function cellToString(value: CellValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) {
    // exceljs returns dates at UTC midnight; read the UTC parts so the day doesn't shift.
    const y = value.getUTCFullYear()
    const m = String(value.getUTCMonth() + 1).padStart(2, '0')
    const d = String(value.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof value !== 'object') return String(value)
  if ('richText' in value) return value.richText.map((part) => part.text).join('')
  if ('formula' in value || 'sharedFormula' in value) return cellToString((value as { result?: CellValue }).result ?? null)
  // Excel turns typed emails into hyperlinks: { text, hyperlink }.
  if ('hyperlink' in value) return cellToString(value.text as CellValue)
  if ('error' in value) return ''
  return ''
}

function addDropdowns(sheet: Worksheet, lastRow: number) {
  const temperatureCol = sheet.getColumn('temperature').letter
  const statusCol = sheet.getColumn('status').letter
  const temperatureList = `"${TEMPERATURE_OPTIONS.join(',')}"`
  const statusList = `"${taskColumns.map((c) => c.title).join(',')}"`

  for (let row = 2; row <= lastRow; row++) {
    sheet.getCell(`${temperatureCol}${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [temperatureList],
      showErrorMessage: true,
      errorTitle: 'Temperature tidak valid',
      error: `Pilih salah satu: ${TEMPERATURE_OPTIONS.join(', ')}`,
    }
    sheet.getCell(`${statusCol}${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [statusList],
      showErrorMessage: true,
      errorTitle: 'Status tidak valid',
      error: 'Pilih status dari daftar',
    }
  }
}

function addInstructionsSheet(workbook: import('exceljs').Workbook) {
  const sheet = workbook.addWorksheet('Petunjuk')
  sheet.getColumn(1).width = 100
  const lines = [
    'Cara mengisi template import lead',
    '',
    '1. Isi data di sheet "Leads", satu baris untuk satu lead. Baris CONTOH (abu-abu) otomatis dilewati saat import.',
    '2. Kolom bertanda * wajib diisi: Nama Deal, Customer, No. Telepon, Mobil / Armada. Baris tanpa kolom ini dilewati.',
    '3. Email opsional. Email yang formatnya salah akan dikosongkan.',
    `4. Temperature: pilih dari dropdown (${TEMPERATURE_OPTIONS.join(' / ')}). Jika kosong, otomatis Cold.`,
    `5. Status: pilih dari dropdown (${taskColumns.map((c) => c.title).join(' / ')}). Jika kosong, otomatis Inquiry.`,
    '6. Tanggal: isi sebagai tanggal Excel, atau ketik 2026-11-23 / 23/11/2026. Tanggal Masuk kosong = hari ini.',
    '7. Nilai (Rp): angka saja, tanpa "Rp" (contoh 45000000).',
    '8. Simpan sebagai .xlsx, lalu upload lewat tombol Import di CRM.',
  ]
  lines.forEach((text, i) => {
    const cell = sheet.getCell(`A${i + 1}`)
    cell.value = text
    cell.alignment = { wrapText: true, vertical: 'top' }
    if (i === 0) cell.font = { bold: true, size: 13 }
  })
}

/** Builds the leads workbook (used for both the import template and exports) as .xlsx bytes. */
export async function buildLeadsWorkbook(leads: KanbanTask[]): Promise<ArrayBuffer> {
  const ExcelJS = await loadExcelJs()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Crown CRM'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(SHEET_NAME, { views: [{ state: 'frozen', ySplit: 1 }] })
  sheet.columns = LEAD_COLUMNS.map((c) => ({
    header: c.required ? `${c.header} *` : c.header,
    key: c.key,
    width: c.width,
  }))

  const header = sheet.getRow(1)
  header.font = { bold: true, color: { argb: 'FF3A2E12' } }
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E6C4' } }
  header.alignment = { vertical: 'middle' }
  header.height = 22

  // Text format keeps leading zeros / "+62" in phone numbers; dates and amounts get readable formats.
  sheet.getColumn('phone').numFmt = '@'
  sheet.getColumn('amount').numFmt = '#,##0'
  sheet.getColumn('createdAt').numFmt = 'yyyy-mm-dd'
  sheet.getColumn('dueDate').numFmt = 'yyyy-mm-dd'

  for (const lead of leads) {
    const row = sheet.addRow({
      title: lead.title,
      customer: lead.customer,
      phone: lead.phone,
      email: lead.email ?? '',
      vehicle: lead.vehicle,
      temperature: lead.temperature,
      amount: lead.amount,
      status: statusLabel(lead.status),
      createdAt: isoToExcelDate(lead.createdAt),
      dueDate: isoToExcelDate(lead.dueDate),
      notes: lead.notes ?? '',
    })
    if (isTemplateExample(lead)) row.font = { italic: true, color: { argb: 'FF8A8A8A' } }
  }

  addDropdowns(sheet, leads.length + 1 + EXTRA_INPUT_ROWS)
  addInstructionsSheet(workbook)

  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer
}

export async function downloadLeadsWorkbook(filename: string, leads: KanbanTask[]): Promise<void> {
  const buffer = await buildLeadsWorkbook(leads)
  const url = URL.createObjectURL(new Blob([buffer], { type: XLSX_MIME }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export class UnsupportedFileError extends Error {}

/** Reads an .xlsx (sheet "Leads", or the first sheet) or .csv file into a header row plus data rows. */
export async function readLeadRows(file: File): Promise<{ headers: string[]; rows: string[][] }> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.csv')) {
    const [headers = [], ...rows] = parseCsv(await file.text())
    return { headers, rows }
  }
  if (!name.endsWith('.xlsx')) {
    throw new UnsupportedFileError('Format file tidak didukung. Gunakan file Excel .xlsx (atau .csv).')
  }

  const ExcelJS = await loadExcelJs()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const sheet = workbook.getWorksheet(SHEET_NAME) ?? workbook.worksheets[0]
  if (!sheet) return { headers: [], rows: [] }

  const columnCount = sheet.getRow(1).cellCount
  const readRow = (rowNumber: number) => {
    const row = sheet.getRow(rowNumber)
    return Array.from({ length: columnCount }, (_, i) => cellToString(row.getCell(i + 1).value).trim())
  }

  const headers = readRow(1)
  const rows: string[][] = []
  for (let r = 2; r <= sheet.rowCount; r++) {
    const values = readRow(r)
    // Template rows below the data carry dropdowns but no values; skip fully empty rows.
    if (values.some((v) => v !== '')) rows.push(values)
  }
  return { headers, rows }
}
