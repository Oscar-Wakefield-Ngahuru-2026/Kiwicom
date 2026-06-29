import { useAuth } from '../hooks/use-auth'
import { Navigate } from 'react-router'

export default function Login() {
  const { isLoggedIn, signIn } = useAuth()
  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={signIn}>Sign-in with GitHub</button>
    </div>
  )
}
