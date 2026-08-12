import { apiFetch } from './client'
import type { Vehicle, VehicleEvent } from '../data/mock'

export function fetchVehicles() {
  return apiFetch<Vehicle[]>('/api/vehicles')
}

export function createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt'>) {
  return apiFetch<Vehicle>('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicle),
  })
}

export function updateVehicle(id: string, patch: Partial<Omit<Vehicle, 'id' | 'createdAt'>>) {
  return apiFetch<Vehicle>(`/api/vehicles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function deleteVehicle(id: string) {
  return apiFetch<void>(`/api/vehicles/${id}`, { method: 'DELETE' })
}

export function fetchVehicleEvents(vehicleId: string) {
  return apiFetch<VehicleEvent[]>(`/api/vehicles/${vehicleId}/events`)
}

export function createVehicleEvent(
  vehicleId: string,
  event: Omit<VehicleEvent, 'id' | 'vehicleId' | 'createdAt'>
) {
  return apiFetch<VehicleEvent>(`/api/vehicles/${vehicleId}/events`, {
    method: 'POST',
    body: JSON.stringify(event),
  })
}

export function updateVehicleEvent(
  vehicleId: string,
  eventId: string,
  patch: Partial<Omit<VehicleEvent, 'id' | 'vehicleId' | 'createdAt'>>
) {
  return apiFetch<VehicleEvent>(`/api/vehicles/${vehicleId}/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function deleteVehicleEvent(vehicleId: string, eventId: string) {
  return apiFetch<void>(`/api/vehicles/${vehicleId}/events/${eventId}`, { method: 'DELETE' })
}
