// src/routes/__root.tsx
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import appCss from '../styles.css?url'
import axios from 'axios'
import { setAccessToken } from '#/lib/axios'
import { AuthProvider } from '#/context/AuthContext'
import { AuthSync } from '#/components/AuthSync'

export const Route = createRootRoute({
  beforeLoad: async () => {
    try {
      const { data } = await axios.post(
        'http://localhost:4000/api/auth/refresh',
        {},
        { withCredentials: true },
      )
      setAccessToken(data.accessToken)
      return { user: data.user }
    } catch {
      return { user: null }
    }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Pulse Board' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <AuthSync />
          <Outlet />
        </AuthProvider>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
