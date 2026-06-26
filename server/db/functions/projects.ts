import { Project, NewProject } from '../../../models/projects'
import db from '../connection'

// Converts one snake_case DB row to a camelCase Project.
// Temporary read-boundary — removed when Henry's projectColumns work auto-translates column names.
function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as number,
    fullName: row.full_name as string,
    description: row.description as string | null,
    htmlUrl: row.html_url as string,
    homepage: row.homepage as string | null,
    primaryLanguage: row.primary_language as string | null,
    topics: row.topics as string[] | null,
    stars: row.stars as number,
    openIssuesCount: row.open_issues_count as number,
    isOpenSource: Boolean(row.is_open_source),
    license: row.license as string | null,
    readme: row.readme as string | null,
    aiSummary: row.ai_summary as string | null,
    aiSummaryAt: row.ai_summary_at as Date | null,
    lastSyncedAt: row.last_synced_at as Date | null,
    createdAt: row.created_at as Date,
  }
}

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
  const rows = await db('projects').select('*').orderBy('created_at', 'desc')
  return rows.map(rowToProject)
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
export async function getProjectById(id: number): Promise<Project | null> {
  const row = await db('projects').where({ id }).first()
  return row ? rowToProject(row) : null
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addProject(data: NewProject): Promise<Project> {
  throw new Error('Not implemented — see Feature 9 user story.')
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
  data: Partial<NewProject>,
): Promise<Project | null> {
  const [updated] = await db('projects')
    .where({ id })
    .update(data)
    .returning('*')
  return updated ? rowToProject(updated) : null
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteProject(id: number): Promise<number> {
  throw new Error('Not implemented — deferred to post-MVP delete feature.')
}
