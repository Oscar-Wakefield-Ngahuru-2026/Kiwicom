export interface ProfileData {
  githubUsername: string
  avatarUrl: string | null
  bio: string | null
}

export interface ProfileRecord extends ProfileData {
  id: string
  createdAt: Date
}
