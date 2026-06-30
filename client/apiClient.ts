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

interface ProjectRow {
  id: number
  fullName: string
  description: string | null
  htmlUrl: string
  createdAt: string
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const res = await request.get(`${rootURL}/projects`)
  return (res.body as ProjectRow[]).map((row) => {
    const [ownerName, name] = row.fullName.split('/')
    return {
      id: row.id,
      name,
      description: row.description ?? '',
      githubUrl: row.htmlUrl,
      ownerName,
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
    links: { label: string; url: string}[]
  ): Promise<void> {
    await request.put(`${rootURL}/profiles/${id}/social-links`).send(links)
  }

export async function addProject(data: ProjectData): Promise<Project> {
  const res = await request.post(`${rootURL}/projects`).send(data)
  return res.body
}

export type { Project }
