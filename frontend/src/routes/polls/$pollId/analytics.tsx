import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/polls/$pollId/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/polls/$pollId/analytics"!</div>
}
