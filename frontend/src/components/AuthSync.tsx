// src/components/AuthSync.tsx
import { useLayoutEffect } from 'react'
import { useAuth } from '#/context/AuthContext'
import { Route } from '#/routes/__root'

export function AuthSync() {
  const { setUser } = useAuth()
  const context = Route.useRouteContext()

  useLayoutEffect(() => {
    setUser(context.user)
  }, [context.user])

  return null
}
