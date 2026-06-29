import { useAuth } from '../hooks/use-auth'

export default function Login() {
  const { signIn } = useAuth()

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={signIn}>Sign-in with GitHub</button>
    </div>
  )
}
