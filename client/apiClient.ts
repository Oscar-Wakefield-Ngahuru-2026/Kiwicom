import request from 'superagent'

const rootURL = new URL(`/api/v1`, document.baseURI)

export async function getGreeting() {
  const res = await request.get(`${rootURL}/greeting`)
  return res.body.greeting as string
}

export interface Project {
  id: number
  name: string
  description: string 
  githubUrl: string 
  ownerName: string 
  createdAt: string 
}

interface ProjectRow {
  id: number
  name: string
  description: string
  github_url: string
  owner_name: string 
  created_at: string 
}

export async function getProjects(): Promise<Project[]> {
  const res = await request.get(`${rootURL}/projects`)
  return (res.body as ProjectRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    githubUrl: row.github_url,
    ownerName: row.owner_name,
    createdAt: row.created_at

  }))
}
