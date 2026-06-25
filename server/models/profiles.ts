export interface ProfileData {
  github_username: string
  avatar_url: string | null
  bio: string | null
}

export interface ProfileRecord extends ProfileData {
  id: string
  created_at: Date
}
