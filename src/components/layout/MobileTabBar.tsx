import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import './layout.css'

export function MobileTabBar() {
  return (
    <nav className="mobile-tabbar">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `mobile-tab${isActive ? ' active' : ''}`}
        >
          <Icon size={19} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
