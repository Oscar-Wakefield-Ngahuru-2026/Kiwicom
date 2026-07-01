// My Profile page — the signed-in user's view of their own profile.
// Lets them edit bio, role, location, github link, hobbies, and social links,
// and saves the changes back via the profile API endpoints.

import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/use-auth'

import {
  getProfileByUsername,
  updateProfile,
  updateSocialLinks,
  getBookmarkedProjects,
  getSubmittedProjects,
} from '../apiClient'

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
const inputStyle = {
  backgroundColor: INPUT_BG,
  border: `1px solid ${TILE_BORDER}`,
  color: MOONLIGHT,
  outlineColor: LANTERN,
}
const inputClass =
  'rounded-md px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
const labelClass = 'text-xs uppercase tracking-[0.15em]'
const labelStyle = { fontFamily: FONT_MONO, color: LOTUS }
const sectionMeta = 'mb-2 text-xs uppercase tracking-[0.2em]'
const sectionH2 = 'text-2xl font-medium'

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const username = user?.user_metadata?.user_name as string | undefined
  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfileByUsername(username!),
    enabled: !!username,
  })

  const { data: bookmarkedProjects } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => getBookmarkedProjects(user!.id),
    enabled: !!user,
  })

  const { data: submittedProjects } = useQuery({
    queryKey: ['submittedProjects', user?.id],
    queryFn: () => getSubmittedProjects(user!.id),
    enabled: !!user,
  })

  const [form, setForm] = useState({
    bio: '',
    role: '',
    location: '',
    githubLink: '',
    hobbiesText: '',
  })
  const [socialLinks, setSocialLinks] = useState<
    { label: string; url: string }[]
  >([])
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        bio: profile.bio ?? '',
        role: profile.role ?? '',
        location: profile.location ?? '',
        githubLink: profile.githubLink ?? '',
        hobbiesText: profile.hobbies.join(', '),
      })
      setSocialLinks(profile.socialLinks)
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!profile) return
      await updateProfile(profile.id, {
        bio: form.bio || null,
        role: form.role || null,
        location: form.location || null,
        githubLink: form.githubLink || null,
        hobbies: form.hobbiesText
          .split(',')
          .map((h) => h.trim())
          .filter(Boolean),
      })
      await updateSocialLinks(profile.id, socialLinks)
    },
    onSuccess: () => {
      setSaveStatus('saved')
      queryClient.invalidateQueries({ queryKey: ['profile', username] })
      setTimeout(() => setSaveStatus('idle'), 2000)
    },
    onError: () => {
      setSaveStatus('error')
    },
  })

  function updateSocialLink(
    index: number,
    field: 'label' | 'url',
    value: string,
  ) {
    const next = [...socialLinks]
    next[index] = { ...next[index], [field]: value }
    setSocialLinks(next)
  }

  function removeSocialLink(index: number) {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  function addSocialLink() {
    setSocialLinks([...socialLinks, { label: '', url: '' }])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveStatus('saving')
    mutation.mutate()
  }

  if (authLoading) {
    return (
      <div className={pageWrap} style={pageWrapStyle}>
        <div className="mx-auto max-w-5xl px-4">
          <p style={{ color: MIST }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (isPending) {
    return (
      <div className={pageWrap} style={pageWrapStyle}>
        <div className="mx-auto max-w-5xl px-4">
          <p style={{ color: MIST }}>Loading profile…</p>
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className={pageWrap} style={pageWrapStyle}>
        <div className="mx-auto max-w-5xl px-4">
          <p style={{ color: MAGNOLIA }}>
            Something went wrong loading your profile.
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
          My Profile · Edit
        </p>
        <h1 className="mb-8 text-3xl font-medium" style={{ color: MOONLIGHT }}>
          Your details
          <span style={{ color: MAGNOLIA }}>.</span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 md:grid-cols-[300px_1fr]"
        >
          <aside
            className="flex flex-col gap-5 rounded-md p-6"
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
              <p className="text-2xl font-medium" style={{ color: MOONLIGHT }}>
                {profile.githubUsername}
                <span style={{ color: MAGNOLIA }}>.</span>
              </p>
              <p
                className="mt-1 text-[0.65rem] uppercase tracking-[0.15em]"
                style={{ fontFamily: FONT_MONO, color: MIST }}
              >
                From GitHub — not editable
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className={labelClass} style={labelStyle}>
                Role
              </label>
              <input
                id="role"
                name="role"
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Frontend developer"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className={labelClass} style={labelStyle}>
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Aotearoa"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="githubLink" className={labelClass} style={labelStyle}>
                GitHub link
              </label>
              <input
                id="githubLink"
                name="githubLink"
                type="url"
                value={form.githubLink}
                onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                placeholder={`https://github.com/${profile.githubUsername}`}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </aside>

          <div className="flex flex-col gap-8">
            <section className="rounded-md p-6" style={cardStyle}>
              <p className={sectionMeta} style={labelStyle}>
                About you
              </p>
              <label htmlFor="bio" className={sectionH2} style={{ color: MOONLIGHT }}>
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                placeholder="Tell other developers about yourself"
                className={`mt-3 w-full ${inputClass}`}
                style={inputStyle}
              />
            </section>

            <section className="rounded-md p-6" style={cardStyle}>
              <p className={sectionMeta} style={labelStyle}>
                Interests
              </p>
              <label
                htmlFor="hobbies"
                className={sectionH2}
                style={{ color: MOONLIGHT }}
              >
                Hobbies
              </label>
              <input
                id="hobbies"
                name="hobbies"
                type="text"
                value={form.hobbiesText}
                onChange={(e) =>
                  setForm({ ...form, hobbiesText: e.target.value })
                }
                placeholder="coffee, gardening, hiking"
                className={`mt-3 w-full ${inputClass}`}
                style={inputStyle}
              />
              <p className="mt-2 text-xs" style={{ color: MIST }}>
                Separate each hobby with a comma.
              </p>
            </section>

            <section
              aria-labelledby="social-links-heading"
              className="rounded-md p-6"
              style={cardStyle}
            >
              <p className={sectionMeta} style={labelStyle}>
                Off-site
              </p>
              <h2
                id="social-links-heading"
                className={sectionH2}
                style={{ color: MOONLIGHT }}
              >
                Social links
              </h2>

              {socialLinks.length === 0 && (
                <p className="mt-3 text-sm" style={{ color: MIST }}>
                  No social links yet.
                </p>
              )}

              <ul className="mt-3 flex flex-col gap-2">
                {socialLinks.map((link, index) => (
                  <li key={index} className="flex gap-2">
                    <input
                      type="text"
                      aria-label={`Social link ${index + 1} label`}
                      value={link.label}
                      onChange={(e) =>
                        updateSocialLink(index, 'label', e.target.value)
                      }
                      placeholder="Label (e.g. Twitter)"
                      className={`flex-1 ${inputClass}`}
                      style={inputStyle}
                    />
                    <input
                      type="url"
                      aria-label={`Social link ${index + 1} URL`}
                      value={link.url}
                      onChange={(e) =>
                        updateSocialLink(index, 'url', e.target.value)
                      }
                      placeholder="https://..."
                      className={`flex-1 ${inputClass}`}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="rounded-md px-3 py-2 text-xs uppercase tracking-[0.15em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        fontFamily: FONT_MONO,
                        backgroundColor: INPUT_BG,
                        border: `1px solid ${TILE_BORDER}`,
                        color: MAGNOLIA,
                        outlineColor: LANTERN,
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={addSocialLink}
                className="mt-3 rounded-md px-3 py-2 text-xs uppercase tracking-[0.15em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  fontFamily: FONT_MONO,
                  backgroundColor: INPUT_BG,
                  border: `1px solid ${TILE_BORDER}`,
                  color: LANTERN,
                  outlineColor: LANTERN,
                }}
              >
                + Add social link
              </button>
            </section>

            <section
              aria-labelledby="bookmarked-heading"
              className="rounded-md p-6"
              style={cardStyle}
            >
              <p className={sectionMeta} style={labelStyle}>
                Saved · Bookmarks
              </p>
              <h2
                id="bookmarked-heading"
                className={sectionH2}
                style={{ color: MOONLIGHT }}
              >
                Bookmarked projects
              </h2>
              {!bookmarkedProjects || bookmarkedProjects.length === 0 ? (
                <p className="mt-4 text-sm" style={{ color: MIST }}>
                  No bookmarks yet — click the bookmark icon on any project to
                  save it.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {bookmarkedProjects.map((project) => (
                    <li
                      key={project.id}
                      className="rounded-md p-4"
                      style={{
                        backgroundColor: INPUT_BG,
                        border: `1px solid ${TILE_BORDER}`,
                        borderLeft: `2px solid ${MAGNOLIA}`,
                      }}
                    >
                      <p className="text-sm font-medium">
                        <Link
                          to={`/developers/${project.fullName.split('/')[0]}`}
                          className="hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{ color: LANTERN, outlineColor: LANTERN }}
                        >
                          {project.fullName.split('/')[0]}
                        </Link>
                        <span style={{ color: MIST }}> / </span>
                        <Link
                          to={`/projects/${project.id}`}
                          className="hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{ color: MOONLIGHT, outlineColor: LANTERN }}
                        >
                          {project.fullName.split('/')[1]}
                        </Link>
                      </p>
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
              aria-labelledby="projects-heading"
              className="rounded-md p-6"
              style={cardStyle}
            >
              <p className={sectionMeta} style={labelStyle}>
                Yours · Submitted
              </p>
              <h2
                id="projects-heading"
                className={sectionH2}
                style={{ color: MOONLIGHT }}
              >
                Submitted projects
              </h2>
              {!submittedProjects || submittedProjects.length === 0 ? (
                <p className="mt-4 text-sm" style={{ color: MIST }}>
                  You haven&apos;t added any projects yet.
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
                        {project.fullName.split('/')[1]}
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

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="rounded-md px-6 py-2.5 text-xs uppercase tracking-[0.2em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
                style={{
                  fontFamily: FONT_MONO,
                  backgroundColor: INPUT_BG,
                  border: `1px solid ${LANTERN}`,
                  color: LANTERN,
                  outlineColor: LANTERN,
                }}
              >
                {saveStatus === 'saving' ? 'Saving…' : 'Save changes'}
              </button>
              {saveStatus === 'saved' && (
                <p
                  className="text-sm"
                  role="status"
                  style={{ color: LOTUS }}
                >
                  Saved.
                </p>
              )}
              {saveStatus === 'error' && (
                <p
                  className="text-sm"
                  role="alert"
                  style={{ color: MAGNOLIA }}
                >
                  Could not save. Try again.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
