import { Project, NewProject } from '../../models/projects'
import db from '../connection'

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
  return db('projects').select('*').orderBy('created_at', 'desc')
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
  throw new Error('Not implemented — see Feature 5 user story.')
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
  throw new Error('Not implemented — deferred to post-MVP edit feature.')
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
  throw new Error('Not implemented — deferred to post-MVP delete feature.')
}
