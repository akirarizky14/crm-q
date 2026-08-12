import { apiFetch } from './client'
import type { StatSummary, InteractionItem, FunnelStage, CalendarTask, Contact } from '../data/mock'

export interface DashboardSummary {
  stats: StatSummary[]
  interactionHistory: InteractionItem[]
  funnelStages: FunnelStage[]
  funnelTotal: string
  calendarMonth: string
  calendarTasks: CalendarTask[]
  primaryContact: Contact | null
}

export function fetchDashboardSummary() {
  return apiFetch<DashboardSummary>('/api/dashboard/summary')
}
