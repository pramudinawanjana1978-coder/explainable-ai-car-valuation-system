import { useState } from 'react'
import CarForm from '../components/CarForm'
import PredictionResult from '../components/PredictionResult'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../api'

function PredictorPage() {
  const { token } = useAuth()
  const [result, setResult] = useState(null)
  const [vehicleDetails, setVehicleDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handlePredict(payload) {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await apiRequest('/predict', { method: 'POST', body: payload, token })
      setResult(data)
      setVehicleDetails(payload) // same payload sent to /predict — reused for the PDF report
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page">
      <Navbar />

      <header className="hero">
        <div className="hero-gauge" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" className="gauge-track" />
            <circle cx="60" cy="60" r="52" className="gauge-fill" />
            <line x1="60" y1="60" x2="60" y2="18" className="gauge-needle" />
          </svg>
        </div>
        <p className="hero-eyebrow">Instant valuation, powered by machine learning</p>
        <h1>AI Car Price Predictor</h1>
        <p className="hero-subtitle">
          Enter your vehicle's details and get an instant, data-driven
          estimate of its market value, with a breakdown of what pushed the
          number up or down.
        </p>
      </header>

      <main className="layout">
        <section className="form-section">
          <h2>Vehicle details</h2>
          <CarForm onSubmit={handlePredict} isLoading={isLoading} />
        </section>

        <section className="result-section">
          {error && <div className="error-banner">{error}</div>}

          {!error && !result && !isLoading && (
            <div className="result-placeholder">
              <p>Fill in the form and predict a price to see your estimate here.</p>
            </div>
          )}

          {isLoading && (
            <div className="result-placeholder">
              <div className="loading-spinner" aria-hidden="true" />
              <p>Estimating the price…</p>
            </div>
          )}

          {result && !error && (
            <PredictionResult result={result} vehicleDetails={vehicleDetails} />
          )}
        </section>
      </main>

      <footer className="page-footer">
        <p>AI Car Price Predictor · Local demo running on Flask + scikit-learn</p>
      </footer>
    </div>
  )
}

export default PredictorPage
