import { ProjectData, Project } from '../../../models/projects'
import db from '../connection'

// Knex SELECT aliases: ask Postgres for snake_case columns AS camelCase keys,
// so every read returns Project-shaped rows directly. The team's canonical
// pattern for camelCase end-to-end (Henry's projectColumns work).
const projectColumns = [
  'id',
  'full_name as fullName',
  'description',
  'html_url as htmlUrl',
  'homepage',
  'primary_language as primaryLanguage',
  'topics',
  'stars',
  'open_issues_count as openIssuesCount',
  'is_open_source as isOpenSource',
  'license',
  'readme',
  'ai_summary as aiSummary',
  'ai_summary_at as aiSummaryAt',
  'last_synced_at as lastSyncedAt',
  'created_at as createdAt',
]

// Mirror image for writes: convert a camelCase Partial<ProjectData>
// into a snake_case object Knex will pass through to Postgres.
// Only fields the caller explicitly sets get written.
function projectToRow(data: Partial<ProjectData>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (data.fullName !== undefined) row.full_name = data.fullName
  if (data.description !== undefined) row.description = data.description
  if (data.htmlUrl !== undefined) row.html_url = data.htmlUrl
  if (data.homepage !== undefined) row.homepage = data.homepage
  if (data.primaryLanguage !== undefined)
    row.primary_language = data.primaryLanguage
  if (data.topics !== undefined) row.topics = data.topics
  if (data.stars !== undefined) row.stars = data.stars
  if (data.openIssuesCount !== undefined)
    row.open_issues_count = data.openIssuesCount
  if (data.isOpenSource !== undefined) row.is_open_source = data.isOpenSource
  if (data.license !== undefined) row.license = data.license
  if (data.readme !== undefined) row.readme = data.readme
  if (data.aiSummary !== undefined) row.ai_summary = data.aiSummary
  if (data.aiSummaryAt !== undefined) row.ai_summary_at = data.aiSummaryAt
  if (data.lastSyncedAt !== undefined) row.last_synced_at = data.lastSyncedAt
  return row
}

/**
 * Return all projects in the database, newest first.
 *
 * Pseudo:
 *   SELECT <projectColumns> FROM projects
 *   ORDER BY created_at DESC
 *
 * Used by: Feature 1 (Projects/Home page).
 */
export async function getProjects(): Promise<Project[]> {
  return db('projects').select(projectColumns).orderBy('created_at', 'desc')
}

/**
 * Return one project by its id, or null if not found.
 *
 * Used by: Feature 5 (Single Project Page) and Ticket B refresh route.
 * Notes:
 *   - The caller (Express route) should translate null into a 404,
 *     not this function. DB functions stay HTTP-agnostic.
 */

// Go about this with Ivonne and explain 
export async function getProjectById(id: number): Promise<Project | null> {
  const row = await db('projects')
    .select(projectColumns)
    .where({ id })
    .first()
  return row ?? null
}

/**
 * Insert a new project. Returns the full row including DB-generated id + created_at.
 *
 * Used by: Feature 9 (Create Project page).
 */
export async function addProject(data: Partial<ProjectData>): Promise<Project> {
  const [project] = await db('projects')
    .insert(projectToRow(data))
    .returning(projectColumns)
  return project
}

/**
 * Update an existing project. Returns the updated row, or null if not found.
 *
 * Used by: Ticket B refresh route.
 */
export async function updateProject(
  id: number,
  data: Partial<ProjectData>,
): Promise<Project | null> {
  const [updated] = await db('projects')
    .where({ id })
    .update(projectToRow(data))
    .returning(projectColumns)
  return updated ?? null
}

/**
 * Delete a project. Returns the number of rows deleted (0 or 1).
 * Stub — deferred to post-MVP delete feature.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteProject(id: number): Promise<number> {
  throw new Error('Not implemented — deferred to post-MVP delete feature.')
}
