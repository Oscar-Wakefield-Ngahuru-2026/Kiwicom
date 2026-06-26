import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { normalizeGitHubRepo } from './normalizer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const kiwicomFixture = JSON.parse(
  readFileSync(join(__dirname, '__fixtures__/repo-kiwicom.json'), 'utf-8'),
)

describe('normalizeGitHubRepo', () => {
  it('uses GitHub repo id as the primary key', () => {
    const result = normalizeGitHubRepo(kiwicomFixture)
    expect(result.id).toBe(1278672655)
  })

  it('renames snake_case fields to camelCase', () => {
    const result = normalizeGitHubRepo(kiwicomFixture)
    expect(result.fullName).toBe('Oscar-Wakefield-Ngahuru-2026/Kiwicom')
    expect(result.htmlUrl).toBe(
      'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
    )
    expect(result.primaryLanguage).toBe('TypeScript')
    expect(result.stars).toBe(0)
    expect(result.openIssuesCount).toBe(7)
  })

  it('passes null description through unchanged', () => {
    const result = normalizeGitHubRepo(kiwicomFixture)
    expect(result.description).toBeNull()
  })

  it('preserves empty topics array as [], not null', () => {
    const result = normalizeGitHubRepo(kiwicomFixture)
    expect(result.topics).toEqual([])
  })

  it('derives isOpenSource as false when license is null', () => {
    const result = normalizeGitHubRepo(kiwicomFixture)
    expect(result.isOpenSource).toBe(false)
    expect(result.license).toBeNull()
  })

  it('sets lastSyncedAt to current time', () => {
    const before = Date.now()
    const result = normalizeGitHubRepo(kiwicomFixture)
    const after = Date.now()
    expect(result.lastSyncedAt.getTime()).toBeGreaterThanOrEqual(before)
    expect(result.lastSyncedAt.getTime()).toBeLessThanOrEqual(after)
  })

  it('leaves readme, aiSummary, aiSummaryAt as null on the seed/normalize step', () => {
    const result = normalizeGitHubRepo(kiwicomFixture)
    expect(result.readme).toBeNull()
    expect(result.aiSummary).toBeNull()
    expect(result.aiSummaryAt).toBeNull()
  })
})