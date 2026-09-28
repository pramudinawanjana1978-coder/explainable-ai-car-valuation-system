import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../api'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function HistoryPage() {
  const { token } = useAuth()
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiRequest('/history', { token })
        if (!cancelled) setRecords(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <AppShell>
      <header className="dashboard-hero dashboard-hero--compact">
        <div className="dashboard-hero-text">
          <p className="dashboard-hero-eyebrow">YOUR PAST ESTIMATES</p>
          <h1 className="dashboard-hero-title">Prediction History</h1>
          <p className="dashboard-hero-subtitle">
            Every valuation you've generated, most recent first.
          </p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {isLoading && !error && (
        <div className="result-placeholder">
          <div className="loading-spinner" aria-hidden="true" />
          <p>Loading your history…</p>
        </div>
      )}

      {!isLoading && !error && records.length === 0 && (
        <div className="result-placeholder">
          <p>You haven't made any predictions yet.</p>
        </div>
      )}

      {!isLoading && !error && records.length > 0 && (
        <ul className="history-list">
          {records.map((r) => (
            <li key={r.id} className="history-item">
              <div className="history-item-main">
                <span className="history-item-vehicle">
                  {r.brand} {r.model}
                </span>
                <span className="history-item-meta">
                  {r.year} · {r.mileage_km.toLocaleString()} km · {formatDate(r.created_at)}
                </span>
              </div>
              <span className="history-item-price">{formatCurrency(r.predicted_price)}</span>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}

export default HistoryPage
