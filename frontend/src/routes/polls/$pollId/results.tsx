// src/routes/polls/$pollId/results.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { getAnalyticsApi } from '#/features/polls/api/pollsApi'

export const Route = createFileRoute('/polls/$pollId/results')({
  component: ResultsPage,
})

function ResultsPage() {
  const { pollId } = Route.useParams()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    getAnalyticsApi(pollId)
      .then((res) => {
        if (res.data.status !== 'PUBLISHED') {
          navigate({ to: '/polls/$pollId', params: { pollId } })
        } else {
          setAnalytics(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [pollId])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading results...</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Poll Results</h1>
        <p className="text-sm text-gray-500">
          Total responses: {analytics?.totalResponses}
        </p>

        {analytics?.questions?.map((question: any) => (
          <div
            key={question.questionId}
            className="bg-white rounded-xl shadow p-4 space-y-3"
          >
            <p className="text-sm font-medium text-gray-800">
              {question.question_text}
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
                      className="bg-green-500 h-2 rounded-full"
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
