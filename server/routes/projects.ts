import { getProjects, getProjectById } from '../db/functions/projects'
import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
  const projects = await getProjects()
  res.json(projects)
} catch (err) {
  console.error('GET/api/v1/pprojects failed', err)
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
    res.status(500).json({ error: 'Failed to fetch project'})
  }
})
  
    

export default router