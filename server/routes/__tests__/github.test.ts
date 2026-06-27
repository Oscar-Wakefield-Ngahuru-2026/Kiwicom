/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import server from '../../server'

vi.mock('../../lib/github/octokit', () => ({
  default: {
    rest: {
      search: {
        repos: vi.fn(),
      },
    },
  },
}))

import octokit from '../../lib/github/octokit'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/v1/github/search', () => {
  it('returns 400 when q is missing', async () => {
    const res = await request(server).get('/api/v1/github/search')
    expect(res.status).toBe(400)
  })

  it('returns normalized items on success', async () => {
    vi.mocked(octokit.rest.search.repos).mockResolvedValue({
      data: {
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            id: 100,
            full_name: 'foo/bar',
            description: 'a repo',
            html_url: 'https://github.com/foo/bar',
            homepage: null,
            language: 'TypeScript',
            topics: ['web'],
            stargazers_count: 42,
            open_issues_count: 3,
            private: false,
            license: { spdx_id: 'MIT' },
          },
        ],
      },
    } as any)

    const res = await request(server).get('/api/v1/github/search?q=test')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      totalCount: 1,
      incompleteResults: false,
    })
    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0]).toMatchObject({
      id: 100,
      fullName: 'foo/bar',
      primaryLanguage: 'TypeScript',
      stars: 42,
    })
  })

  it('returns 200 with empty items when search has no matches', async () => {
    vi.mocked(octokit.rest.search.repos).mockResolvedValue({
      data: {
        total_count: 0,
        incomplete_results: false,
        items: [],
      },
    } as any)

    const res = await request(server).get('/api/v1/github/search?q=zzznomatch')

    expect(res.status).toBe(200)
    expect(res.body.totalCount).toBe(0)
    expect(res.body.items).toEqual([])
  })

  it('returns 502 when octokit fails', async () => {
    vi.mocked(octokit.rest.search.repos).mockRejectedValue(
      new Error('rate limited'),
    )

    const res = await request(server).get('/api/v1/github/search?q=test')

    expect(res.status).toBe(502)
  })
})
