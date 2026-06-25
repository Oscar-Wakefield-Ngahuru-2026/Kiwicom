export interface ProjectData {
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  primary_language: string | null
  topics: string[] | null
  stars: number
  open_issues_count: number
  is_open_source: boolean
  license: string | null
  readme: string | null
  ai_summary: string | null
  ai_summary_at: Date | null
  last_synced_at: Date | null
}

export interface Project extends ProjectData {
  id: number
  created_at: Date
}
