import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useAuth } from '#/context/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/auth/login' })
    }
  }, [user, isLoading])

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Pulse Board</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user.firstName}</span>
          <Link
            to="/auth/login"
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Polls</h2>
          <Link
            to="/polls/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Create Poll
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
          <p>No polls yet. Create your first poll.</p>
        </div>
      </main>
    </div>
  )
}
