import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import db from '../../connection'
import { getProjects, getProjectById, updateProject } from '../projects'

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

    expect(result).not.toBeNull()
    expect(result).toMatchObject({
      fullName: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
    })
  })

  it('returns null when the id does not exist', async () => {
    const result = await getProjectById(999999)
    expect(result).toBeNull()
  })
})

describe('updateProject', () => {
  it('updates the existing row and returns the new state', async () => {
    await db('projects').insert({
      id: 12345,
      full_name: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      html_url: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      description: 'old description',
      stars: 0,
    })

    const updated = await updateProject(12345, {
      stars: 42,
      description: 'new description',
    })

    expect(updated).toMatchObject({
      stars: 42,
      description: 'new description',
    })
  })

  it('returns null when the id does not exist', async () => {
    const result = await updateProject(999999, { stars: 5 })
    expect(result).toBeNull()
  })
})
