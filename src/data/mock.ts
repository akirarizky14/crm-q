export interface Contact {
  id: string
  firstName: string
  lastName: string
  company: string
  role: string
  email: string
  phone: string
  lastContacted: string
  initials: string
}

export interface StatSummary {
  label: string
  value: string
  delta: string
  sub: string
}

export interface InteractionItem {
  id: string
  date: string
  title: string
  subtitle: string
  amount: string
  variant: 'dark' | 'accent' | 'light'
  people: number
}

export interface FunnelStage {
  label: string
  amount: string
  ratio: number
}

export type VehicleCategory = 'City Car' | 'Wedding' | 'Corporate' | 'Electric Car'
export type VehicleStatus = 'Tersedia' | 'Disewa' | 'Maintenance' | 'Terjual'

export interface Vehicle {
  id: string
  name: string
  category: VehicleCategory
  year: number
  plate: string
  monthlyRate: number
  status: VehicleStatus
  seats: number
  image?: string
  createdAt: string
}

export type VehicleEventType = 'procurement' | 'service' | 'expense' | 'sale'

export interface VehicleEvent {
  id: string
  vehicleId: string
  type: VehicleEventType
  date: string
  amount: number
  description: string
  createdAt: string
}

export type TaskStatus = 'inquiry' | 'survey' | 'kontrak' | 'berjalan' | 'selesai'

export type LeadTemperature = 'Hot' | 'Warm' | 'Cold'

export interface KanbanTask {
  id: string
  title: string
  customer: string
  phone: string
  vehicle: string
  temperature: LeadTemperature
  amount: number
  createdAt: string
  dueDate: string
  status: TaskStatus
  notes?: string
}

export const taskColumns: { id: TaskStatus; title: string }[] = [
  { id: 'inquiry', title: 'Inquiry' },
  { id: 'survey', title: 'Survey Mobil' },
  { id: 'kontrak', title: 'Kontrak Ditandatangani' },
  { id: 'berjalan', title: 'Sedang Berjalan' },
  { id: 'selesai', title: 'Selesai' },
]

export const initialTasks: KanbanTask[] = [
  { id: 't-1', title: 'Wedding Amanda & Rizky', customer: 'Amanda Wijaya', phone: '+62 812 3456 7890', vehicle: 'Alphard 2024', temperature: 'Hot', amount: 45_000_000, createdAt: '2026-07-10', dueDate: '2026-08-02', status: 'kontrak' },
  { id: 't-2', title: 'Sewa Bulanan PT Nusantara', customer: 'PT Nusantara Jaya', phone: '+62 813 1000 2000', vehicle: '3x Hiace Premio', temperature: 'Hot', amount: 54_000_000, createdAt: '2026-07-15', dueDate: '2026-08-05', status: 'berjalan' },
  { id: 't-3', title: 'Wedding Salsa & Bayu', customer: 'Salsabila Putri', phone: '+62 815 2233 4455', vehicle: 'Mercedes S-Class', temperature: 'Warm', amount: 68_000_000, createdAt: '2026-07-20', dueDate: '2026-08-10', status: 'survey' },
  { id: 't-4', title: 'Gathering Tahunan BCA Corp', customer: 'PT BCA Corp Retail', phone: '+62 21 5050 1234', vehicle: 'Bus Pariwisata Medium', temperature: 'Cold', amount: 52_000_000, createdAt: '2026-06-25', dueDate: '2026-08-14', status: 'inquiry' },
  { id: 't-5', title: 'Perpanjangan Kontrak Fortuner', customer: 'Dimas Aditya', phone: '+62 817 8899 0011', vehicle: 'Toyota Fortuner', temperature: 'Warm', amount: 22_500_000, createdAt: '2026-06-15', dueDate: '2026-08-01', status: 'selesai' },
  { id: 't-6', title: 'Wedding Intan & Farhan', customer: 'Intan Permata', phone: '+62 819 4567 8901', vehicle: 'Bus Pengantin Deluxe', temperature: 'Hot', amount: 60_000_000, createdAt: '2026-07-22', dueDate: '2026-08-20', status: 'inquiry' },
  { id: 't-7', title: 'Antar-Jemput Tamu VIP', customer: 'PT Wijaya Group', phone: '+62 812 3456 7890', vehicle: 'Innova Zenix', temperature: 'Warm', amount: 14_500_000, createdAt: '2026-07-18', dueDate: '2026-08-08', status: 'survey' },
  { id: 't-8', title: 'Kontrak Shuttle Karyawan', customer: 'PT Sinar Abadi', phone: '+62 21 8899 7766', vehicle: '2x Hiace Premio', temperature: 'Cold', amount: 36_000_000, createdAt: '2026-06-30', dueDate: '2026-08-03', status: 'berjalan' },
]

export type AffiliateStatus = 'Aktif' | 'Nonaktif'

export interface Affiliate {
  id: string
  name: string
  type: 'Wedding Organizer' | 'Event Planner' | 'Travel Agent'
  referralCode: string
  totalReferrals: number
  commissionRate: number
  commissionEarned: number
  status: AffiliateStatus
}

export const affiliates: Affiliate[] = [
  { id: 'a-1', name: 'Dian Wedding Organizer', type: 'Wedding Organizer', referralCode: 'DIANWO10', totalReferrals: 14, commissionRate: 10, commissionEarned: 27_000_000, status: 'Aktif' },
  { id: 'a-2', name: 'Kirana Event Planner', type: 'Event Planner', referralCode: 'KIRANA08', totalReferrals: 9, commissionRate: 8, commissionEarned: 14_400_000, status: 'Aktif' },
  { id: 'a-3', name: 'Nusantara Travel Agent', type: 'Travel Agent', referralCode: 'NUSA12', totalReferrals: 6, commissionRate: 12, commissionEarned: 9_360_000, status: 'Aktif' },
  { id: 'a-4', name: 'Berkah Wedding Organizer', type: 'Wedding Organizer', referralCode: 'BERKAH10', totalReferrals: 5, commissionRate: 10, commissionEarned: 7_500_000, status: 'Nonaktif' },
  { id: 'a-5', name: 'Ceria Event Planner', type: 'Event Planner', referralCode: 'CERIA08', totalReferrals: 3, commissionRate: 8, commissionEarned: 3_200_000, status: 'Aktif' },
]

export const affiliateSummary = {
  totalAffiliates: affiliates.length,
  referralsThisMonth: 11,
  commissionPaid: affiliates.reduce((sum, a) => sum + a.commissionEarned, 0),
}

export interface CalendarTask {
  day: number
  variant: 'dark' | 'accent' | 'light' | 'none'
}

export interface BlogPost {
  slug: string
  category: string
  title: string
  excerpt?: string
  content: string[]
  author: string
  date: string
  image?: string
}
