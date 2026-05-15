import { Link, useRouterState } from '@tanstack/react-router'
import { useAuth } from '#/context/AuthContext'
import { logoutApi } from '#/features/auth/api/authApi'
import { useNavigate } from '@tanstack/react-router'

export function Navbar() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isAuthPage = pathname.startsWith('/auth/')
  if (isAuthPage) return null

  const handleLogout = async () => {
    await logoutApi()
    navigate({ to: '/auth/login' })
  }

  const navLinkClass = (to: string) =>
    `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
      pathname === to || pathname.startsWith(to + '/')
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="1" y="9" width="3" height="6" rx="1" fill="white" />
              <rect x="6" y="5" width="3" height="10" rx="1" fill="white" />
              <rect x="11" y="1" width="3" height="14" rx="1" fill="white" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            Pulse Board
          </span>
        </Link>

        {/* Nav links — only when signed in */}
        {!isLoading && user && (
          <nav className="flex items-center gap-1">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/polls/new" className={navLinkClass('/polls/new')}>
              New Poll
            </Link>
          </nav>
        )}

        {/* Right section */}
        <div className="flex items-center gap-3 ml-auto">
          {isLoading ? null : user ? (
            <>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold select-none">
                  {user.firstName[0].toUpperCase()}
                </span>
                <span className="text-sm text-gray-700 hidden sm:block">
                  {user.firstName}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="text-sm font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
