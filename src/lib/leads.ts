import type { ComponentType } from 'react'
import { Flame, Thermometer, Snowflake } from 'lucide-react'
import { taskColumns, type KanbanTask, type LeadTemperature, type TaskStatus } from '../data/mock'

export const TEMPERATURE_META: Record<
  LeadTemperature,
  { label: string; icon: ComponentType<{ size?: number }>; cssClass: string }
> = {
  Hot: { label: 'Hot', icon: Flame, cssClass: 'temp-hot' },
  Warm: { label: 'Warm', icon: Thermometer, cssClass: 'temp-warm' },
  Cold: { label: 'Cold', icon: Snowflake, cssClass: 'temp-cold' },
}

export const TEMPERATURE_OPTIONS: LeadTemperature[] = ['Hot', 'Warm', 'Cold']

/**
 * Columns of the import template / export file, in order. `header` is what people see
 * in Excel; on import a column is recognised by its header or its key (case-insensitive,
 * a trailing "*" is ignored), so older CSVs with key headers still import.
 */
export const LEAD_COLUMNS = [
  { key: 'title', header: 'Nama Deal', required: true, width: 34 },
  { key: 'customer', header: 'Customer', required: true, width: 24 },
  { key: 'phone', header: 'No. Telepon', required: true, width: 18 },
  { key: 'email', header: 'Email', required: false, width: 26 },
  { key: 'vehicle', header: 'Mobil / Armada', required: true, width: 22 },
  { key: 'temperature', header: 'Temperature', required: false, width: 14 },
  { key: 'amount', header: 'Nilai (Rp)', required: false, width: 16 },
  { key: 'status', header: 'Status', required: false, width: 18 },
  { key: 'createdAt', header: 'Tanggal Masuk', required: false, width: 16 },
  { key: 'dueDate', header: 'Target / Jatuh Tempo', required: false, width: 20 },
  { key: 'notes', header: 'Catatan', required: false, width: 40 },
] as const

export type LeadColumnKey = (typeof LEAD_COLUMNS)[number]['key']

export function generateLeadId(): string {
  return `t-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export function statusLabel(status: TaskStatus): string {
  return taskColumns.find((c) => c.id === status)?.title ?? status
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function todayLocalIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Accepts YYYY-MM-DD, or D/M/YYYY and D-M-YYYY (Indonesian day-first). Returns YYYY-MM-DD or ''. */
function parseDateInput(value: string): string {
  let y: number, m: number, d: number
  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  const dayFirst = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
  else if (dayFirst) [d, m, y] = [Number(dayFirst[1]), Number(dayFirst[2]), Number(dayFirst[3])]
  else return ''
  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return ''
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function normalizeHeader(header: string): LeadColumnKey | null {
  const h = header.replace(/\*/g, '').trim().toLowerCase()
  const col = LEAD_COLUMNS.find((c) => c.key.toLowerCase() === h || c.header.toLowerCase() === h)
  return col?.key ?? null
}

/** Turns one spreadsheet/CSV row into a lead, or null when a required column is empty. */
export function rowToLead(row: string[], headers: string[]): KanbanTask | null {
  const keys = headers.map(normalizeHeader)
  const get = (key: LeadColumnKey) => {
    const idx = keys.indexOf(key)
    return idx >= 0 ? (row[idx] ?? '').trim() : ''
  }

  // Same required fields as the backend, so a row that would be rejected is counted as skipped.
  const title = get('title')
  const customer = get('customer')
  const phone = get('phone')
  const vehicle = get('vehicle')
  if (!title || !customer || !phone || !vehicle) return null

  // Case-insensitive ("hot", "HOT" → Hot); empty or unknown values default to Cold for imports.
  const rawTemperature = get('temperature').toLowerCase()
  const temperature: LeadTemperature = TEMPERATURE_OPTIONS.find((t) => t.toLowerCase() === rawTemperature) ?? 'Cold'

  // Accepts the label shown in the template dropdown ("Sedang Berjalan") or the id ("berjalan").
  const rawStatus = get('status').toLowerCase()
  const status: TaskStatus =
    taskColumns.find((c) => c.id === rawStatus || c.title.toLowerCase() === rawStatus)?.id ?? 'inquiry'

  const rawAmount = get('amount').replace(/[^0-9]/g, '')
  const amount = rawAmount ? parseInt(rawAmount, 10) : 0

  const createdAt = parseDateInput(get('createdAt')) || todayLocalIso()
  const dueDate = parseDateInput(get('dueDate')) || createdAt

  const email = get('email')

  return {
    id: generateLeadId(),
    title,
    customer,
    phone,
    // Optional: an invalid address is dropped rather than failing the whole import.
    email: EMAIL_RE.test(email) ? email : undefined,
    vehicle,
    temperature,
    amount,
    status,
    createdAt,
    dueDate,
    notes: get('notes') || undefined,
  }
}

const EXAMPLE_TITLE = 'CONTOH - Wedding Amanda & Rizky'
const EXAMPLE_CUSTOMER = 'CONTOH - Nama Customer'

/** The template's example row; imports skip it so it never becomes a real lead. */
export function isTemplateExample(lead: Pick<KanbanTask, 'title' | 'customer'>): boolean {
  return lead.title === EXAMPLE_TITLE && lead.customer === EXAMPLE_CUSTOMER
}

export function templateExampleLead(): KanbanTask {
  const today = todayLocalIso()
  return {
    id: '',
    title: EXAMPLE_TITLE,
    customer: EXAMPLE_CUSTOMER,
    phone: '+62 812 0000 0000',
    email: 'customer@contoh.com',
    vehicle: 'Alphard 2024',
    temperature: 'Cold',
    amount: 45_000_000,
    status: 'inquiry',
    createdAt: today,
    dueDate: today,
    notes: 'Baris contoh ini otomatis dilewati saat import',
  }
}
