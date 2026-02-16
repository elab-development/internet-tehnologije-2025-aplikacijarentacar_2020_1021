import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/reviews', label: 'Reviews' },
]

const adminItems = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/dashboard', label: 'Dashboard' },
]

export function Sidebar() {
  const location = useLocation()
  const { isAuthenticated, isAdmin, logout } = useAuth()

  const linkClass = (to: string) =>
    `block px-3 py-2 rounded-lg transition-colors ${
      location.pathname === to
        ? 'bg-slate-600 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`

  return (
    <aside className="w-56 min-h-screen bg-slate-800 text-slate-100 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <Link to="/" className="text-xl font-semibold text-white">
          Car Rental
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label }) => (
          <Link key={to} to={to} className={linkClass(to)}>
            {label}
          </Link>
        ))}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-slate-700">
            {adminItems.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClass(to)}>
                {label}
              </Link>
            ))}
          </div>
        )}
        <div className="pt-4 mt-4 border-t border-slate-700">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={logout}
            >
              Odjavi se
            </Button>
          ) : (
            <>
              <Link to="/login" className={linkClass('/login')}>
                Login
              </Link>
              <Link to="/register" className={linkClass('/register')}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </aside>
  )
}
