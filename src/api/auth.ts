import { apiFetch } from './client'

export interface LoginResponse {
  token: string
  user: { email: string; name: string }
}

export function loginRequest(email: string, password: string) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
