/**
 * Currency formatting for the prediction result.
 *
 * The ML model predicts in USD, and USD is the only currency the app
 * displays. This file just formats that number.
 */
export function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
