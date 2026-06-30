import { Link } from 'react-router'
import { useAuth } from '../hooks/use-auth'

function Navbar() {
  const { user, signIn, signOut } = useAuth()
  return (
    <nav className="flex items-center justify-between bg-gradient-to-r from-green-400 to-blue-300 px-6 py-4">
      <Link to="/" className="text-xl font-bold">
        KIWICOM.COM
      </Link>
      <Link to="/projects/new" className="font-semibold text-gray-900">
        Add Project
      </Link>

      {user ? (
        <div className="flex items-center gap-3">
          <Link
            to="/me"
            className="flex items-center gap-3 rounded hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <img
              // Standard shape for Supabase + GitHub OAuth
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.user_name}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-sm font-medium">
              {user.user_metadata.user_name}
            </span>
          </Link>
          <button
            onClick={signOut}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={signIn}
          className="text-sm font-medium hover:underline"
        >
          Sign-in with GitHub
        </button>
      )}
    </nav>
  )
}

export default Navbar
