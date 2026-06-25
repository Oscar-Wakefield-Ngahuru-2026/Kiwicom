export interface Project {
  id: number
  name: string
  description: string
  github_url: string
  owner_name: string
  created_at: Date
}

export type NewProject = Omit<Project, 'id' | 'created_at'>
