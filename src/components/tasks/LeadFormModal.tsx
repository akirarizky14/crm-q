import { useRef, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { taskColumns, type KanbanTask, type LeadTemperature } from '../../data/mock'
import { TEMPERATURE_OPTIONS, todayLocalIso } from '../../lib/leads'
import { formatDateTime, isoToLocalInput, localInputToIso } from '../../lib/format'
import './tasks-forms.css'

interface LeadFormModalProps {
  task: KanbanTask | null
  onClose: () => void
  /** Resolves when saved; rejects with an Error whose message is shown in the form. */
  onSave: (task: KanbanTask) => Promise<void>
  onDelete?: (id: string) => void
}

function emptyForm(): Omit<KanbanTask, 'id'> {
  const today = todayLocalIso()
  return {
    title: '',
    customer: '',
    phone: '',
    email: '',
    vehicle: '',
    temperature: 'Warm',
    amount: 0,
    createdAt: new Date().toISOString(),
    dueDate: today,
    status: 'inquiry',
    notes: '',
  }
}

type LeadForm = Omit<KanbanTask, 'id'>
type CheckedField = 'title' | 'customer' | 'phone' | 'vehicle' | 'email'

// Same required fields as the backend, in form order (the first invalid one gets focus).
const REQUIRED_FIELDS: { key: Exclude<CheckedField, 'email'>; label: string }[] = [
  { key: 'title', label: 'Nama Deal' },
  { key: 'customer', label: 'Customer' },
  { key: 'phone', label: 'No. Telepon' },
  { key: 'vehicle', label: 'Mobil / Armada' },
]
const FIELD_ORDER: CheckedField[] = ['title', 'customer', 'phone', 'email', 'vehicle']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: LeadForm): Partial<Record<CheckedField, string>> {
  const errors: Partial<Record<CheckedField, string>> = {}
  for (const { key, label } of REQUIRED_FIELDS) {
    if (!String(form[key] ?? '').trim()) errors[key] = `${label} wajib diisi`
  }
  const email = (form.email ?? '').trim()
  if (email && !EMAIL_RE.test(email)) errors.email = 'Format email tidak valid (contoh: nama@email.com)'
  return errors
}

function RequiredMark() {
  return (
    <b className="lead-field-required" aria-hidden="true">
      *
    </b>
  )
}

