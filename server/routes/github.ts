import { Router } from 'express'
import { Octokit } from '@octokit/rest'

const router = Router()

router.get('/repos', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const search = req.query.search as string | undefined

  if (!token) {
    res.status(401).json({ error: 'No token' })
    return
  }

  try {
    const octokit = new Octokit({ auth: token })
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated', // Most frequent repos appears first
    })

    const repos = data
      .filter(
        (r) => !search || r.name.toLowerCase().includes(search.toLowerCase()),
      )
      .map((r) => ({
        fullName: r.full_name,
        description: r.description ?? '',
        htmlUrl: r.html_url,
        homepage: r.homepage ?? '',
        topics: r.topics ?? [],
        primaryLanguage: r.language ?? '',
        stars: r.stargazers_count,
        openIssuesCount: r.open_issues_count,
        isOpenSource: !r.private,
        license: r.license?.name ?? null,
      }))

    res.json(repos)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch repos' })
  }
})

export default router
