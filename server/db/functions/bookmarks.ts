// DB functions for the bookmarks table.
// Bookmarks link a user (profile) to a project — so each row says
// "this user has bookmarked this project."
// The functions here let us list a user's bookmarked projects (joined
// with the projects table), add a new bookmark, and remove one.

import db from '../connection'
import type { BookmarkData } from '../../../models/bookmarks'
import type { Project } from '../../../models/projects'

// Same projectColumns shape as functions/projects.ts but with the
// 'projects.' prefix because we're joining two tables and the unqualified
// column names would be ambiguous to Postgres.

const projectColumns = [
  'projects.id',
  'projects.full_name as fullName',
  'projects.description',
  'projects.html_url as htmlUrl',
  'projects.homepage',
  'projects.primary_language as primaryLanguage',
  'projects.topics',
  'projects.stars',
  'projects.open_issues_count as openIssuesCount',
  'projects.is_open_source as isOpenSource',
  'projects.license',
  'projects.readme',
  'projects.ai_summary as aiSummary',
  'projects.ai_summary_at as aiSummaryAt',
  'projects.last_synced_at as lastSyncedAt',
  'projects.created_at as createdAt',
]

export async function getBookmarkedProjects(
  userId: string,
): Promise<Project[]> {
  return db('bookmarks')
    .join('projects', 'bookmarks.project_id', 'projets.id')
    .where('bookmarks.user_id', userId)
    .select(projectColumns)
    .orderBy('bookmarks.created_at', 'desc')
}

export async function addBookmark(data: BookmarkData): Promise<void> {
  await db('bookmarks')
    .insert({
      user_id: data.userId,
      project_id: data.projectId,
    })
    .onConflict(['user_id', 'project_id'])
    .ignore()
}

export async function removeBookmark(data: BookmarkData): Promise<void> {
  await db('bookmarks')
    .where('user_id', data.userId)
    .andWhere('project_id', data.projectId)
    .del()
}
