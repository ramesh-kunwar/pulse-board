// src/components/AuthInit.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '#/context/AuthContext'
import { api, setAccessToken } from '#/lib/axios'

export function AuthInit() {
  const { setUser, setIsLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const init = async () => {
      try {
        const { data } = await api.post('/auth/refresh')
        console.log('refresh response:', data)
        setAccessToken(data.data.accessToken)
        setUser(data.data)
      } catch (e) {
        console.log('refresh error:', e)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [mounted])

  return null
}
