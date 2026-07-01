import { ProjectData, Project } from '../../../models/projects'

import db from '../connection'

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

/**
 * Return all projects in the database, newest first.
 *
 * Pseudo:
 *   SELECT * FROM projects
 *   ORDER BY created_at DESC
 *
 * Used by: Feature 1 (Projects/Home page).
 * Later sprints will likely add:
 *   - Filtering (WHERE primary_language = ?, WHERE labels LIKE ...)
 *   - Pagination (LIMIT / OFFSET, or cursor-based)
 *   - Search by name (WHERE name ILIKE ?)
 */
export async function getProjects(): Promise<Project[]> {
  return db('projects').select(projectColumns).orderBy('created_at', 'desc')
}

/**
 * Return one project by its id, or null if not found.
 *
 * Pseudo:
 *   SELECT * FROM projects WHERE id = ? LIMIT 1
 *   if no row: return null
 *   else: return the row
 *
 * Used by: Feature 5 (Single Project Page).
 * Notes:
 *   - The caller (Express route) should translate null into a 404,
 *     not this function. DB functions stay HTTP-agnostic.
 */

// Go about this with Ivonne and explain
export async function getProjectById(id: number): Promise<Project | null> {
  return db('projects').select(projectColumns).where({ id }).first()
}

/**
 * Insert a new project. Returns the full row including DB-generated id + created_at.
 *
 * Pseudo:
 *   INSERT INTO projects (name, description, github_url, owner_name)
 *   VALUES (?, ?, ?, ?)
 *   RETURNING *
 *
 * Used by: Feature 9 (Create Project page).
 * Notes:
 *   - Input shape is NewProject (no id, no created_at — DB fills those).
 *   - Validate the github_url is a real GitHub URL in the route layer,
 *     not here. DB functions trust their inputs.
 */
export async function addProject(data: Partial<ProjectData>): Promise<Project> {
  const [project] = await db('projects')
    .insert({
      full_name: data.fullName,
      description: data.description,
      html_url: data.htmlUrl,
      homepage: data.homepage,
      primary_language: data.primaryLanguage,
      topics: data.topics,
      stars: data.stars,
      open_issues_count: data.openIssuesCount,
      is_open_source: data.isOpenSource,
      license: data.license,
    })
    .returning(projectColumns)
  return project
}

/**
 * Update an existing project. Returns the updated row, or null if not found.
 *
 * Pseudo:
 *   UPDATE projects SET <only the fields the caller provided> WHERE id = ?
 *   RETURNING *
 *   if no row affected: return null
 *
 * Used by: not in MVP. Deferred to post-showcase edit feature.
 * Notes:
 *   - Partial<NewProject> means callers can update any subset of fields.
 *   - Knex idiom: db('projects').where({id}).update(data).returning('*')
 */
export async function updateProject(
  id: number,
  data: Partial<ProjectData>,
): Promise<Project | null> {
  const [project] = await db('projects')
    .where({ id })
    .update({
      full_name: data.fullName,
      description: data.description,
      html_url: data.htmlUrl,
      homepage: data.homepage,
      primary_language: data.primaryLanguage,
      topics: data.topics,
      stars: data.stars,
      open_issues_count: data.openIssuesCount,
      is_open_source: data.isOpenSource,
      license: data.license,
    })
    .returning(projectColumns)
  return project ?? null
}

/**
 * Delete a project. Returns the number of rows deleted (0 or 1).
 *
 * Pseudo:
 *   DELETE FROM projects WHERE id = ?
 *   return count of rows affected
 *
 * Used by: not in MVP. Deferred to post-showcase delete feature.
 * Notes:
 *   - Once bookmarks/issues tables exist with FKs to projects.id, decide
 *     cascade behavior in those migrations (ON DELETE CASCADE vs RESTRICT).
 *   - For now this is a soft skeleton — the FK constraints don't exist yet.
 */
export async function deleteProject(id: number): Promise<number> {
  const result = await db('projects').where({ id }).del()
  return result
}
