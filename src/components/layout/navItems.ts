import { LayoutDashboard, Car, Kanban, Handshake, LayoutTemplate } from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number }>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fleet', label: 'Armada', icon: Car },
  { to: '/tasks', label: 'Task Board', icon: Kanban },
  { to: '/affiliate', label: 'Affiliate', icon: Handshake },
  { to: '/cms/landing', label: 'Landing Page', icon: LayoutTemplate },
]
