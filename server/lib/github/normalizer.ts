// This file translates GitHub's data shape into our app's data shape.
// GitHub names its fields in snake_case (full_name, html_url, stargazers_count).
// Our codebase uses camelCase (fullName, htmlUrl, stars). This is the one
// place that translation happens — everything downstream sees camelCase.

import type { Project } from '../../../models/projects'

interface GitHubRepoResponse {
  id: number
  full_name: string
  description: string | null 
  html_url: string
  homepage: string | null
  language: string | null
  topics?: string[]
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
    topics: repo.topics ?? [],
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