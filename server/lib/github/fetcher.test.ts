/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

vi.mock('./octokit', () => ({
  default: {
    rest: {
      repos: {
        get: vi.fn(),
        getReadme: vi.fn(),
      },
    },
  },
}))

import octokit from './octokit'
import { fetchAndNormalize } from './fetcher'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoFixture = JSON.parse(
  readFileSync(join(__dirname, '__fixtures__/repo-kiwicom.json'), 'utf-8'),
)
const readmeFixture = JSON.parse(
  readFileSync(join(__dirname, '__fixtures__/readme-kiwicom.json'), 'utf-8'),
)

describe('fetchAndNormalize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('return a normalized row with the readme decoded from base64', async () => {
    vi.mocked(octokit.rest.repos.get).mockResolvedValue({
      data: repoFixture,
    } as any)
    vi.mocked(octokit.rest.repos.getReadme).mockResolvedValue({
      data: readmeFixture,
    } as any)

    const result = await fetchAndNormalize(
      'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      'Kiwicom',
    )
    expect(result.fullName).toBe('Oscar-Wakefield-Ngahuru-2026/Kiwicom')
    expect(result.readme).toContain('# Kiwicom')
  })
  it('returns readme as null when GitHub responds 404 for the readme', async () => {
    vi.mocked(octokit.rest.repos.get).mockResolvedValue({
      data: repoFixture,
    } as any)
    vi.mocked(octokit.rest.repos.getReadme).mockRejectedValue(
      new Error('Not Found'),
    )

    const result = await fetchAndNormalize('any', 'repo')

    expect(result.readme).toBeNull()
  })
  it('truncates readme at 50KB', async () => {
    const hugeContent = Buffer.from('x'.repeat(60000)).toString('base64')
    vi.mocked(octokit.rest.repos.get).mockResolvedValue({
      data: repoFixture,
    } as any)
    vi.mocked(octokit.rest.repos.getReadme).mockResolvedValue({
      data: { ...readmeFixture, content: hugeContent, size: 60000 },
    } as any)

    const result = await fetchAndNormalize('any', 'repo')

    expect(result.readme?.length).toBe(50000)
  })
})
