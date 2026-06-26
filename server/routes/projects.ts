import * as db from '../db/functions/projects'
import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const projects = await db.getProjects()
    res.json(projects)
  } catch (err) {
    console.error('GET/api/v1/pprojects failed', err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// POST
router.post('/', async (req, res) => {
  try {
    const { fullName, htmlUrl } = req.body
    if (!fullName || !htmlUrl) {
      res.status(400).json({ error: 'fullName and htmlUrl are required' })
      return
    }
    const newProject = await db.addProject({ fullName, htmlUrl })
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
