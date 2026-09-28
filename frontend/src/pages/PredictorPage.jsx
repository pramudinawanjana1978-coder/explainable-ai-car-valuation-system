import { useState } from 'react'
import CarForm from '../components/CarForm'
import PredictionResult from '../components/PredictionResult'
import AppShell from '../components/AppShell'
import Hero from '../components/Hero'
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
    <AppShell>
      <Hero />

      <div className="layout">
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
      </div>

      <footer className="page-footer">
        <p>Explainable AI Car Valuation · Local demo running on Flask + scikit-learn</p>
      </footer>
    </AppShell>
  )
}

export default PredictorPage
