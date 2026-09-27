import { useEffect, useState } from 'react'
import { formatUsd, formatLkr, fetchUsdToLkrRate, convertUsdToLkr } from '../utils/currency'
import { generatePredictionReport } from '../utils/generatePredictionReport'

function PredictionResult({ result, vehicleDetails }) {
  const [rateInfo, setRateInfo] = useState(null) // { rate, isLive } once loaded

  useEffect(() => {
    let cancelled = false
    setRateInfo(null)
    fetchUsdToLkrRate().then((info) => {
      if (!cancelled) setRateInfo(info)
    })
    return () => {
      cancelled = true
    }
  }, [result])

  if (!result) return null

  const { predicted_price, explanations = [] } = result
  const lkrValue = rateInfo ? convertUsdToLkr(predicted_price, rateInfo.rate) : null

  function handleDownloadReport() {
    // Uses only the data already on screen — the same result and form
    // payload already returned/sent by /predict. No new API or model call.
    generatePredictionReport({
      vehicleDetails,
      predictedPriceUsd: predicted_price,
      explanations,
      lkrValue,
      isLiveRate: rateInfo?.isLive ?? false,
    })
  }

  return (
    <div className="result-panel">
      <span className="result-eyebrow">Estimated car price</span>

      <div className="result-price-group">
        <div className="price-block price-usd">
          <span className="currency-tag">USD</span>
          <span className="price-value">{formatUsd(predicted_price)}</span>
        </div>

        <div className="price-block price-lkr">
          <span className="currency-tag">Sri Lankan Rupees (LKR)</span>
          {rateInfo ? (
            <>
              <span className="price-value-lkr">≈ {formatLkr(lkrValue)}</span>
              <span className="rate-note">
                {rateInfo.isLive
                  ? 'Converted using the current exchange rate'
                  : 'Approximate — live exchange rate unavailable, using a fallback rate'}
              </span>
            </>
          ) : (
            <span className="price-value-lkr price-value-lkr--loading">Converting…</span>
          )}
        </div>
      </div>

      {explanations.length > 0 && (
        <div className="result-explanations">
          <h3>Why this price?</h3>
          <ul>
            {explanations.map((item, idx) => (
              <li
                key={idx}
                className={`explanation-row ${item.direction === 'increased' ? 'is-up' : 'is-down'}`}
              >
                <span className="explanation-arrow" aria-hidden="true">
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
        training data. The actual market price may differ. The model
        predicts in USD; the LKR figure is a currency conversion for
        convenience, not a separate prediction.
      </p>

      <button type="button" className="download-report-btn" onClick={handleDownloadReport}>
        Download Prediction Report
      </button>
    </div>
  )
}

export default PredictionResult
