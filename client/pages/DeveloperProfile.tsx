// Developer profile page — public, read-only view of another developer's profile.
// No login is required. Profile data comes from a stub today; will switch to a real
// API call when the profiles endpoint and schema columns exist.

import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getProfileByUsername, getSubmittedProjects } from '../apiClient'

const MIDNIGHT = '#0E1426'
const DEEP_SKY = '#1E2A4C'
const TILE_BORDER = '#2E3B5F'
const INPUT_BG = '#131C32'
const MOONLIGHT = '#F3EAD7'
const MIST = '#B3BCD0'
const MAGNOLIA = '#E8B4C4'
const LANTERN = '#E6B870'
const LOTUS = '#6FB3B8'
const FONT_BODY = 'Lexend, system-ui, sans-serif'
const FONT_MONO = 'JetBrains Mono, ui-monospace, monospace'

const pageWrap = 'min-h-screen pt-24 pb-16'
const pageWrapStyle = { backgroundColor: MIDNIGHT, fontFamily: FONT_BODY }
const cardStyle = {
  backgroundColor: DEEP_SKY,
  border: `1px solid ${TILE_BORDER}`,
  borderLeft: `3px solid ${MAGNOLIA}`,
}

export default function DeveloperProfile() {
  const { username } = useParams<{ username: string }>()

  const {
    data: profile,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfileByUsername(username ?? ''),
    enabled: !!username,
    // Don't retry a 404 — the profile simply doesn't exist.
    retry: (failureCount, err) => {
      const status = (err as { status?: number })?.status
      if (status === 404) return false
      return failureCount < 2
    },
  })

  const isNotFound = (error as { status?: number } | undefined)?.status === 404

  const { data: submittedProjects } = useQuery({
    queryKey: ['submittedProjects', profile?.id],
    queryFn: () => getSubmittedProjects(profile!.id),
    enabled: !!profile?.id,
  })

  if (isPending) {
    return (
      <div className={pageWrap} style={pageWrapStyle}>
        <div className="mx-auto max-w-5xl px-4">
          <p style={{ color: MIST }}>Loading profile…</p>
        </div>
      </div>
    )
  }

  if (isNotFound) {
    return (
      <main className={pageWrap} style={pageWrapStyle}>
        <div className="mx-auto max-w-2xl px-6">
          <p
            className="mb-2 text-xs uppercase tracking-[0.25em]"
            style={{ fontFamily: FONT_MONO, color: LOTUS }}
          >
            Developer · Not on Kiwicom yet
          </p>
          <div className="mt-6 rounded-md p-8" style={cardStyle}>
            <h1
              className="mb-3 text-2xl font-medium"
              style={{ color: MOONLIGHT }}
            >
              {username}
              <span style={{ color: MAGNOLIA }}>.</span>
            </h1>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: MIST }}>
              This developer hasn&apos;t set up a Kiwicom profile yet. You can
              still find them on GitHub — their submitted projects are listed
              below.
            </p>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs uppercase tracking-[0.15em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ fontFamily: FONT_MONO, color: LANTERN, outlineColor: LANTERN }}
            >
              View on GitHub →
            </a>
          </div>

          {submittedProjects && submittedProjects.length > 0 && (
            <section
              aria-label="Submitted projects"
              className="mt-8 rounded-md p-6"
              style={cardStyle}
            >
              <p
                className="mb-2 text-xs uppercase tracking-[0.2em]"
                style={{ fontFamily: FONT_MONO, color: LOTUS }}
              >
                Submitted · Projects
              </p>
              <h2
                className="text-2xl font-medium"
                style={{ color: MOONLIGHT }}
              >
                Their catalogue
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {submittedProjects.map((project) => (
                  <li
                    key={project.id}
                    className="rounded-md p-4"
                    style={{
                      backgroundColor: INPUT_BG,
                      border: `1px solid ${TILE_BORDER}`,
                      borderLeft: `2px solid ${MAGNOLIA}`,
                    }}
                  >
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm font-medium hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ color: MOONLIGHT, outlineColor: LANTERN }}
                    >
                      {project.fullName.split("/")[1]}
                    </Link>
                    {project.description && (
                      <p
                        className="mt-1 text-xs leading-relaxed"
                        style={{ color: MIST }}
                      >
                        {project.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    )
  }

  if (isError || !profile) {
    return (
      <div className={pageWrap} style={pageWrapStyle}>
        <div className="mx-auto max-w-5xl px-4">
          <p style={{ color: MAGNOLIA }}>
            Something went wrong loading this profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className={pageWrap} style={pageWrapStyle}>
      <div className="mx-auto max-w-5xl px-6">
        <p
          className="mb-2 text-xs uppercase tracking-[0.25em]"
          style={{ fontFamily: FONT_MONO, color: LOTUS }}
        >
          Developer · Profile
        </p>

        <div className="mt-6 grid gap-8 md:grid-cols-[300px_1fr]">
          <aside
            aria-labelledby="profile-heading"
            className="flex flex-col gap-4 rounded-md p-6"
            style={cardStyle}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.githubUsername}'s avatar`}
                className="h-32 w-32 rounded-full object-cover"
                style={{ border: `1px solid ${TILE_BORDER}` }}
              />
            ) : (
              <div
                aria-hidden="true"
                className="h-32 w-32 rounded-full"
                style={{ backgroundColor: INPUT_BG, border: `1px solid ${TILE_BORDER}` }}
              />
            )}

            <div>
              <h1
                id="profile-heading"
                className="text-2xl font-medium"
                style={{ color: MOONLIGHT }}
              >
                {profile.githubUsername}
                <span style={{ color: MAGNOLIA }}>.</span>
              </h1>
              {profile.role && (
                <p
                  className="mt-1 text-xs uppercase tracking-[0.15em]"
                  style={{ fontFamily: FONT_MONO, color: LOTUS }}
                >
                  {profile.role}
                </p>
              )}
              {profile.location && (
                <p className="mt-1 text-sm" style={{ color: MIST }}>
                  {profile.location}
                </p>
              )}
            </div>

            {profile.bio && (
              <section aria-label="About">
                <p className="text-sm leading-relaxed" style={{ color: MIST }}>
                  {profile.bio}
                </p>
              </section>
            )}

            <a
              href={profile.githubLink ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.15em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ fontFamily: FONT_MONO, color: LANTERN, outlineColor: LANTERN }}
            >
              GitHub profile →
            </a>

            {profile.socialLinks.length > 0 && (
              <section aria-labelledby="social-heading">
                <h2
                  id="social-heading"
                  className="mb-2 text-xs uppercase tracking-[0.2em]"
                  style={{ fontFamily: FONT_MONO, color: LOTUS }}
                >
                  Social links
                </h2>
                <ul className="flex flex-col gap-1">
                  {profile.socialLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ color: LANTERN, outlineColor: LANTERN }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {profile.hobbies.length > 0 && (
              <section aria-labelledby="hobbies-heading">
                <h2
                  id="hobbies-heading"
                  className="mb-2 text-xs uppercase tracking-[0.2em]"
                  style={{ fontFamily: FONT_MONO, color: LOTUS }}
                >
                  Hobbies
                </h2>
                <p
                  className="text-[0.7rem] uppercase tracking-[0.15em]"
                  style={{ fontFamily: FONT_MONO, color: MIST }}
                >
                  {profile.hobbies.join(' · ')}
                </p>
              </section>
            )}
          </aside>

          <div className="flex flex-col gap-8">
            <section
              aria-labelledby="projects-heading"
              className="rounded-md p-6"
              style={cardStyle}
            >
              <p
                className="mb-2 text-xs uppercase tracking-[0.2em]"
                style={{ fontFamily: FONT_MONO, color: LOTUS }}
              >
                Submitted · Projects
              </p>
              <h2
                id="projects-heading"
                className="text-2xl font-medium"
                style={{ color: MOONLIGHT }}
              >
                Their catalogue
              </h2>
              {!submittedProjects || submittedProjects.length === 0 ? (
                <p className="mt-4 text-sm" style={{ color: MIST }}>
                  {profile.githubUsername} hasn&apos;t added any projects yet.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {submittedProjects.map((project) => (
                    <li
                      key={project.id}
                      className="rounded-md p-4"
                      style={{
                        backgroundColor: INPUT_BG,
                        border: `1px solid ${TILE_BORDER}`,
                        borderLeft: `2px solid ${MAGNOLIA}`,
                      }}
                    >
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-medium hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ color: MOONLIGHT, outlineColor: LANTERN }}
                      >
                        {project.fullName.split("/")[1]}
                      </Link>
                      {project.description && (
                        <p
                          className="mt-1 text-xs leading-relaxed"
                          style={{ color: MIST }}
                        >
                          {project.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              aria-labelledby="message-heading"
              className="rounded-md p-6"
              style={cardStyle}
            >
              <p
                className="mb-2 text-xs uppercase tracking-[0.2em]"
                style={{ fontFamily: FONT_MONO, color: LOTUS }}
              >
                Reach out
              </p>
              <h2
                id="message-heading"
                className="text-2xl font-medium"
                style={{ color: MOONLIGHT }}
              >
                Send a message
              </h2>
              {/* TODO(messaging): This is visually stubbed per ticket allowance; and needs to be wired to
                  a real messaging system in a later sprint */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Message form is stubbed — wiring pending.')
                }}
                className="mt-4 flex flex-col gap-3"
              >
                <label htmlFor="message" className="sr-only">
                  Your message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Write a message…"
                  className="rounded-md px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    backgroundColor: INPUT_BG,
                    border: `1px solid ${TILE_BORDER}`,
                    color: MOONLIGHT,
                    outlineColor: LANTERN,
                  }}
                />
                <button
                  type="submit"
                  className="self-start rounded-md px-4 py-2 text-xs uppercase tracking-[0.15em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    fontFamily: FONT_MONO,
                    backgroundColor: INPUT_BG,
                    border: `1px solid ${TILE_BORDER}`,
                    color: LANTERN,
                    outlineColor: LANTERN,
                  }}
                >
                  Send →
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
