import db from '../connection'

interface ProfileData {
  id: string
  githubUsername: string
  avatarUrl: string
}

export async function upsertProfile(data: ProfileData): Promise<void> {
  await db('profiles')
    .insert({
      id: data.id,
      github_username: data.githubUsername,
      avatar_url: data.avatarUrl,
    })
    .onConflict('id') // if a row with `id` already exists, ignore
    .ignore()
}
