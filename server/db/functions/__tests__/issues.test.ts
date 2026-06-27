import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import db from '../../connection'
import { getIssuesForProject, replaceIssuesForProject } from '../issues'

beforeAll(async () => {
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})

beforeEach(async () => {
  await db('issues').del()
  await db('projects').del()
  // Seed a project so the foreign key constraint succeeds.
  await db('projects').insert({
    id: 12345,
    full_name: 'foo/bar',
    html_url: 'https://github.com/foo/bar',
  })
})

describe('getIssuesForProject', () => {
  it('returns an empty array when the project has no issues', async () => {
    const result = await getIssuesForProject(12345)
    expect(result).toEqual([])
  })

  it('returns the project’s issues with camelCase keys', async () => {
    await db('issues').insert({
      id: 1,
      project_id: 12345,
      title: 'an issue',
      html_url: 'https://github.com/foo/bar/issues/1',
      labels: ['good first issue'],
      state: 'open',
    })

    const result = await getIssuesForProject(12345)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 1,
      projectId: 12345,
      title: 'an issue',
      htmlUrl: 'https://github.com/foo/bar/issues/1',
      state: 'open',
    })
  })
})

describe('replaceIssuesForProject', () => {
  it('inserts new issues when there were none before', async () => {
    await replaceIssuesForProject(12345, [
      {
        id: 1,
        title: 'new issue',
        htmlUrl: 'https://github.com/foo/bar/issues/1',
        labels: ['good first issue'],
        state: 'open',
      },
    ])

    const result = await getIssuesForProject(12345)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('new issue')
  })

  it('replaces all existing issues for the project', async () => {
    await db('issues').insert({
      id: 1,
      project_id: 12345,
      title: 'old issue',
      html_url: 'https://github.com/foo/bar/issues/1',
      labels: [],
      state: 'open',
    })

    await replaceIssuesForProject(12345, [
      {
        id: 2,
        title: 'replacement',
        htmlUrl: 'https://github.com/foo/bar/issues/2',
        labels: [],
        state: 'open',
      },
    ])

    const result = await getIssuesForProject(12345)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('handles an empty issues array by wiping only', async () => {
    await db('issues').insert({
      id: 1,
      project_id: 12345,
      title: 'old issue',
      html_url: 'https://github.com/foo/bar/issues/1',
      labels: [],
      state: 'open',
    })

    await replaceIssuesForProject(12345, [])

    const result = await getIssuesForProject(12345)
    expect(result).toEqual([])
  })

  it('does not touch issues for other projects', async () => {
    await db('projects').insert({
      id: 99999,
      full_name: 'baz/qux',
      html_url: 'https://github.com/baz/qux',
    })
    await db('issues').insert({
      id: 100,
      project_id: 99999,
      title: 'other project issue',
      html_url: 'https://github.com/baz/qux/issues/100',
      labels: [],
      state: 'open',
    })

    await replaceIssuesForProject(12345, [
      {
        id: 1,
        title: 'project 12345 issue',
        htmlUrl: 'https://github.com/foo/bar/issues/1',
        labels: [],
        state: 'open',
      },
    ])

    const others = await getIssuesForProject(99999)
    expect(others).toHaveLength(1)
    expect(others[0].title).toBe('other project issue')
  })
})
