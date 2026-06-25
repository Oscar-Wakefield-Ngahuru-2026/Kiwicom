export interface IssueData {
  projectId: number
  title: string
  htmlUrl: string
  labels: string[] | null
  state: string
}

export interface IssueRecord extends IssueData {
  id: number
  createdAt: Date
}
