import { Link } from 'react-router'

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <Link to="/" className="font-bold text-xl">KIWICOM.COM</Link>
      <Link to="/projects/new">Add Project</Link>
      <p>Welcome back, theDev2026!</p>
    </nav>
  )
}

export default Navbar