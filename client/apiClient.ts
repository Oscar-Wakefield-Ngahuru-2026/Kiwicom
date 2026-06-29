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

//This is the view model for the developer profile page. Some fields come from the DB profile
//such as (githubUsername,avatarUrl, bio); the rest will populate when the database profiles schema is extended.
//I did not extend the Schema this will need to be another ticket that is picked up.

export interface DeveloperProfile {
  githubUsername: string
  avatarUrl: string | null
  bio: string | null
  role: string | null
  location: string | null
  githubLink: string
  socialLinks: { label: string; url: string }[]
  hobbies: string[]
}

//TODO(api): replace stub with real GET /api/v1/profiles/:username call when profile endpoints exist

//TODO(schema): role,location, socialLinks, hobbies populate from DB once columns have been added;
//profiles table currently only has githubUsername, avatarUrl and bio.

export async function getProfileByUsername(
  username: string,
): Promise<DeveloperProfile> {
  return {
    githubUsername: username,
    avatarUrl: null,
    bio: 'Stub bio -wiring up real profiles endpoint pending',
    role: 'Developer',
    location: 'Aotearoa',
    githubLink: `https://github.com/${username}`,
    socialLinks: [],
    hobbies: [],
  }
}

export async function addProject(data: ProjectData): Promise<Project> {
  const res = await request.post(`${rootURL}/projects`).send(data)
  return res.body
}

export type { Project }
