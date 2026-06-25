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


// Mirrors server JSON (snake_case until knexfile.wrapIdentifier wires camelCase translation).
interface ProjectRow {
  id: number
  full_name: string
  description: string | null
  html_url: string
  created_at: string
}

export async function getProjects(): Promise<Project[]> {
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