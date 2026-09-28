import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GaugeGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 15.5a8 8 0 1 1 16 0" />
      <path d="M12 15.5l4-4.2" />
      <circle cx="12" cy="15.5" r="1.1" />
    </svg>
  )
}

function HistoryGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2" />
      <path d="M3.2 4.5v4h4" />
      <path d="M12 8v4.5l3 2" />
    </svg>
  )
}

function LogoutGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3" />
      <path d="M15.5 16l4-4-4-4" />
      <path d="M19 12H9" />
    </svg>
  )
}

/**
 * Slim floating side navigation used on protected pages. Same
 * useAuth()/logout() and NavLink routes as the old Navbar — this is a
 * visual replacement only, no behavior change.
 */
function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">EV</span>
        <span className="sidebar-brand-text">
          <strong>Explainable AI</strong>
          <small>Car Valuation</small>
        </span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/predict"
          className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        >
          <span className="sidebar-link-icon"><GaugeGlyph /></span>
          <span className="sidebar-link-label">Predict</span>
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        >
          <span className="sidebar-link-icon"><HistoryGlyph /></span>
          <span className="sidebar-link-label">History</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {user?.full_name && <span className="sidebar-user">{user.full_name}</span>}
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <span className="sidebar-link-icon"><LogoutGlyph /></span>
          <span className="sidebar-link-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
