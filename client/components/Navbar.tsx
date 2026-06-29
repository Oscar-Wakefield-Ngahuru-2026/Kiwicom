import { Link } from 'react-router'

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-gradient-to-r from-green-400 to-blue-400 px-6 py-4">
      <Link to="/" className="text-xl font-bold">
        KIWICOM.COM
      </Link>
      <Link to="/projects/new" className="font-semibold text-gray-900">
        Add Project
      </Link>
      <p className="font-semibold text-gray-900">Welcome back, theDev2026!</p>
    </nav>
  )
}

export default Navbar
