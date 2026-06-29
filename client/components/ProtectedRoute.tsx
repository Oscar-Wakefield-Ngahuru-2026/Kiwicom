import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/use-auth'

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
