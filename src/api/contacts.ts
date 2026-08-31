import { apiFetch } from './client'
import type { Contact } from '../data/mock'

export function fetchContacts() {
  return apiFetch<Contact[]>('/api/contacts')
}

export function createContact(contact: Omit<Contact, 'id' | 'initials'>) {
  return apiFetch<Contact>('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(contact),
  })
}

export function updateContact(id: string, patch: Partial<Omit<Contact, 'id' | 'initials'>>) {
  return apiFetch<Contact>(`/api/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function deleteContact(id: string) {
  return apiFetch<void>(`/api/contacts/${id}`, { method: 'DELETE' })
}
