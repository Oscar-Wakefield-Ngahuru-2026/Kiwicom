import type { Project } from '../../../models/projects'

// snake_case fields below are GitHub's REST API format (Ruby heritage).
// This function is the boundary — every consumer downstream sees camelCase.

interface GitHubRepoResponse {
  id: number
  full_name: string
  description: string | null 
  html_url: string
  homepage: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  open_issues_count: number
  private: boolean
  license: { spdx_id: string | null } | null
}

export function normalizeGitHubRepo(
  repo: GitHubRepoResponse,
): Omit<Project, 'createdAt' | 'lastSyncedAt'> & { lastSyncedAt: Date } {
  return {
    id: repo.id,
    fullName: repo.full_name,
    description: repo.description,
    htmlUrl: repo.html_url,
    homepage: repo.homepage,
    primaryLanguage: repo.language,
    topics: repo.topics,
    stars: repo.stargazers_count,
    openIssuesCount: repo.open_issues_count,
    isOpenSource: !repo.private && repo.license !== null,
    license: repo.license?.spdx_id ?? null,
    readme: null,
    aiSummary: null,
    aiSummaryAt: null,
    lastSyncedAt: new Date(),
  }
}