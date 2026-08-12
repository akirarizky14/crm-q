import type { ComponentType } from 'react'
import { ShoppingCart, Wrench, Receipt, Banknote } from 'lucide-react'
import type { VehicleEventType } from '../data/mock'

export const EVENT_TYPE_META: Record<
  VehicleEventType,
  { label: string; icon: ComponentType<{ size?: number }>; cssClass: string }
> = {
  procurement: { label: 'Pembelian', icon: ShoppingCart, cssClass: 'event-procurement' },
  service: { label: 'Servis', icon: Wrench, cssClass: 'event-service' },
  expense: { label: 'Pengeluaran', icon: Receipt, cssClass: 'event-expense' },
  sale: { label: 'Terjual', icon: Banknote, cssClass: 'event-sale' },
}

export const EVENT_TYPE_OPTIONS: VehicleEventType[] = ['procurement', 'service', 'expense', 'sale']
