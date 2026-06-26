import { Router } from 'express'
import {
  getProjects,
  getProjectById,
  updateProject,
} from '../db/functions/projects'
import { fetchAndNormalize } from '../lib/github/fetcher'
import type { NewProject } from '../../models/projects'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const projects = await getProjects()
    res.json(projects)
  } catch (err) {
    console.error('GET /api/v1/projects failed:', err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

router.post('/:id/refresh', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid project id' })
  }

  const project = await getProjectById(id)
  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const [owner, repo] = project.fullName.split('/')

  try {
    const normalized = await fetchAndNormalize(owner, repo)
    const updated = await updateProject(
      id,
      toDbRow(normalized) as unknown as Partial<NewProject>,
    )
    res.json(updated)
  } catch (err) {
    console.error(`POST /api/v1/projects/${id}/refresh failed:`, err)
    res.status(502).json({ error: 'Failed to fetch from GitHub' })
  }
})

// Temporary camelCase → snake_case mapper for the DB write.
// Removed when Henry's projectColumns work auto-translates column names.
function toDbRow(
  p: Awaited<ReturnType<typeof fetchAndNormalize>>,
): Record<string, unknown> {
  return {
    full_name: p.fullName,
    description: p.description,
    html_url: p.htmlUrl,
    homepage: p.homepage,
    primary_language: p.primaryLanguage,
    topics: p.topics,
    stars: p.stars,
    open_issues_count: p.openIssuesCount,
    is_open_source: p.isOpenSource,
    license: p.license,
    readme: p.readme,
    ai_summary: p.aiSummary,
    ai_summary_at: p.aiSummaryAt,
    last_synced_at: p.lastSyncedAt,
  }
}

export default router
