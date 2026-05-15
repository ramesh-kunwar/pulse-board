import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/polls/$pollId/results')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/polls/$pollId/results"!</div>
}
