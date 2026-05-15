// src/routes/polls/$pollId/analytics.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '#/context/AuthContext'
import { useAnalytics } from '#/features/analytics/hooks/useAnalytics'
import { publishPollApi, closePollApi } from '#/features/polls/api/pollsApi'
import { getSocket } from '#/lib/socket'

export const Route = createFileRoute('/polls/$pollId/analytics')({
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const { pollId } = Route.useParams()
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const { analytics, loading, refetch } = useAnalytics(pollId)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: '/auth/login' })
  }, [user, isLoading])

  useEffect(() => {
    const socket = getSocket()
    socket.connect()
    socket.on('connect', () => console.log('socket connected:', socket.id))
    socket.on('connect_error', (err) => console.log('socket error:', err))
    socket.emit('join:poll', pollId)
    socket.on('response:submitted', () => {
      refetch()
    })
    return () => {
      socket.off('response:submitted')
      socket.disconnect()
    }
  }, [pollId])

  const handleClose = async () => {
    setActionError('')
    try {
      await closePollApi(pollId)
      refetch()
    } catch (e: any) {
      setActionError(e?.response?.data?.message || 'Failed to close poll')
    }
  }

  const handlePublish = async () => {
    setActionError('')
    try {
      await publishPollApi(pollId)
      refetch()
    } catch (e: any) {
      setActionError(e?.response?.data?.message || 'Failed to publish poll')
    }
  }

  if (loading || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                analytics?.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : analytics?.status === 'CLOSED'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {analytics?.status}
            </span>
          </div>
          <div className="flex gap-3 items-center">
            {analytics?.status === 'ACTIVE' && (
              <button
                onClick={handleClose}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600"
              >
                Close Poll
              </button>
            )}
            {analytics?.status === 'CLOSED' && (
              <button
                onClick={handlePublish}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Publish Results
              </button>
            )}
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="text-sm text-gray-500 hover:underline"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {actionError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Responses</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {analytics?.totalResponses ?? 0}
          </p>
        </div>

        {analytics?.questions?.map((question: any) => (
          <div
            key={question.questionId}
            className="bg-white rounded-xl shadow p-4 space-y-3"
          >
            <p className="text-sm font-medium text-gray-800">
              {question.question_text}
            </p>
            <p className="text-xs text-gray-400">
              {question.totalAnswers} answers
            </p>
            <div className="space-y-2">
              {question.options.map((option: any) => (
                <div key={option.optionId}>
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>{option.option_text}</span>
                    <span>
                      {option.count} ({Math.round(option.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
