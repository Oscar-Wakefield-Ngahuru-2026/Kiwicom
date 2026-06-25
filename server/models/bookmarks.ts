export interface BookmarkData {
  user_id: string
  project_id: number
}

export interface Bookmark extends BookmarkData {
  created_at: Date
}
