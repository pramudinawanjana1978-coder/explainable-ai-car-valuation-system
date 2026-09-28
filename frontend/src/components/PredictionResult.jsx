import { formatUsd } from '../utils/currency'
import { generatePredictionReport } from '../utils/generatePredictionReport'
import VehicleSummary from './VehicleSummary'

function PredictionResult({ result, vehicleDetails }) {
  if (!result) return null

  const { predicted_price, explanations = [] } = result

  function handleDownloadReport() {
    // Uses only the data already on screen — the same result and form
    // payload already returned/sent by /predict. No new API or model call.
    generatePredictionReport({
      vehicleDetails,
      predictedPriceUsd: predicted_price,
      explanations,
    })
  }

  return (
    <div className="result-panel">
      <VehicleSummary vehicleDetails={vehicleDetails} />

      <span className="result-eyebrow">Predicted Car Price (USD)</span>

      <div className="price-spotlight">
        <div className="price-block price-usd">
          <span className="price-value">{formatUsd(predicted_price)}</span>
        </div>
      </div>

      {explanations.length > 0 && (
        <div className="result-explanations">
          <h3>Why This Price?</h3>
          <p className="explanations-subtitle">Factors that influenced the AI valuation</p>
          <ul>
            {explanations.map((item, idx) => (
              <li
                key={idx}
                className={`explanation-row ${item.direction === 'increased' ? 'is-up' : 'is-down'}`}
              >
                <span className="explanation-badge" aria-hidden="true">
                  {item.direction === 'increased' ? '↑' : '↓'}
                </span>
                <div className="explanation-text">
                  <span className="explanation-feature">{item.feature}</span>
                  <span className="explanation-value">{String(item.value)}</span>
                  <span className="explanation-message">{item.message}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="result-note">
            These factors show how each detail shifted the estimate relative
            to a baseline vehicle, not an exact dollar amount added or
            removed.
          </p>
        </div>
      )}

      <p className="result-disclaimer">
        This is an AI-generated price estimate based on patterns in the
        training data. The actual market price may differ.
      </p>

      <button type="button" className="download-report-btn" onClick={handleDownloadReport}>
        Download Valuation Report
      </button>
    </div>
  )
}

export default PredictionResult
