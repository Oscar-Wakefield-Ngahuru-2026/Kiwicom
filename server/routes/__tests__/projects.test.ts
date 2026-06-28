import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import server from '../../server'
import db from '../../db/connection'

describe('GET /api/v1/projects', () => {
  beforeAll(async () => {
    await db.migrate.latest()
  })

  afterAll(async () => {
    await db.destroy()
  })

  beforeEach(async () => {
    await db('projects').del()
  })

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