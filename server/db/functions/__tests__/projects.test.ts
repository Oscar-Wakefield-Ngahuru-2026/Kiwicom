import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import db from '../../connection'
import { getProjects } from '../projects'


describe('getProjects', () => {
  beforeAll(async () => {
    await db.migrate.latest()
  })

  afterAll(async () => {
    await db.destroy()
  })

  beforeEach(async () => {
    await db('projects').del()
  })

  it('returns an empty array when there are no projects', async () => {
    const result = await getProjects()
    expect(result).toEqual([])
  })

  it('returns all projects from the database', async () => {
    await db('projects').insert({
      name: 'Kiwicom',
      description: 'A discovery catalogue for GitHub projects',
      github_url: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      owner_name: 'Oscar-Wakefield-Ngahuru-2026',
    })
    const result = await getProjects()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      name: 'Kiwicom',
      owner_name: 'Oscar-Wakefield-Ngahuru-2026',
    })
  })
})