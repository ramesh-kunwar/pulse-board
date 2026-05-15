// src/routes/polls/$pollId/analytics.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useAuth } from '#/context/AuthContext'
import { useAnalytics } from '#/features/analytics/hooks/useAnalytics'
import { publishPollApi } from '#/features/polls/api/pollsApi'
import { getSocket } from '#/lib/socket'

export const Route = createFileRoute('/polls/$pollId/analytics')({
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const { pollId } = Route.useParams()
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const { analytics, loading, refetch } = useAnalytics(pollId)
  const refetchRef = useRef(refetch)
  useEffect(() => {
    refetchRef.current = refetch
  })

  // auth guard
  useEffect(() => {
    if (!isLoading && !user) navigate({ to: '/auth/login' })
  }, [user, isLoading])

  // socket — join room and listen for new responses
  useEffect(() => {
    const socket = getSocket()

    const onConnect = () => {
      socket.emit('join:poll', pollId)
    }
    const onConnectError = (err: Error) =>
      console.log('socket error:', err)
    const onResponseSubmitted = () => {
      refetchRef.current()
    }

    socket.on('connect', onConnect)
    socket.on('connect_error', onConnectError)
    socket.on('response:submitted', onResponseSubmitted)

    socket.connect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('connect_error', onConnectError)
      socket.off('response:submitted', onResponseSubmitted)
      socket.disconnect()
    }
  }, [pollId])

  const handlePublish = async () => {
    try {
      await publishPollApi(pollId)
      refetch()
    } catch {
      alert('Failed to publish')
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <div className="flex gap-3">
            {analytics?.status === 'ACTIVE' && (
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
