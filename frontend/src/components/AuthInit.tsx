// src/components/AuthInit.tsx
import { useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '#/context/AuthContext'
import { setAccessToken } from '#/lib/axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

let initialized = false

export function AuthInit() {
  const { setUser, setIsLoading } = useAuth()

  useEffect(() => {
    if (initialized) return
    initialized = true

    const init = async () => {
      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        setAccessToken(data.data.accessToken)
        setUser(data.data)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  return null
}
