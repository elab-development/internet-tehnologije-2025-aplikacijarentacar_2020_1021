import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  return (
    <ProtectedRoute>
      {isAdmin ? children : <Navigate to="/" replace />}
    </ProtectedRoute>
  )
}
