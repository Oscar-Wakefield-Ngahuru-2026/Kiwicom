import { Link } from 'react-router'
import { useAuth } from '../hooks/use-auth'

function Navbar() {
  const { user, isLoggedIn, signIn, signOut } = useAuth()
  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link to="/" className="text-xl font-bold">
        KIWICOM.COM
      </Link>
      <Link to="/projects/new">Add Project</Link>

      {user ? (
        <div>
          <img
            // Standard shape for Supabase + GitHub OAuth
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.user_name}
          />
          <span>{user.user_metadata.user_name}</span>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <button onClick={signIn}>Sign-in with GitHub</button>
      )}
    </nav>
  )
}

export default Navbar
