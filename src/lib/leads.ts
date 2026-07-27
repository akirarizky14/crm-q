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

export const LEAD_CSV_HEADERS = [
  'title',
  'customer',
  'phone',
  'vehicle',
  'temperature',
  'amount',
  'status',
  'createdAt',
  'dueDate',
  'notes',
] as const

export function generateLeadId(): string {
  return `t-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export function leadToCsvRow(task: KanbanTask): string[] {
  return [
    task.title,
    task.customer,
    task.phone,
    task.vehicle,
    task.temperature,
    String(task.amount),
    task.status,
    task.createdAt,
    task.dueDate,
    task.notes ?? '',
  ]
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function csvRowToLead(row: string[], headers: string[]): KanbanTask | null {
  const get = (key: string) => {
    const idx = headers.indexOf(key)
    return idx >= 0 ? (row[idx] ?? '').trim() : ''
  }

  const title = get('title')
  const customer = get('customer')
  if (!title || !customer) return null

  const rawTemperature = get('temperature')
  const temperature: LeadTemperature = (['Hot', 'Warm', 'Cold'] as const).includes(rawTemperature as LeadTemperature)
    ? (rawTemperature as LeadTemperature)
    : 'Warm'

  const rawStatus = get('status')
  const status: TaskStatus = taskColumns.some((c) => c.id === rawStatus) ? (rawStatus as TaskStatus) : 'inquiry'

  const rawAmount = get('amount').replace(/[^0-9]/g, '')
  const amount = rawAmount ? parseInt(rawAmount, 10) : 0

  const rawCreatedAt = get('createdAt')
  const createdAt = isValidIsoDate(rawCreatedAt) ? rawCreatedAt : todayIso()

  const rawDueDate = get('dueDate')
  const dueDate = isValidIsoDate(rawDueDate) ? rawDueDate : createdAt

  return {
    id: generateLeadId(),
    title,
    customer,
    phone: get('phone'),
    vehicle: get('vehicle'),
    temperature,
    amount,
    status,
    createdAt,
    dueDate,
    notes: get('notes') || undefined,
  }
}

export const IMPORT_TEMPLATE_EXAMPLE_ROW = [
  'Wedding Contoh & Pasangan',
  'Nama Customer',
  '+62 812 0000 0000',
  'Alphard 2024',
  'Warm',
  '45000000',
  'inquiry',
  todayIso(),
  todayIso(),
  'Catatan opsional',
]
