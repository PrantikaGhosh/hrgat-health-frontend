import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const STORAGE_KEY = 'hrgat_auth'

const client = axios.create({ baseURL: API_BASE_URL })

export function getStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function storeAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getAuthFields() {
  const auth = getStoredAuth()
  if (!auth) return {}
  return { user_id: auth.user_id, email: auth.email, auth_token: auth.auth_token }
}

// A 401 always means the token itself is invalid or expired, clear the
// local session and send the person back to login. A 403 means the
// token is fine but the account lacks permission for that specific
// action (e.g. staff hitting an admin-only route), that should surface
// as an error message on the page, not a logout.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuth()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
