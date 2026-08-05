import { apiFetch } from './client'
import type { KanbanTask } from '../data/mock'

export function fetchLeads() {
  return apiFetch<KanbanTask[]>('/api/leads')
}

export function createLead(task: Omit<KanbanTask, 'id'>) {
  return apiFetch<KanbanTask>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(task),
  })
}

export function updateLead(id: string, patch: Partial<Omit<KanbanTask, 'id'>>) {
  return apiFetch<KanbanTask>(`/api/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function deleteLead(id: string) {
  return apiFetch<void>(`/api/leads/${id}`, { method: 'DELETE' })
}
