import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/use-auth'

export default function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return null
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
