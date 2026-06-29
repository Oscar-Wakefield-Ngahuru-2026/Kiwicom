import db from '../connection'
import type { ProfileRecord } from '../../../models/profiles'

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
    .ignore() // `.onConflict().ignore()` is Knex; `.upsert()` is Supabase equivalent
}

// A LIST of select aliases, snake_case DB column to camelCase JS key. Same Pattern as Henry's projectColumns. (as a note it needs to be in this file to support the function that uses it.)
// getProfileByUsername gets the profile by github_username. If nothing found, returns null. Second query gets all social links for that profile. Returns them merged together.
//hobbies: profile.hobbies safety fallback in case old rows have null for hobbies it will default an empty array.
//socialLinks It will come from the join via the second query;will come out { label, url }[] matching the model.

const profileColumns = [
  'id',
  'github_username as githubUsername',
  'avatar_url as avatarUrl',
  'bio',
  'role',
  'location',
  'github_link as githubLink',
  'hobbies',
  'created_at as createdAt',
]

export async function getProfileByUsername(
  username: string,
): Promise<ProfileRecord | null> {
  const profile = await db('profiles')
    .select(profileColumns)
    .where('github_username', username)
    .first()

  if (!profile) return null

  const socialLinks = await db('social_links')
    .where('profile_id', profile.id)
    .select('label', 'url')

  return {
    ...profile,
    hobbies: profile.hobbies ?? [],
    socialLinks,
  }
}
