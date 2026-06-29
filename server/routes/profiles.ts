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

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params
    const profile = await db.getProfileByUsername(username)
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }
    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

export default router
