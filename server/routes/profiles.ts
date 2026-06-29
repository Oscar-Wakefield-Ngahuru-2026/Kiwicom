import { Router } from 'express'
import * as db from '../db/functions/profiles'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { id, githubUsername, avatarUrl } = req.body
    if (!id || !githubUsername) {
      res.status(400).json({ error: 'id and githubUsername are required' })
      return
    }

    await db.upsertProfile({ id, githubUsername, avatarUrl })
    res.sendStatus(201)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to upsert profile' })
  }
})

export default router
