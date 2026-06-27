import { Router } from 'express'
import octokit from '../lib/github/octokit'
import { normalizeGitHubRepo } from '../lib/github/normalizer'

const router = Router()

router.get('/search', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (!q) {
    return res.status(400).json({
      error: 'Missing required query parameter: q',
    })
  }

  const page = Math.max(1, Number(req.query.page) || 1)
  const perPage = 20

  try {
    const { data } = await octokit.rest.search.repos({
      q,
      per_page: perPage,
      page,
    })
    const items = data.items.map((item) => normalizeGitHubRepo(item))

    res.json({
      totalCount: data.total_count,
      incompleteResults: data.incomplete_results,
      items,
    })
  } catch (err) {
    console.error('GET /api/v1/github/search failed:', err)
    res.status(502).json({ error: 'Failed to fetch from GitHub' })
  }
})

export default router
