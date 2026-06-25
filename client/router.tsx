import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router'

import Layout from './components/Layout'
import Home from './components/Home'
import ProjectPage from './components/ProjectPage'
import CreateProject from './components/CreateProject'

const routes = createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="projects/:id" element={<ProjectPage />} />
    <Route path="project" element={<CreateProject />} />
  </Route>
)

const router = createBrowserRouter(routes)

export default router