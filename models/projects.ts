export interface ProjectData {
  fullName: string
  description: string | null
  htmlUrl: string
  homepage: string | null
  primaryLanguage: string | null
  topics: string[] | null
  stars: number
  openIssuesCount: number
  isOpenSource: boolean
  license: string | null
  readme: string | null
  aiSummary: string | null
  aiSummaryAt: Date | null
  lastSyncedAt: Date | null
}

export interface Project extends ProjectData {
  id: number
  createdAt: Date
}

export interface ProjectSummary {
  id: number
  name: string
  ownerName: string
  description: string | null
  githubUrl: string
  primaryLanguage: string | null
  topics: string[] | null
  stars: number
  openIssuesCount: number
  isOpenSource: boolean
  createdAt: string
}
