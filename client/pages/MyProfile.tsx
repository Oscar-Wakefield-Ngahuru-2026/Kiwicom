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

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  // The signed-in user's GitHub username — comes through Supabase from the
  // GitHub sign-in metadata

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

  // Form state — populated from the loaded profile via the effect below
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

  // When the profile loads (or changes), copy its values into the form state
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
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

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
          Something went wrong loading your profile.
        </p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">My Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="grid gap-8 md:grid-cols-[300px_1fr]"
      >
        {/* Sidebar — avatar + read-only username + editable role/location/github */}
        <aside className="flex flex-col gap-4">
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
            <p className="text-2xl font-bold">{profile.githubUsername}</p>
            <p className="text-sm text-slate-500">From GitHub — not editable</p>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="role"
              className="text-sm font-medium text-slate-700"
            >
              Role
            </label>
            <input
              id="role"
              name="role"
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Frontend developer"
              className="rounded border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="location"
              className="text-sm font-medium text-slate-700"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Aotearoa"
              className="rounded border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="githubLink"
              className="text-sm font-medium text-slate-700"
            >
              GitHub link
            </label>
            <input
              id="githubLink"
              name="githubLink"
              type="url"
              value={form.githubLink}
              onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
              placeholder={`https://github.com/${profile.githubUsername}`}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            />
          </div>
        </aside>

        {/* Main column — bio, hobbies, social links, projects (stubbed), save */}
        <div className="flex flex-col gap-8">
          <section>
            <label htmlFor="bio" className="mb-2 block text-xl font-bold">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              placeholder="Tell other developers about yourself"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            />
          </section>

          <section>
            <label htmlFor="hobbies" className="mb-2 block text-xl font-bold">
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
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate each hobby with a comma.
            </p>
          </section>

          <section aria-labelledby="social-links-heading">
            <h2 id="social-links-heading" className="mb-2 text-xl font-bold">
              Social links
            </h2>

            {socialLinks.length === 0 && (
              <p className="mb-2 text-sm text-slate-500">
                No social links yet.
              </p>
            )}

            <ul className="flex flex-col gap-2">
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
                    className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  />
                  <input
                    type="url"
                    aria-label={`Social link ${index + 1} URL`}
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(index, 'url', e.target.value)
                    }
                    placeholder="https://..."
                    className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={addSocialLink}
              className="mt-3 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              Add social link
            </button>
          </section>

          <section aria-labelledby="bookmarked-heading">
            <h2 id="bookmarked-heading" className="text-xl font-bold">
              Bookmarked projects
            </h2>
            {!bookmarkedProjects || bookmarkedProjects.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No bookmarks yet — click the bookmark icon on any project to
                save it.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {bookmarkedProjects.map((project) => (
                  <li
                    key={project.id}
                    className="rounded border border-slate-200 p-3"
                  >
                    <p className="text-sm font-semibold">
                      <Link
                        to={`/developers/${project.fullName.split('/')[0]}`}
                        className="text-blue-700 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                      >
                        {project.fullName.split('/')[0]}
                      </Link>
                      <span className="text-slate-700">/</span>
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-blue-700 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                      >
                        {project.fullName.split('/')[1]}
                      </Link>
                    </p>
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

          <section aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="text-xl font-bold">
              Submitted projects
            </h2>
            {!submittedProjects || submittedProjects.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No submitted projects yet — add one via the Add Project page.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {submittedProjects.map((project) => (
                  <li
                    key={project.id}
                    className="rounded border border-slate-200 p-3"
                  >
                    <p className="text-sm font-semibold">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-blue-700 hover:underline"
                      >
                        {project.fullName.split('/')[1]}
                      </Link>
                    </p>
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

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'Saving…' : 'Save changes'}
            </button>
            {saveStatus === 'saved' && (
              <p className="text-sm text-green-600" role="status">
                Saved.
              </p>
            )}
            {saveStatus === 'error' && (
              <p className="text-sm text-red-600" role="alert">
                Could not save. Try again.
              </p>
            )}
          </div>
        </div>
      </form>
    </main>
  )
}
