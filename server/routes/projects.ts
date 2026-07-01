import { Router } from 'express'
import * as db from '../db/functions/projects'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const projects = await db.getProjects()
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET
router.get('/by-owner/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params
    const projects = await db.getProjectsByOwner(profileId)
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch projects by owner' })
  }
})

// GET: /api/v1/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const project = await db.getProjectById(Number(id))

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// POST
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      description,
      htmlUrl,
      homepage,
      primaryLanguage,
      topics,
      stars,
      openIssuesCount,
      isOpenSource,
      license,
      ownerProfileId,
    } = req.body

    if (!fullName || !htmlUrl) {
      res.status(400).json({ error: 'fullName and htmlUrl are required' })
      return
    }
    const newProject = await db.addProject({
      fullName,
      description,
      htmlUrl,
      homepage,
      primaryLanguage,
      topics,
      stars,
      openIssuesCount,
      isOpenSource,
      license,
      ownerProfileId,
    })
    res.status(201).json(newProject)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error('unknown error while adding new Project')
    }
    res.status(500).json({ error: 'Failed to add Project' })
  }
})

// Update - PUT: /api/v1/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const project = await db.updateProject(id, req.body)
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(project)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// DELETE: /api/v1/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await db.deleteProject(id)
    res.sendStatus(204)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    res.sendStatus(500)
  }
})

export default router
