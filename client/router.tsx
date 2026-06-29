import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router'

import Layout from './components/Layout'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import CreateProject from './pages/CreateProject'
import DeveloperProfile from './pages/DeveloperProfile'

export const routes = createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="projects/:id" element={<ProjectPage />} />
    <Route path="projects/new" element={<CreateProject />} />
    <Route path="developers/:username" element={<DeveloperProfile />} />
  </Route>,
)

const router = createBrowserRouter(routes)

export default router
