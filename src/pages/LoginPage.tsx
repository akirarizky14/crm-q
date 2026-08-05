import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Crown, Car, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { Button } from '../components/ui/Button'
import { ApiError } from '../api/client'
import './LoginPage.css'

export function LoginPage() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal masuk, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <span className="login-logo">
            <Crown size={20} />
          </span>
          <span>Crown Car Rental</span>
        </div>

        <div className="login-copy">
          <h1>Selamat datang kembali</h1>
          <p>Masuk untuk mengelola kontrak sewa, armada, dan mitra afiliasi Crown Car Rental.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              autoComplete="username"
            />
          </label>
          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <Button type="submit" disabled={loading} style={{ width: '100%', padding: '13px 20px' }}>
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </Button>
        </form>
      </div>

      <div className="login-showcase">
        <div className="login-showcase-glow" />
        <div className="login-showcase-content">
          <span className="login-showcase-tag">
            <Sparkles size={14} /> Wedding &amp; Corporate Fleet
          </span>
          <h2>Sewa mobil bulanan untuk momen dan bisnis Anda.</h2>
          <p>
            Kelola pipeline kontrak, jadwal armada, dan mitra afiliasi wedding organizer dalam satu
            dashboard elegan.
          </p>
          <div className="login-showcase-stats">
            <div>
              <Car size={18} />
              <div>
                <strong>32</strong>
                <span>Armada Aktif</span>
              </div>
            </div>
            <div>
              <ShieldCheck size={18} />
              <div>
                <strong>120+</strong>
                <span>Kontrak Selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
