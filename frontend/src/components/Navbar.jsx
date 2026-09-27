import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) return null

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand">AI Car Price Predictor</span>
      <div className="navbar-links">
        <NavLink to="/predict" className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}>
          Predict
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}>
          History
        </NavLink>
      </div>
      <div className="navbar-user">
        {user?.full_name && <span className="navbar-name">{user.full_name}</span>}
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  )
}

export default Navbar
