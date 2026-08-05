import { useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext, useAuth, type Session } from './authContext'
import { loginRequest } from '../api/auth'
import { getToken, setToken, clearToken } from '../api/client'

const STORAGE_KEY = 'crown-crm-auth'

function readSession(): Session | null {
  if (!getToken()) return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession)

  const login = async (email: string, password: string) => {
    const { token, user } = await loginRequest(email, password)
    setToken(token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setSession(user)
  }

  const logout = () => {
    clearToken()
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
