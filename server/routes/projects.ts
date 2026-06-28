// This file defines the HTTP endpoints for projects.
// Each route maps a URL (like POST /api/v1/projects/:id/refresh) to a
// database function or a GitHub fetcher. The routes don't contain logic
// themselves — they validate the input, call the right helper, and
// shape the response. The actual work lives in db/functions and lib/.

import { Router } from 'express'
import {
  getProjects,
  getProjectById,
  updateProject,
  addProject,
} from '../db/functions/projects'
import {
  getIssuesForProject,
  replaceIssuesForProject,
} from '../db/functions/issues'
import { fetchAndNormalize } from '../lib/github/fetcher'
import { fetchProjectIssues } from '../lib/github/issuesFetcher'

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

router.post('/', async (req, res) => {
  const { fullName, description, htmlUrl } = req.body
  if (!fullName || !htmlUrl) {
    return res.status(400).json({ error: 'fullName and htmlUrl are required' })
  }

  try {
    const newProject = await addProject({ fullName, description, htmlUrl })
    res.status(201).json(newProject)
  } catch (err) {
    console.error('POST /api/v1/projects failed:', err)
    res.status(500).json({ error: 'Failed to add project' })
  }
})

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
    const [normalized, allIssues] = await Promise.all([
      fetchAndNormalize(owner, repo),
      fetchProjectIssues(owner, repo),
    ])

    const beginnerIssues = allIssues.filter((issue) =>
      issue.labels.some(
        (label) => label === 'good first issue' || label === 'help wanted',
      ),
    )

    const updated = await updateProject(id, normalized)
    await replaceIssuesForProject(id, beginnerIssues)

    res.json(updated)
  } catch (err) {
    console.error(`POST /api/v1/projects/${id}/refresh failed:`, err)
    res.status(502).json({ error: 'Failed to fetch from GitHub' })
  }
})

router.get('/:id/issues', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid project id' })
  }

  try {
    const issues = await getIssuesForProject(id)
    res.json(issues)
  } catch (err) {
    console.error(`GET /api/v1/projects/${id}/issues failed:`, err)
    res.status(500).json({ error: 'Failed to fetch issues' })
  }
})

export default router
