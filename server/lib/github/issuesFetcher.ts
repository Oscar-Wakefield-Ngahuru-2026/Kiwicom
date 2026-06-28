// This file fetches beginner-friendly issues from a GitHub repo.
// We're looking for two labels: "good first issue" and "help wanted".
// It has to make two API calls (one per label) and merge the results,
// because GitHub's labels= filter matches issues that have BOTH labels,
// not either one.

import octokit from './octokit'

export interface IssueData {
  id: number
  title: string
  htmlUrl: string
  labels: string[]
  state: string
}

const BEGINNER_LABELS = ['good first issue', 'help wanted']

export async function fetchProjectIssues(
  owner: string,
  repo: string,
): Promise<IssueData[]> {
  // Two label-filtered calls in parallel — GitHub's labels= param is AND,
  // not OR, so we can't ask for "either label" in one call.
  const responses = await Promise.all(
    BEGINNER_LABELS.map((label) =>
      octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        labels: label,
        per_page: 100,
      }),
    ),
  )

  // Merge results, dedupe by id (an issue with BOTH labels would appear twice)
  const all = responses.flatMap((r) => r.data)
  const uniqueById = Array.from(new Map(all.map((i) => [i.id, i])).values())

  return uniqueById
    .filter((item) => !item.pull_request)
    .map((item) => ({
      id: item.id,
      title: item.title,
      htmlUrl: item.html_url,
      labels: (item.labels ?? []).map((label) =>
        typeof label === 'string' ? label : (label.name ?? ' '),
      ),
      state: item.state,
    }))
}
