import { Outlet } from 'react-router'

function Layout() {
  return (
    <div>
      {/* Navbar will go here */}
      <Outlet />
    </div>
  )
}

export default Layout
