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

import { fetchAndNormalize } from '../../lib/github/fetcher'

beforeAll(async () => {
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})

beforeEach(async () => {
  await db('projects').del()
  vi.clearAllMocks()
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
    expect(vi.mocked(fetchAndNormalize)).toHaveBeenCalledWith(
      'Oscar-Wakefield-Ngahuru-2026',
      'Kiwicom',
    )
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
