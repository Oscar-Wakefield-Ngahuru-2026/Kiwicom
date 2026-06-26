import octokit from './octokit'
import { normalizeGitHubRepo } from './normalizer'

const README_MAX_BYTES = 50_000

export async function fetchAndNormalize(owner: string, repo: string) {
  const repoResponse = await octokit.rest.repos.get({ owner, repo })
  const normalized = normalizeGitHubRepo(repoResponse.data)

  try {
    const readmeResponse = await octokit.rest.repos.getReadme({ owner, repo })
    const decoded = Buffer.from(readmeResponse.data.content, 'base64').toString(
      'utf-8',
    )
    normalized.readme =
      decoded.length > README_MAX_BYTES
        ? decoded.slice(0, README_MAX_BYTES)
        : decoded
  } catch {
    // README missing (404) or other transient error — leave readme as null.
    // Refresh job will retry next time.
  }

  return normalized
}
