import 'dotenv/config'
import { Octokit } from 'octokit'

if (!process.env.GITHUB_TOKEN) {
  throw new Error (
    'GITHUB_TOKEN is not set. Generate a Personal Access Token at https://github.com/settings/tokens and add it to .env.',
  )
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export default octokit