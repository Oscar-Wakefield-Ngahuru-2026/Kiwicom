export interface Projects {
  id: number
  name: string
  description: string
  github_url: string
  owner_name: string
  created_at: Date
}

export type NewProject = Omit<Projects, 'id' | 'create_at'>
