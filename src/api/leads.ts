import { apiFetch } from './client'
import type { KanbanTask, LeadTemperature, TaskStatus } from '../data/mock'

export interface LeadFilters {
  status?: TaskStatus
  temperature?: LeadTemperature
  /** Inclusive YYYY-MM-DD bounds on the lead's created date. */
  from?: string
  to?: string
  /** Every term must match the title, customer, or vehicle. */
  search?: string[]
}

export interface LeadPage {
  items: KanbanTask[]
  total: number
  page: number
  pageSize: number
}

function toQueryString(filters: LeadFilters & { page?: number; pageSize?: number }): string {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.temperature) params.set('temperature', filters.temperature)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  for (const term of filters.search ?? []) {
    if (term.trim()) params.append('search', term.trim())
  }
  if (filters.page) params.set('page', String(filters.page))
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function fetchLeads(filters: LeadFilters = {}) {
  return apiFetch<KanbanTask[]>(`/api/leads${toQueryString(filters)}`)
}

export function fetchLeadsPage(filters: LeadFilters & { page: number; pageSize: number }) {
  return apiFetch<LeadPage>(`/api/leads/paged${toQueryString(filters)}`)
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
