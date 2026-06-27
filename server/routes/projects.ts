import { Router } from 'express'
import {
  getProjects,
  getProjectById,
  updateProject,
  addProject,
} from '../db/functions/projects'
import { fetchAndNormalize } from '../lib/github/fetcher'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const projects = await getProjects()
    res.json(projects)
  } catch (err) {
    console.error('GET /api/v1/projects failed:', err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET /api/v1/projects/:id — single project detail (Feature 5)
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid project id' })
  }

  try {
    const project = await getProjectById(id)
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(project)
  } catch (err) {
    console.error(`GET /api/v1/projects/${id} failed:`, err)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// POST /api/v1/projects — create a new project (Feature 9)
router.post('/', async (req, res) => {
  const { fullName, description, htmlUrl } = req.body
  if (!fullName || !htmlUrl) {
    return res
      .status(400)
      .json({ error: 'fullName and htmlUrl are required' })
  }

  try {
    const newProject = await addProject({ fullName, description, htmlUrl })
    res.status(201).json(newProject)
  } catch (err) {
    console.error('POST /api/v1/projects failed:', err)
    res.status(500).json({ error: 'Failed to add project' })
  }
})

// POST /api/v1/projects/:id/refresh — re-fetch from GitHub and update the row (Ticket B)
router.post('/:id/refresh', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid project id' })
  }

  const project = await getProjectById(id)
  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const [owner, repo] = project.fullName.split('/')

  try {
    const normalized = await fetchAndNormalize(owner, repo)
    const updated = await updateProject(id, normalized)
    res.json(updated)
  } catch (err) {
    console.error(`POST /api/v1/projects/${id}/refresh failed:`, err)
    res.status(502).json({ error: 'Failed to fetch from GitHub' })
  }
})

export default router
