import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
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
    <div className="page">
      <Navbar />

      <header className="hero hero-compact">
        <p className="hero-eyebrow">Your past estimates</p>
        <h1>Prediction history</h1>
        <p className="hero-subtitle">Every price estimate you've generated, most recent first.</p>
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
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Year</th>
                <th>Mileage (km)</th>
                <th>Predicted price</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.created_at)}</td>
                  <td>{r.brand}</td>
                  <td>{r.model}</td>
                  <td>{r.year}</td>
                  <td>{r.mileage_km.toLocaleString()}</td>
                  <td className="history-price">{formatCurrency(r.predicted_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
