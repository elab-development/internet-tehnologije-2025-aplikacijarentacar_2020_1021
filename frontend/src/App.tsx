import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VehiclesPage } from './pages/VehiclesPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
