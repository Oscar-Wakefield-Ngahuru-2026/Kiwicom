import request from 'superagent'
import type { Project, ProjectData, ProjectSummary } from '../models/projects'

const rootURL = new URL(`/api/v1`, document.baseURI)

export async function upsertProfile(data: {
  id: string
  githubUsername: string
  avatarUrl: string
}): Promise<void> {
  await request.post(`${rootURL}/profiles`).send(data)
}

export async function getGreeting() {
  const res = await request.get(`${rootURL}/greeting`)
  return res.body.greeting as string
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const res = await request.get(`${rootURL}/projects`)
  return (res.body as Project[]).map((row) => {
    const [ownerName, name] = row.fullName.split('/')
    return {
      id: row.id,
      name,
      ownerName,
      description: row.description ?? '',
      githubUrl: row.htmlUrl,
      primaryLanguage: row.primaryLanguage,
      topics: row.topics,
      stars: row.stars,
      openIssuesCount: row.openIssuesCount,
      isOpenSource: row.isOpenSource,
      createdAt: row.createdAt,
    }
  })
}

export async function getProjectById(id: number): Promise<Project> {
  const res = await request.get(`${rootURL}/projects/${id}`)
  const project = res.body as Project
  return project
}

// View model for the developer profile page. Comes back from the
// GET /api/v1/profiles/:username endpoint, populated with the columns
// added in the 20260629213147_extend_profiles migration.

export interface DeveloperProfile {
  id: string
  githubUsername: string
  avatarUrl: string | null
  bio: string | null
  role: string | null
  location: string | null
  githubLink: string | null
  hobbies: string[]
  socialLinks: { label: string; url: string }[]
  createdAt: string
}

export async function getProfileByUsername(
  username: string,
): Promise<DeveloperProfile> {
  const res = await request.get(`${rootURL}/profiles/${username}`)
  const profile = res.body
  return {
    ...profile,
    githubLink:
      profile.githubLink ?? `https://github.com/${profile.githubUsername}`,
  }
}

export async function updateProfile(
  id: string,
  data: Partial<DeveloperProfile>,
): Promise<DeveloperProfile> {
  const res = await request.patch(`${rootURL}/profiles/${id}`).send(data)
  const profile = res.body
  return {
    ...profile,
    githubLink:
      profile.githubLink ?? `https://github.com/${profile.githubUsername}`,
  }
}

export async function updateSocialLinks(
  id: string,
  links: { label: string; url: string }[],
): Promise<void> {
  await request.put(`${rootURL}/profiles/${id}/social-links`).send(links)
}

export async function addProject(data: ProjectData): Promise<Project> {
  const res = await request.post(`${rootURL}/projects`).send(data)
  return res.body
}

export async function getBookmarkedProjects(
  userId: string,
): Promise<Project[]> {
  const res = await request.get(`${rootURL}/bookmarks/${userId}`)
  return res.body as Project[]
}

export async function getSubmittedProjects(
  profileId: string,
): Promise<Project[]> {
  const res = await request.get(`${rootURL}/projects/by-owner/${profileId}`)
  return res.body
}

export async function addBookmark(
  userId: string,
  projectId: number,
): Promise<void> {
  await request.post(`${rootURL}/bookmarks`).send({ userId, projectId })
}

export async function removeBookmark(
  userId: string,
  projectId: number,
): Promise<void> {
  await request.delete(`${rootURL}/bookmarks/${userId}/${projectId}`)
}

export type { Project }

export interface RepoResult {
  fullName: string
  description: string
  htmlUrl: string
  homepage: string
  topics: string[]
  primaryLanguage: string
  stars: number
  openIssuesCount: number
  isOpenSource: boolean
  license: string | null
}

export async function getGithubRepos(
  token: string,
  search: string,
): Promise<RepoResult[]> {
  const res = await request
    .get(`${rootURL}/github/repos`)
    .set('Authorization', `Bearer ${token}`)
    .query({ search })
  return res.body as RepoResult[]
}