export function LeadFormModal({ task, onClose, onSave, onDelete }: LeadFormModalProps) {
  const [form, setForm] = useState<LeadForm>(task ? { ...task } : emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Errors appear only after pressing save; afterwards each one clears as soon as it's fixed.
  const [errors, setErrors] = useState<Partial<Record<CheckedField, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function update(patch: Partial<LeadForm>) {
    const next = { ...form, ...patch }
    setForm(next)
    if (Object.keys(errors).length > 0) {
      const stillInvalid = validate(next)
      setErrors((prev) => {
        const kept: Partial<Record<CheckedField, string>> = {}
        for (const key of Object.keys(prev) as CheckedField[]) {
          if (stillInvalid[key]) kept[key] = stillInvalid[key]
        }
        return kept
      })
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    setSubmitError('')

    const firstInvalid = FIELD_ORDER.find((key) => found[key])
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    setSaving(true)
    try {
      await onSave({ id: task?.id ?? '', ...form })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan lead.')
    } finally {
      setSaving(false)
    }
  }

  const missingLabels = REQUIRED_FIELDS.filter(({ key }) => errors[key]).map(({ label }) => label)
  const fieldClass = (key: CheckedField) => `lead-field${errors[key] ? ' has-error' : ''}`
  const fieldError = (key: CheckedField) =>
    errors[key] ? (
      <small className="lead-field-error" id={`lead-${key}-error`}>
        {errors[key]}
      </small>
    ) : null
  const inputA11y = (key: CheckedField) => ({
    name: key,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `lead-${key}-error` : undefined,
  })

  return (
    <Modal title={task ? 'Edit Lead' : 'Tambah Lead'} onClose={onClose}>
      <form className="lead-form" onSubmit={handleSubmit} noValidate ref={formRef}>
        {(missingLabels.length > 0 || errors.email) && (
          <div className="lead-form-alert" role="alert">
            {missingLabels.length > 0
              ? `Lengkapi dulu: ${missingLabels.join(', ')}.`
              : 'Periksa kembali kolom yang ditandai merah.'}
          </div>
        )}
        {submitError && (
          <div className="lead-form-alert" role="alert">
            {submitError}
          </div>
        )}

        <label className={fieldClass('title')}>
          <span>
            Nama Deal <RequiredMark />
          </span>
          <input
            {...inputA11y('title')}
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Wedding Amanda & Rizky"
          />
          {fieldError('title')}
        </label>

        <div className="lead-field-row">
          <label className={fieldClass('customer')}>
            <span>
              Customer <RequiredMark />
            </span>
            <input
              {...inputA11y('customer')}
              value={form.customer}
              onChange={(e) => update({ customer: e.target.value })}
              placeholder="Nama customer / perusahaan"
            />
            {fieldError('customer')}
          </label>
          <label className={fieldClass('phone')}>
            <span>
              No. Telepon <RequiredMark />
            </span>
            <input
              {...inputA11y('phone')}
              type="tel"
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="+62 812..."
            />
            {fieldError('phone')}
          </label>
        </div>

        <div className="lead-field-row">
          <label className={fieldClass('email')}>
            <span>
              Email <em className="lead-field-optional">(opsional)</em>
            </span>
            <input
              {...inputA11y('email')}
              type="email"
              value={form.email ?? ''}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="nama@email.com"
            />
            {fieldError('email')}
          </label>
          <label className={fieldClass('vehicle')}>
            <span>
              Mobil / Armada <RequiredMark />
            </span>
            <input
              {...inputA11y('vehicle')}
              value={form.vehicle}
              onChange={(e) => update({ vehicle: e.target.value })}
              placeholder="Alphard 2024"
            />
            {fieldError('vehicle')}
          </label>
        </div>

        <div className="lead-field-row">
          <label className="lead-field">
            <span>Temperature</span>
            <select
              value={form.temperature}
              onChange={(e) => update({ temperature: e.target.value as LeadTemperature })}
            >
              {TEMPERATURE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="lead-field">
            <span>Status / Stage</span>
            <select value={form.status} onChange={(e) => update({ status: e.target.value as KanbanTask['status'] })}>
              {taskColumns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="lead-field-row">
          <label className="lead-field">
            <span>Nilai (Rp)</span>
            <input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => update({ amount: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="lead-field-row">
          <label className="lead-field">
            <span>Tanggal &amp; Jam Masuk</span>
            <input
              type="datetime-local"
              step={1}
              value={isoToLocalInput(form.createdAt)}
              onChange={(e) => {
                const iso = localInputToIso(e.target.value)
                if (iso) update({ createdAt: iso })
              }}
            />
          </label>
          <label className="lead-field">
            <span>Target / Jatuh Tempo</span>
            <input type="date" value={form.dueDate} onChange={(e) => update({ dueDate: e.target.value })} />
          </label>
        </div>

        <label className="lead-field">
          <span>Catatan</span>
          <textarea rows={2} value={form.notes ?? ''} onChange={(e) => update({ notes: e.target.value })} />
        </label>

        {task?.updatedAt && (
          <p className="lead-form-meta">
            Masuk {formatDateTime(task.createdAt)} · Terakhir update {formatDateTime(task.updatedAt)}
          </p>
        )}

        <div className="lead-form-actions">
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : task ? 'Simpan Perubahan' : 'Tambah Lead'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          {task && onDelete && (
            <button
              type="button"
              className="lead-delete-btn"
              onClick={() => (confirmDelete ? onDelete(task.id) : setConfirmDelete(true))}
            >
              <Trash2 size={14} /> {confirmDelete ? 'Yakin hapus?' : 'Hapus Lead'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
