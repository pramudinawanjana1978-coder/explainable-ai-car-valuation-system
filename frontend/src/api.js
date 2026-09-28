export const API_BASE =
  'https://explainable-ai-car-valuation-system-pearl.vercel.app'

/**
 * Wraps fetch: adds the JSON content-type header and attaches the
 * logged-in user's token (if there is one) as an Authorization header.
 * Throws an Error with a friendly message on any non-2xx response.
 */
export async function apiRequest(
  path,
  { method = 'GET', body, token } = {}
) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new Error(
      'Could not reach the server. Please try again later.'
    )
  }

  let data = null

  try {
    data = await response.json()
  } catch {
    // No JSON response body
  }

  if (!response.ok) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}`
    )
  }

  return data
}