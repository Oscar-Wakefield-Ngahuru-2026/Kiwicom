// This file sets up our GitHub API client.
// We create it once here and import it everywhere else, so the rest of
// the code can just say "ask GitHub for X" without setting up a new
// connection every time. It reads GITHUB_TOKEN from the .env file.

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