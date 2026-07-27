import type { ComponentType } from 'react'
import { CarFront, Bus, Van } from 'lucide-react'
import type { VehicleCategory } from '../data/mock'

export const VEHICLE_CATEGORY_ICON: Record<VehicleCategory, ComponentType<{ size?: number; className?: string }>> = {
  'Wedding Car': CarFront,
  'Van Korporat': Van,
  'Bus Korporat': Bus,
}
