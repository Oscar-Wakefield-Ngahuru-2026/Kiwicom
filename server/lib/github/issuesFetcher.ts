import octokit from './octokit'


export interface IssueData {
  id: number
  title: string
  htmlUrl: string
  labels: string[]
  state: string
}

export async function fetchProjectIssues(
  owner: string,
  repo: string,
): Promise<IssueData[]> {
  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    per_page: 100,
  })

  return data 
    .filter((item) => !item.pull_request)
    .map((item) => ({
      id: item.id,
      title: item.title,
      htmlUrl: item.html_url,
      labels: (item.labels ?? []).map((label) => 
        typeof label === 'string' ? label : (label.name ?? ''),
      ),
      state: item.state,
    }))
}
