import { Link } from 'react-router'
import { useAuth } from '../hooks/use-auth'
import { getAvatarForUser } from '../teamAvatars'

const MOONLIGHT = '#F3EAD7'
const MIST = '#B3BCD0'
const LANTERN = '#E6B870'
const FONT_BODY = 'Lexend, system-ui, sans-serif'
const FONT_MONO = 'JetBrains Mono, ui-monospace, monospace'

// Soft glass on top of the hero — mostly transparent, mild dark tint + blur
// keeps text readable on any page background.
const NAV_BG = 'rgba(14, 20, 38, 0.35)'

function Navbar() {
  const { user, signIn, signOut } = useAuth()
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md"
      style={{
        backgroundColor: NAV_BG,
        fontFamily: FONT_BODY,
      }}
    >
      <Link
        to="/"
        className="text-xl font-medium tracking-tight"
        style={{ color: MOONLIGHT, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
      >
        Kiwicom<span style={{ color: '#E8B4C4' }}>.</span>
        <span
          className="ml-1 text-xs uppercase tracking-[0.15em]"
          style={{ fontFamily: FONT_MONO, color: MIST }}
        >
          com
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          to="/projects/new"
          className="text-sm font-medium hover:opacity-80 transition"
          style={{ color: MOONLIGHT, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          Add Project
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/me"
              className="flex items-center gap-2 rounded hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: LANTERN }}
            >
              <img
                src={getAvatarForUser(user.user_metadata.user_name)}
                alt={user.user_metadata.user_name}
                className="h-8 w-8 rounded-full ring-1"
                style={{ boxShadow: `0 0 0 1px ${MOONLIGHT}55` }}
              />
              <span
                className="text-sm font-medium"
                style={{
                  color: MOONLIGHT,
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                {user.user_metadata.user_name}
              </span>
            </Link>
            <button
              onClick={signOut}
              className="text-xs uppercase tracking-[0.15em] hover:opacity-100 opacity-80 transition"
              style={{
                fontFamily: FONT_MONO,
                color: MIST,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="text-xs uppercase tracking-[0.15em] hover:opacity-100 opacity-90 transition"
            style={{
              fontFamily: FONT_MONO,
              color: LANTERN,
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            }}
          >
            Sign in with GitHub
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
