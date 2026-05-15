// src/components/AuthSync.tsx
import { useEffect } from 'react'
import { useAuth } from '#/context/AuthContext'
import { Route } from '#/routes/__root'

export function AuthSync() {
  const { setUser } = useAuth()
  const { user } = Route.useRouteContext()

  useEffect(() => {
    setUser(user)
  }, [user])

  return null
}
