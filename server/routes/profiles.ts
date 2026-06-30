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

//Updates the profile feilds. The Body is a partial profile({ bio, role, ...}). It returns the updated profile including the social links via join.


router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    // TODO(auth): verify session.user.id === id before allowing the update
    const updated = await db.updateProfile(id, req.body)
    if (!updated) {
      return res.status(404).json({ error: 'Profile not found' })
    }
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

//Replaces the whole social_links list for the profile. Body is a array of {label, url}. It returns 204 No Content

router.put('/:id/social-links', async (req, res) => {
  try {
    const { id } = req.params
    const links = req.body
    if (!Array.isArray(links)) {
      return res
        .status(400)
        .json({ error: 'Body must be an array of {label, url}' })
    }
    // TODO(auth): verify session.user.id === id before allowing the update
    await db.replaceSocialLinks(id, links)
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update social links' })
  }
})

export default router
