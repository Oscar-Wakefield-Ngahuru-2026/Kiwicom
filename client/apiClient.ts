import request from 'superagent'
import type { Project, ProjectData, ProjectSummary } from '../models/projects'

const rootURL = new URL(`/api/v1`, document.baseURI)

export async function getGreeting() {
  const res = await request.get(`${rootURL}/greeting`)
  return res.body.greeting as string
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const res = await request.get(`${rootURL}/projects`)
  return (res.body as Project[]).map((p) => {
    const [ownerName, name] = p.fullName.split('/')
    return {
      id: p.id,
      name,
      description: p.description ?? '',
      githubUrl: p.htmlUrl,
      ownerName,
      createdAt: String(p.createdAt),
    }
  })
}

export async function getProjectById(id: number): Promise<Project> {
  const res = await request.get(`${rootURL}/projects/${id}`)
  return res.body as Project
}

export async function addProject(data: ProjectData): Promise<Project> {
  const res = await request.post(`${rootURL}/projects`).send(data)
  return res.body as Project
}

export type { Project }
