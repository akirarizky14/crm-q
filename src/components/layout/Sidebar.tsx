import { NavLink, useNavigate } from 'react-router-dom'
import { Crown, LogOut } from 'lucide-react'
import { useAuth } from '../../lib/authContext'
import { NAV_ITEMS } from './navItems'
import './layout.css'

export function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" title="Crown Car Rental">
        <Crown size={18} />
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            title={label}
          >
            <Icon size={19} />
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-link sidebar-logout"
        title="Keluar"
        onClick={() => {
          logout()
          navigate('/login', { replace: true })
        }}
      >
        <LogOut size={19} />
      </button>
    </aside>
  )
}
