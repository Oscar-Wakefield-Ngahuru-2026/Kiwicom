// Playground — hardcoded avatars for team members + generic fallbacks.
// Keys are the GitHub usernames Supabase Auth returns; values are
// public asset paths (Vite serves `client/public/*` at the URL root).

const TEAM_AVATARS: Record<string, string> = {
  'serina-mcfall': '/avatars/serina.png',
  henryn289: '/avatars/henry.png',
  Ivonnita: '/avatars/ivonne.png',
  'Oscar-Wakefield-Ngahuru-2026': '/avatars/oscar.png',
}

const GENERIC_AVATARS = [
  '/avatars/wanakatree.png',
  '/avatars/waterfall.png',
]

export function getAvatarForUser(githubUsername: string): string {
  if (TEAM_AVATARS[githubUsername]) {
    return TEAM_AVATARS[githubUsername]
  }
  // Stable pick from the generic pool based on the first character so the
  // same user always gets the same fallback image.
  const hash = githubUsername.charCodeAt(0) % GENERIC_AVATARS.length
  return GENERIC_AVATARS[hash]
}
