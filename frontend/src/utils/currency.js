/**
 * Currency helpers for the prediction result.
 *
 * The ML model always predicts in USD — that never changes. Everything
 * in this file is a separate, swappable layer on top of that USD value:
 * it only formats numbers and converts USD to LKR for display.
 *
 * To move to a different live exchange-rate provider later, this is the
 * only file that needs to change — swap the URL and the response
 * parsing inside fetchUsdToLkrRate, and nothing else in the app needs
 * to know.
 */

// Used only when a live rate can't be fetched (offline, API down, etc).
// Update this occasionally so the fallback stays roughly realistic, but
// it is never relied on when a live rate is available.
export const FALLBACK_USD_TO_LKR_RATE = 300

const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD'

export function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatLkr(value) {
  const rounded = Math.round(value)
  return `Rs. ${new Intl.NumberFormat('en-US').format(rounded)}`
}

/**
 * Fetches the current USD → LKR exchange rate from a free, no-key
 * exchange-rate API.
 *
 * Returns { rate, isLive }:
 * - isLive: true  → `rate` came from the live API just now.
 * - isLive: false → the live rate could not be fetched, `rate` is the
 *   fallback constant above. Callers should tell the user the LKR
 *   figure is an approximate conversion in this case.
 */
export async function fetchUsdToLkrRate() {
  try {
    const response = await fetch(EXCHANGE_RATE_API_URL)
    if (!response.ok) {
      throw new Error(`Exchange rate request failed with status ${response.status}`)
    }
    const data = await response.json()
    const rate = data?.rates?.LKR
    if (typeof rate !== 'number' || !Number.isFinite(rate)) {
      throw new Error('LKR rate missing from exchange rate response')
    }
    return { rate, isLive: true }
  } catch (err) {
    return { rate: FALLBACK_USD_TO_LKR_RATE, isLive: false }
  }
}

export function convertUsdToLkr(usdValue, rate) {
  return usdValue * rate
}
