import db from '../connection'
import type { IssueData } from '../../lib/github/issuesFetcher'

export interface IssueRecord extends IssueData {
  projectId: number
  createdAt: Date
}

// Knex SELECT aliases: snake_case columns AS camelCase keys.
// Same pattern as projectColumns in functions/projects.ts.
const issueColumns = [
  'id',
  'project_id as projectId',
  'title',
  'html_url as htmlUrl',
  'labels',
  'state',
  'created_at as createdAt',
]

/**
 * Return all issues for a given project, in no particular order.
 *
 * Pseudo:
 *   SELECT <issueColumns> FROM issues
 *   WHERE project_id = ?
 */
export async function getIssuesForProject(
  projectId: number,
): Promise<IssueRecord[]> {
  return db('issues').select(issueColumns).where({ project_id: projectId })
}

/**
 * Wipe and re-insert all issues for a project, atomically.
 * Called by the refresh route after fetching fresh issues from GitHub.
 *
 * Pseudo:
 *   BEGIN TRANSACTION
 *   DELETE FROM issues WHERE project_id = ?
 *   INSERT INTO issues (<rows>)  -- only if issues array is non-empty
 *   COMMIT
 */
export async function replaceIssuesForProject(
  projectId: number,
  issues: IssueData[],
): Promise<void> {
  await db.transaction(async (trx) => {
    await trx('issues').where({ project_id: projectId }).del()
    if (issues.length === 0) return
    await trx('issues').insert(
      issues.map((issue) => ({
        id: issue.id,
        project_id: projectId,
        title: issue.title,
        html_url: issue.htmlUrl,
        labels: issue.labels,
        state: issue.state,
      })),
    )
  })
}
