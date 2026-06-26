import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import octokit from '../lib/github/octokit'
import { normalizeGitHubRepo } from '../lib/github/normalizer'
import db from '../db/connection'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Maps the camelCase normalizer output to the snake_case columns Postgres has.
// This is a TEMPORARY second boundary — when Henry's projectColumns work lands
// and Knex auto-translates column names, this function goes away.
function toDbRow(p: ReturnType<typeof normalizeGitHubRepo>) {
  return {
    id: p.id,
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

async function seed() {
  const seedListPath = join(__dirname, 'seedProjects.json')
  const repos: string[] = JSON.parse(readFileSync(seedListPath, 'utf-8'))

  let succeeded = 0
  let failed = 0

  for (const fullName of repos) {
    const [owner, repo] = fullName.split('/')
    if (!owner || !repo) {
      console.error(`x ${fullName}: not in owner/repo format`)
      failed++
      continue
    }

    try {
      const { data } = await octokit.rest.repos.get({ owner, repo})
      const normalized = normalizeGitHubRepo(data)
      await db('projects').insert(toDbRow(normalized)).onConflict('id').merge()
      console.log(`✓ ${fullName}`)
      succeeded++
    }catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`✗ ${fullName}: ${message}`)
      failed++
    }
  } 

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`)
  await db.destroy()

  
  if (failed > 0) process.exit(1)
}

seed().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})