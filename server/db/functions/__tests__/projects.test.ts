import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import db from '../../connection'
import { getProjects, getProjectById } from '../projects'

beforeAll(async () => {
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})

beforeEach(async () => {
  await db('projects').del()
})

describe('getProjects', () => {
  it('returns an empty array when there are no projects', async () => {
    const result = await getProjects()
    expect(result).toEqual([])
  })

  it('returns all projects from the database', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      html_url: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      description: 'A discovery catalogue for GitHub projects',
    })
    const result = await getProjects()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      fullName: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      htmlUrl: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
    })
  })
})

describe('getProjectById', () => {
  it('returns the project when the id exists', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      html_url: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      description: 'A discovery catalogue for GitHub projects',
    })

    const result = await getProjectById(12345)

    expect(result).toMatchObject({
      fullName: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      htmlUrl: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
    })
  })

  it('returns undefined when the id does not exist', async () => {
    const result = await getProjectById(999999)
    expect(result).toBeUndefined()
  })
})
