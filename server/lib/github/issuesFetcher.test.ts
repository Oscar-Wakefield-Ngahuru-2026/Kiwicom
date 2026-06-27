/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./octokit', () => ({
  default: {
    rest: {
      issues: {
        listForRepo: vi.fn(),
      },
    },
  },
}))

import octokit from './octokit'
import { fetchProjectIssues } from './issuesFetcher'

describe('fetchProjectIssues', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns normalized open issues with their labels and html url', async () => {
    vi.mocked(octokit.rest.issues.listForRepo).mockResolvedValue({
      data: [
        {
          id: 100,
          number: 42,
          title: 'Add dark mode support',
          html_url: 'https://github.com/foo/bar/issues/42',
          state: 'open',
          labels: [{ name: 'good first issue' }, { name: 'enhancement' }],
        },
      ],
    } as any)

    const result = await fetchProjectIssues('foo', 'bar')

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 100,
      title: 'Add dark mode support',
      htmlUrl: 'https://github.com/foo/bar/issues/42',
      labels: ['good first issue', 'enhancement'],
      state: 'open',
    })
  })

  it('excludes pull requests from results', async () => {
    vi.mocked(octokit.rest.issues.listForRepo).mockResolvedValue({
      data: [
        {
          id: 1,
          number: 1,
          title: 'a real issue',
          html_url: 'https://example.com/1',
          state: 'open',
          labels: [],
        },
        {
          id: 2,
          number: 2,
          title: 'a pull request',
          html_url: 'https://example.com/2',
          state: 'open',
          labels: [],
          pull_request: { url: 'https://example.com/pulls/2' },
        },
      ],
    } as any)

    const result = await fetchProjectIssues('any', 'repo')

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('a real issue')
  })

  it('extracts label name strings from the GitHub label objects', async () => {
    vi.mocked(octokit.rest.issues.listForRepo).mockResolvedValue({
      data: [
        {
          id: 1,
          number: 1,
          title: 'labeled issue',
          html_url: 'https://example.com/1',
          state: 'open',
          labels: [{ name: 'good first issue' }, { name: 'help wanted' }],
        },
      ],
    } as any)

    const result = await fetchProjectIssues('any', 'repo')

    expect(result[0].labels).toEqual(['good first issue', 'help wanted'])
  })

  it('returns an empty array when GitHub returns no issues', async () => {
    vi.mocked(octokit.rest.issues.listForRepo).mockResolvedValue({
      data: [],
    } as any)

    const result = await fetchProjectIssues('any', 'repo')

    expect(result).toEqual([])
  })
})
