import request from 'superagent'
import type { Project } from '../models/projects'

const rootURL = new URL(`/api/v1`, document.baseURI)

export async function getGreeting() {
  const res = await request.get(`${rootURL}/greeting`)
  return res.body.greeting as string
}

// Mirrors server JSON (snake_case until knexfile.wrapIdentifier wires camelCase translation).
interface ProjectRow {
  id: number
  full_name: string
  description: string | null
  html_url: string
  created_at: string
}

// View model for the card grid — derived from Project, with fullName pre-split
// into owner + name so consumers don't need to do it. Narrower than the canonical
// Project because the browse view doesn't need readme / aiSummary / etc.
export interface ProjectSummary {
  id: number
  name: string
  description: string
  githubUrl: string
  ownerName: string
  createdAt: string
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const res = await request.get(`${rootURL}/projects`)
  return (res.body as ProjectRow[]).map((row) => {
    const [ownerName, name] = row.full_name.split('/')
    return {
      id: row.id,
      name,
      description: row.description ?? '',
      githubUrl: row.html_url,
      ownerName,
      createdAt: row.created_at,
    }
  })
}

export async function getProjectById(id: number): Promise<Project> {
  const res = await request.get(`${rootURL}/projects/${id}`)
  const project = res.body as Project
  return project
}

export type { Project }
