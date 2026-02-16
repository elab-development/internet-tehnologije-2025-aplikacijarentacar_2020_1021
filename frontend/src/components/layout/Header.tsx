import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-6 bg-slate-800 text-slate-100 shadow">
      <Link to="/" className="text-xl font-semibold text-white">
        Car Rental
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          to="/login"
          className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
        >
          Prijavi se
        </Link>
        <Link
          to="/register"
          className="px-3 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition-colors"
        >
          Registruj se
        </Link>
      </nav>
    </header>
  )
}
