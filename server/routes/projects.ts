import { getProjects } from '../db/functions/projects'
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
  
    

export default router