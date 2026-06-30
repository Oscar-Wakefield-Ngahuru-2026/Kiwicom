// Developer profile page — public, read-only view of another developer's profile.
// No login is required. Profile data comes from a stub today; will switch to a real
// API call when the profiles endpoint and schema columns exist.

import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getProfileByUsername, getProjects } from '../apiClient'

export default function DeveloperProfile() {
  const { username } = useParams<{ username: string }>()

  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfileByUsername(username ?? ''),
    enabled: !!username,
  })

  const { data: allProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  // Username-match convention: a project belongs to this developer if the
  // owner-half of its fullName matches the URL username.
  const submittedProjects = allProjects?.filter(
    (p) => p.ownerName === username,
  )

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">Loading profile…</p>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-red-600">
          Something went wrong loading this profile.
        </p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Sidebar — profile info */}
        <aside
          aria-labelledby="profile-heading"
          className="flex flex-col gap-4"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`${profile.githubUsername}'s avatar`}
              className="h-32 w-32 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-32 w-32 rounded-full border border-slate-200 bg-slate-100"
            />
          )}

          <div>
            <h1 id="profile-heading" className="text-2xl font-bold">
              {profile.githubUsername}
            </h1>
            {profile.role && (
              <p className="text-sm text-slate-600">{profile.role}</p>
            )}
            {profile.location && (
              <p className="text-sm text-slate-500">{profile.location}</p>
            )}
          </div>

          {profile.bio && (
            <section aria-label="About">
              <p className="text-sm text-slate-700">{profile.bio}</p>
            </section>
          )}

          <a
            href={profile.githubLink ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            GitHub profile
          </a>

          {profile.socialLinks.length > 0 && (
            <section aria-labelledby="social-heading">
              <h2
                id="social-heading"
                className="text-sm font-medium text-slate-700"
              >
                Social links
              </h2>
              <ul className="mt-2 flex flex-col gap-1">
                {profile.socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
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
                className="text-sm font-medium text-slate-700"
              >
                Hobbies
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {profile.hobbies.map((hobby) => (
                  <li
                    key={hobby}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                  >
                    {hobby}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Main column — projects + message form */}
        <div className="flex flex-col gap-8">
          <section aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="text-xl font-bold">
              Submitted projects
            </h2>
            {!submittedProjects || submittedProjects.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                {profile.githubUsername} hasn&apos;t added any projects yet.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {submittedProjects.map((project) => (
                  <li
                    key={project.id}
                    className="rounded border border-slate-200 p-3"
                  >
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm font-semibold text-blue-700 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="mt-1 text-xs text-slate-600">
                        {project.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="message-heading">
            <h2 id="message-heading" className="text-xl font-bold">
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
                className="rounded border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              />
              <button
                type="submit"
                className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                Send
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
