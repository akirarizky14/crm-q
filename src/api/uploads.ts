import { getToken, ApiError } from './client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function uploadImage(file: File): Promise<{ url: string }> {
  const token = getToken()
  const body = new FormData()
  body.append('file', file)

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(data.error || `Upload gagal (${res.status})`, res.status)
  }

  return res.json()
}
