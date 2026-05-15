// src/routes/dashboard/index.tsx
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useAuth } from '#/context/AuthContext'
import { useEffect, useState } from 'react'
import { getPollsApi } from '#/features/polls/api/pollsApi'
import { logoutApi } from '#/features/auth/api/authApi'

type Poll = {
  id: string
  title: string
  status: string
  createdAt: string
  _count?: { responses: number }
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [polls, setPolls] = useState<Poll[]>([])
  const [pollsLoading, setPollsLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/auth/login' })
    }
  }, [user, isLoading])

  useEffect(() => {
    if (!user) return
    getPollsApi()
      .then((res) => setPolls(res.data))
      .finally(() => setPollsLoading(false))
  }, [user])

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
          <button
            onClick={async () => {
              await logoutApi()
              navigate({ to: '/auth/login' })
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
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

        {pollsLoading ? (
          <p className="text-gray-400 text-sm">Loading polls...</p>
        ) : polls.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
            <p>No polls yet. Create your first poll.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{poll.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Status: <span className="capitalize">{poll.status}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/polls/$pollId/analytics"
                    params={{ pollId: poll.id }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Analytics
                  </Link>
                  <Link
                    to="/polls/$pollId"
                    params={{ pollId: poll.id }}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
