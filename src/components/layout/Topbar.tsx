import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Mail, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../lib/authContext'
import { Avatar } from '../ui/Avatar'
import { IconButton } from '../ui/IconButton'
import './layout.css'

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Customer Information', subtitle: 'Ringkasan kontrak, pipeline, dan pelanggan' },
  '/fleet': { title: 'Armada Mobil', subtitle: 'Inventaris kendaraan wedding & korporat' },
  '/tasks': { title: 'Task Board', subtitle: 'Pipeline booking dari inquiry sampai selesai' },
  '/affiliate': { title: 'Affiliate Program', subtitle: 'Mitra referral & komisi bulanan' },
  '/cms/landing': { title: 'Landing Page', subtitle: 'Kelola konten halaman publik' },
}

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const meta = TITLES[location.pathname] ?? { title: 'Crown Car Rental', subtitle: '' }
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [prevPath, setPrevPath] = useState(location.pathname)
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">{meta.title}</h1>
        <p className="topbar-subtitle">{meta.subtitle}</p>
      </div>

      <div className="topbar-actions">
        <IconButton title="Notifikasi">
          <Bell size={17} />
        </IconButton>
        <IconButton title="Pesan">
          <Mail size={17} />
        </IconButton>
        <div className="topbar-profile-wrap" ref={menuRef}>
          <button type="button" className="topbar-profile" onClick={() => setMenuOpen((v) => !v)}>
            <Avatar label={session?.email ?? 'CC'} size={36} />
            <span className="topbar-email">{session?.email}</span>
            <ChevronDown size={14} className={`topbar-chevron${menuOpen ? ' open' : ''}`} />
          </button>
          {menuOpen && (
            <div className="topbar-menu">
              <span className="topbar-menu-email">{session?.email}</span>
              <button
                type="button"
                className="topbar-menu-item"
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
              >
                <LogOut size={15} /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
