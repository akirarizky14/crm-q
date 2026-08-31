import { LayoutDashboard, Car, Kanban, Handshake, Newspaper, Settings } from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number }>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fleet', label: 'Armada', icon: Car },
  { to: '/tasks', label: 'CRM Board', icon: Kanban },
  { to: '/affiliate', label: 'Affiliate', icon: Handshake },
  { to: '/blog', label: 'Blog', icon: Newspaper },
  { to: '/settings', label: 'Pengaturan Website', icon: Settings },
]
