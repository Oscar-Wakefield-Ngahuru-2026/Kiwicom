export interface IssueData {
  project_id: number
  title: string
  html_url: string
  labels: string[] | null
  state: string
}

export interface IssueRecord extends IssueData {
  id: number
  created_at: Date
}
