import {
  getProjects,
  getProjectById,
  addProject,
} from '../db/functions/projects'
import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const projects = await getProjects()
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET: /api/v1/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const project = await getProjectById(Number(id))

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
    const { fullName, description, htmlUrl } = req.body
    if (!fullName || !htmlUrl) {
      res.status(400).json({ error: 'fullName and htmlUrl are required' })
      return
    }
    const newProject = await addProject({ fullName, description, htmlUrl })
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

export default router
