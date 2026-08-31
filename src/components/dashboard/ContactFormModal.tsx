import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { Contact } from '../../data/mock'
import './contact-forms.css'

interface ContactFormModalProps {
  contact: Contact | null
  onClose: () => void
  onSave: (contact: Omit<Contact, 'id' | 'initials'>) => void
}

function emptyForm(): Omit<Contact, 'id' | 'initials'> {
  return {
    firstName: '',
    lastName: '',
    company: '',
    role: '',
    email: '',
    phone: '',
    lastContacted: '',
  }
}

export function ContactFormModal({ contact, onClose, onSave }: ContactFormModalProps) {
  const [form, setForm] = useState<Omit<Contact, 'id' | 'initials'>>(contact ? { ...contact } : emptyForm())

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.firstName.trim()) return
    onSave(form)
  }

  return (
    <Modal title={contact ? 'Edit Kontak' : 'Tambah Kontak'} onClose={onClose}>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-field-row">
          <label className="contact-field">
            <span>Nama Depan</span>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Intan"
              required
            />
          </label>
          <label className="contact-field">
            <span>Nama Belakang</span>
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Permata"
            />
          </label>
        </div>

        <label className="contact-field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="intan@intanwo.id"
          />
        </label>

        <label className="contact-field">
          <span>No. Telepon</span>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+62 819 4567 8901"
          />
        </label>

        <label className="contact-field">
          <span>Perusahaan</span>
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Intan Wedding Organizer"
          />
        </label>

        <label className="contact-field">
          <span>Peran</span>
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="Wedding Organizer"
          />
        </label>

        <div className="contact-form-actions">
          <Button type="submit">{contact ? 'Simpan Perubahan' : 'Tambah Kontak'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
        </div>
      </form>
    </Modal>
  )
}
