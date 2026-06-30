// HTTP routes for bookmarks.
// GET /:userId — returns the user's bookmarked projects (full project rows)
// POST /         — body: {userId, projectId} — adds a bookmark (no-op if dup)
// DELETE /:userId/:projectId — removes the bookmark

import { Router } from 'express'
import * as db from '../db/functions/bookmarks'

const router = Router()

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const projects = await db.getBookmarkedProjects(userId)
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch bookmarks' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { userId, projectId } = req.body
    if (!userId || !projectId) {
      return res
        .status(400)
        .json({ error: 'userId and projectId are required' })
    }
    // TODO(auth): verify session.user.id === userId before allowing the add
    await db.addBookmark({ userId, projectId })
    res.sendStatus(201)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add bookmark' })
  }
})

router.delete('/:userId/:projectId', async (req, res) => {
  try {
    const { userId, projectId } = req.params
    // TODO(auth): verify session.user.id === userId before allowing the delete
    await db.removeBookmark({
      userId,
      projectId: Number(projectId),
    })
    res.status(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove bookmark' })
  }
})

export default router
