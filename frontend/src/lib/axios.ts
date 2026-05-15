// src/lib/axios.ts
import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export function setAccessToken(token: string | null) {
  if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers['Authorization']
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (original.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        setAccessToken(data.accessToken)
        original.headers['Authorization'] = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        setAccessToken(null)
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  },
)
