// src/routes/polls/new.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreatePollForm } from '#/features/polls/components/CreatePollForm'

export const Route = createFileRoute('/polls/new')({
  component: CreatePollPage,
})

function CreatePollPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Poll</h1>
        <CreatePollForm />
      </div>
    </div>
  )
}
