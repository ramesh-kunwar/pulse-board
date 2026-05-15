// src/routes/polls/$pollId/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getPollApi } from '#/features/polls/api/pollsApi'
import { submitResponseApi } from '#/features/responses/api/responseApi'

type Option = { id: string; option_text: string }
type Question = {
  id: string
  question_text: string
  is_mandatory: boolean
  options: Option[]
}
type Poll = { id: string; title: string; status: string; questions: Question[] }

export const Route = createFileRoute('/polls/$pollId/')({
  component: PollPage,
})

function PollPage() {
  const { pollId } = Route.useParams()
  const navigate = useNavigate()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPollApi(pollId)
      .then((res) => setPoll(res.data))
      .catch(() => setError('Poll not found'))
      .finally(() => setLoading(false))
  }, [pollId])

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmit = async () => {
    if (!poll) return
    setError('')

    // validate mandatory questions
    const unanswered = poll.questions.filter(
      (q) => q.is_mandatory && !answers[q.id],
    )
    if (unanswered.length > 0) {
      setError('Please answer all mandatory questions')
      return
    }

    const payload = {
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      })),
    }

    try {
      setSubmitting(true)
      await submitResponseApi(pollId, payload)
      navigate({ to: '/polls/$pollId/results', params: { pollId } })
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading poll...</p>
      </div>
    )

  if (error && !poll)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )

  if (poll?.status === 'PUBLISHED') {
    navigate({ to: '/polls/$pollId/results', params: { pollId } })
    return null
  }

  if (poll?.status === 'CLOSED')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">This poll has closed.</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{poll?.title}</h1>

        {poll?.questions.map((question) => (
          <div
            key={question.id}
            className="bg-white rounded-xl shadow p-4 space-y-3"
          >
            <p className="text-sm font-medium text-gray-800">
              {question.question_text}
              {question.is_mandatory && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => handleSelect(question.id, option.id)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {option.option_text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
