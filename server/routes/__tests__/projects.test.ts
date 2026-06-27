/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest'
import request from 'supertest'
import server from '../../server'
import db from '../../db/connection'

vi.mock('../../lib/github/fetcher', () => ({
  fetchAndNormalize: vi.fn(),
}))

vi.mock('../../lib/github/issuesFetcher', () => ({
  fetchProjectIssues: vi.fn(),
}))

import { fetchAndNormalize } from '../../lib/github/fetcher'
import { fetchProjectIssues } from '../../lib/github/issuesFetcher'

beforeAll(async () => {
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})

beforeEach(async () => {
  await db('issues').del()
  await db('projects').del()
  vi.clearAllMocks()
  vi.mocked(fetchProjectIssues).mockResolvedValue([])
})

describe('GET /api/v1/projects', () => {
  it('returns 200 and an empty array when there are no projects', async () => {
    const res = await request(server).get('/api/v1/projects')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns 200 and the project rows when projects exist', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      html_url: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      description: 'A discovery catalogue for GitHub projects',
    })

    const res = await request(server).get('/api/v1/projects')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({
      fullName: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      htmlUrl: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
    })
  })
})

describe('POST /api/v1/projects/:id/refresh', () => {
  it('returns 404 when the project does not exist', async () => {
    const res = await request(server).post('/api/v1/projects/999999/refresh')
    expect(res.status).toBe(404)
  })

  it('returns 200 and the refreshed project on success', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      html_url: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      stars: 0,
    })

    vi.mocked(fetchAndNormalize).mockResolvedValue({
      id: 12345,
      fullName: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      description: 'updated description',
      htmlUrl: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      homepage: null,
      primaryLanguage: 'TypeScript',
      topics: [],
      stars: 100,
      openIssuesCount: 5,
      isOpenSource: false,
      license: null,
      readme: '# Kiwicom',
      aiSummary: null,
      aiSummaryAt: null,
      lastSyncedAt: new Date(),
    } as any)

    const res = await request(server).post('/api/v1/projects/12345/refresh')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      stars: 100,
      description: 'updated description',
    })
  })

  it('stores only beginner-friendly issues (good first issue or help wanted)', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'foo/bar',
      html_url: 'https://github.com/foo/bar',
    })

    vi.mocked(fetchAndNormalize).mockResolvedValue({
      id: 12345,
      fullName: 'foo/bar',
      description: 'x',
      htmlUrl: 'https://github.com/foo/bar',
      homepage: null,
      primaryLanguage: null,
      topics: [],
      stars: 0,
      openIssuesCount: 0,
      isOpenSource: false,
      license: null,
      readme: null,
      aiSummary: null,
      aiSummaryAt: null,
      lastSyncedAt: new Date(),
    } as any)

    vi.mocked(fetchProjectIssues).mockResolvedValue([
      {
        id: 1,
        title: 'beginner',
        htmlUrl: 'x/1',
        labels: ['good first issue'],
        state: 'open',
      },
      {
        id: 2,
        title: 'advanced',
        htmlUrl: 'x/2',
        labels: ['enhancement'],
        state: 'open',
      },
      {
        id: 3,
        title: 'help',
        htmlUrl: 'x/3',
        labels: ['help wanted'],
        state: 'open',
      },
    ])

    await request(server).post('/api/v1/projects/12345/refresh')

    const stored = await db('issues').where({ project_id: 12345 }).select('*')
    expect(stored).toHaveLength(2)
    const ids = stored.map((row) => row.id).sort()
    expect(ids).toEqual([1, 3])
  })

  it('returns 502 when GitHub fetch errors', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      html_url: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
    })

    vi.mocked(fetchAndNormalize).mockRejectedValue(new Error('GitHub is down'))

    const res = await request(server).post('/api/v1/projects/12345/refresh')

    expect(res.status).toBe(502)
  })
})

describe('GET /api/v1/projects/:id/issues', () => {
  it('returns an empty array for a project with no issues', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'foo/bar',
      html_url: 'https://github.com/foo/bar',
    })

    const res = await request(server).get('/api/v1/projects/12345/issues')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns the stored issues for a project with camelCase keys', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'foo/bar',
      html_url: 'https://github.com/foo/bar',
    })
    await db('issues').insert({
      id: 1,
      project_id: 12345,
      title: 'an issue',
      html_url: 'https://github.com/foo/bar/issues/1',
      labels: [],
      state: 'open',
    })

    const res = await request(server).get('/api/v1/projects/12345/issues')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({
      id: 1,
      projectId: 12345,
      title: 'an issue',
    })
  })

  it('returns 400 for an invalid id', async () => {
    const res = await request(server).get('/api/v1/projects/abc/issues')
    expect(res.status).toBe(400)
  })
})
