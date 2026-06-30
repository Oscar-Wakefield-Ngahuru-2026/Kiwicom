import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router'

import ProtectedRoute from './components/ProtectedRoute'

import Layout from './components/Layout'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import CreateProject from './pages/CreateProject'
import DeveloperProfile from './pages/DeveloperProfile'
import Login from './pages/Login'
import MyProfile from './pages/MyProfile'

export const routes = createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="projects/:id" element={<ProjectPage />} />
    <Route path="projects/new" element={<CreateProject />} />
    <Route path="me" element={<MyProfile />} />
    <Route path="developers/:username" element={<DeveloperProfile />} />
    <Route path="login" element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route path="projects/new" element={<CreateProject />} />
    </Route>
  </Route>,
)

const router = createBrowserRouter(routes)

export default router
