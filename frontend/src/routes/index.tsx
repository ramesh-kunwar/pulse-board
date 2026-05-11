import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="container mx-auto">
      <h1>Hello World</h1>
    </div>
  )
}
