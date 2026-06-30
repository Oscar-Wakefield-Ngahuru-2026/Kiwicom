import db from '../connection'
import type {
  ProfileData as ProfileFields,
  ProfileRecord,
} from '../../../models/profiles'

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

// Mirror image for writes: convert a camelCase Partial<ProfileFields>
// into a snake_case object Knex will pass through to Postgres.
// Only the fields the caller actually sets get written.

function profileToRow(data: Partial<ProfileFields>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (data.githubUsername !== undefined)
    row.github_username = data.githubUsername
  if (data.avatarUrl !== undefined) row.avatar_url = data.avatarUrl
  if (data.bio !== undefined) row.bio = data.bio
  if (data.role !== undefined) row.role = data.role
  if (data.location !== undefined) row.location = data.location
  if (data.githubLink !== undefined) row.github_link = data.githubLink
  if (data.hobbies !== undefined) row.hobbies = data.hobbies
  return row
}

export async function updateProfile(
  id: string,
  data: Partial<ProfileFields>,
): Promise<ProfileRecord | null> {
  const [updated] = await db('profiles')
    .where({ id })
    .update(profileToRow(data))
    .returning(profileColumns)

  if (!updated) return null
  
  const socialLinks = await db('social_links')
    .where('profile_id', id)
    .select('label', 'url')

  return {
    ...updated,
    hobbies: updated.hobbies ?? [],
    socialLinks,
  }  
}

export async function replaceSocialLinks(
  profileId: string,
  links: {label: string; url: string }[],
): Promise<void> {
  await db.transaction(async (trx) => {
    await trx('social_links').where('profile_id', profileId).del()
    if (links.length === 0) return
    await trx('social_links').insert(
      links.map((link)=> ({
        profile_id: profileId,
        label: link.label,
        url: link.url
      }))
    )
  })
}
  