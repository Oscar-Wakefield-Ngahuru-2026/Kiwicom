import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import server from '../../server'
import db from '../../db/connection'

beforeAll(async () => {
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})

beforeEach(async () => {
  await db('projects').del()
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

describe('GET /api/v1/projects/:id', () => {
  it('returns 200 and the project when the id exists', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      html_url: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      description: 'A discovery catalogue for GitHub projects',
    })

    const res = await request(server).get('/api/v1/projects/12345')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      fullName: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      htmlUrl: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
    })
  })

  it('returns 404 when the project does not exist', async () => {
    const res = await request(server).get('/api/v1/projects/999999')
    expect(res.status).toBe(404)
  })
})
