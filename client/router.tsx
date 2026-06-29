import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router'

import Layout from './components/Layout'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import CreateProject from './pages/CreateProject'
import Login from './pages/Login'

export const routes = createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="projects/:id" element={<ProjectPage />} />
    <Route path="projects/new" element={<CreateProject />} />
    <Route path="login" element={<Login />} />
  </Route>,
)

const router = createBrowserRouter(routes)

export default router
