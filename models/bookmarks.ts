export interface BookmarkData {
  userId: string
  projectId: number
}

export interface Bookmark extends BookmarkData {
  createdAt: Date
}
