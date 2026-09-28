import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import backgroundImage from '../assets/login-car-background.png'
import '../styles/Login.css'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.5 19.5c1.4-3.4 4-5.2 7.5-5.2s6.1 1.8 7.5 5.2" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 6.5L12 13l8.5-6.5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.7A10.6 10.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a15.7 15.7 0 0 1-3.4 4.2M6.6 6.7C4 8.3 2 12 2 12s3.6 6.5 10 6.5a10.3 10.3 0 0 0 4.2-.9" />
      <path d="M9.9 10a2.6 2.6 0 0 0 3.6 3.6" />
    </svg>
  )
}

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  function validate() {
    const next = {}
    if (!fullName.trim()) next.fullName = 'Full name is required'
    if (!email.trim()) {
      next.email = 'Email address is required'
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = 'Enter a valid email address'
    }
    if (!password) {
      next.password = 'Password is required'
    } else if (password.length < 8) {
      next.password = 'Use at least 8 characters'
    }
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    setIsLoading(true)
    try {
      // Calls your real Flask /register endpoint via AuthContext — no
      // hard-coded or frontend-only authentication.
      await register(fullName.trim(), email.trim(), password)
      navigate('/predict')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-screen" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="login-overlay" />

      <div className="login-content">
        <div className="login-card">
          <span className="login-label">EXPLAINABLE AI CAR VALUATION</span>
          <h1 className="login-heading">Create Your Account</h1>
          <p className="login-subtitle">
            Sign up to start getting AI-powered valuations for your vehicle.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label className="glass-field">
              <span className="glass-field-label">Full Name</span>
              <div className={`glass-input-row ${errors.fullName ? 'has-error' : ''}`}>
                <span className="glass-icon">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <span className="glass-error">{errors.fullName}</span>}
            </label>

            <label className="glass-field">
              <span className="glass-field-label">Email Address</span>
              <div className={`glass-input-row ${errors.email ? 'has-error' : ''}`}>
                <span className="glass-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="glass-error">{errors.email}</span>}
            </label>

            <label className="glass-field">
              <span className="glass-field-label">Password</span>
              <div className={`glass-input-row ${errors.password ? 'has-error' : ''}`}>
                <span className="glass-icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="glass-icon-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <span className="glass-error">{errors.password}</span>}
            </label>

            <label className="glass-field">
              <span className="glass-field-label">Confirm Password</span>
              <div className={`glass-input-row ${errors.confirmPassword ? 'has-error' : ''}`}>
                <span className="glass-icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <span className="glass-error">{errors.confirmPassword}</span>
              )}
            </label>

            {serverError && <div className="login-error-banner">{serverError}</div>}

            <button type="submit" className="signin-btn" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="login-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
