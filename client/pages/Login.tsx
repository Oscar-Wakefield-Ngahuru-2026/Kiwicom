import { useAuth } from '../hooks/use-auth'
import { Navigate } from 'react-router'

export default function Login() {
  const { isLoggedIn, signIn } = useAuth()
  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome to Kiwicom</h1>
      <p className="text-sm text-slate-500">
        Sign in to share and discover projects
      </p>
      <button
        onClick={signIn}
        className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Sign in with GitHub
      </button>
    </div>
  )
}
