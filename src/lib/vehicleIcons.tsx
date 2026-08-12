import type { ComponentType } from 'react'
import { CarFront, Heart, Briefcase, BatteryCharging } from 'lucide-react'
import type { VehicleCategory } from '../data/mock'

export const VEHICLE_CATEGORY_ICON: Record<VehicleCategory, ComponentType<{ size?: number; className?: string }>> = {
  'City Car': CarFront,
  Wedding: Heart,
  Corporate: Briefcase,
  'Electric Car': BatteryCharging,
}
