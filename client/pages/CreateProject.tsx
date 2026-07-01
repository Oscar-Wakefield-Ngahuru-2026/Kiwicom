import { ProjectData } from '../../models/projects'
import { PREDEFINED_TOPICS } from '../../models/topics'
import { useAddProject } from '../hooks/use-add-project'
import { useState, useRef } from 'react'
import { useAuth } from '../hooks/use-auth'
import { getGithubRepos, RepoResult } from '../apiClient'

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

const initialState: Partial<ProjectData> = {
  fullName: '',
  description: '',
  htmlUrl: '',
  topics: [],
}

export default function CreateProject() {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState<{ fullName?: string; htmlUrl?: string }>(
    {},
  )
  const mutation = useAddProject()
  const topicsList = PREDEFINED_TOPICS

  const { token } = useAuth()
  const [results, setResults] = useState<RepoResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        e.target instanceof HTMLInputElement
          ? e.target.type === 'checkbox'
            ? e.target.checked
            : e.target.type === 'number'
              ? Number(value)
              : value
          : value,
    }))

    if (name === 'fullName' && token) {
      // Upon each keystroke:
      //__ Cancel previous timer
      //__ Start a new 300ms timer and store its ID
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        if (value.length > 1) {
          const repos = await getGithubRepos(token, value)
          setResults(repos)
          setShowDropdown(repos.length > 0)
        } else {
          setResults([])
          setShowDropdown(false)
        }
      }, 300)
    }
  }

  function handleSelect(repo: RepoResult) {
    setForm((prev) => ({
      ...prev,
      fullName: repo.fullName,
      description: repo.description,
      htmlUrl: repo.htmlUrl,
      homepage: repo.homepage,
      topics: repo.topics,
      primaryLanguage: repo.primaryLanguage,
      stars: repo.stars,
      openIssuesCount: repo.openIssuesCount,
      isOpenSource: repo.isOpenSource,
      license: repo.license,
    }))
    setShowDropdown(false)
  }

  function handleTopic(topic: string) {
    setForm((prev) => {
      if (prev.topics?.includes(topic)) {
        return {
          ...prev,
          topics: prev.topics.filter(
            (selectedTopic) => selectedTopic !== topic,
          ),
        }
      } else {
        const currentTopics = prev.topics ?? []
        return { ...prev, topics: [...currentTopics, topic] }
      }
    })
  }

  function validateForm() {
    const newErrors: { fullName?: string; htmlUrl?: string } = {}

    const parts = form.fullName?.split('/')
    const hasOwner = parts && parts[0] && parts[0].length > 0
    const hasRepo = parts && parts[1] && parts[1].length > 0
    const isValidFormat = parts?.length === 2 && hasOwner && hasRepo

    if (!isValidFormat) {
      newErrors.fullName = 'Project name must be in the format owner/repo'
    }

    if (!form.htmlUrl?.startsWith('https://github.com/')) {
      newErrors.htmlUrl = 'Please provide a valid GitHub repository link'
    }

    setErrors(newErrors)
    const hasNoErrors = Object.keys(newErrors).length === 0
    return hasNoErrors
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const isValid = validateForm()
    if (!isValid) return
    mutation.mutate(form as ProjectData, {
      onSuccess: () => setForm(initialState),
    })
  }

  return (
    <main
      className="min-h-screen pt-24 pb-16"
      style={{ backgroundColor: MIDNIGHT, fontFamily: FONT_BODY }}
    >
      <div className="mx-auto max-w-2xl px-6">
        <p
          className="mb-2 text-xs uppercase tracking-[0.25em]"
          style={{ fontFamily: FONT_MONO, color: LOTUS }}
        >
          Contribute · New entry
        </p>
        <h1 className="mb-8 text-3xl font-medium" style={{ color: MOONLIGHT }}>
          Add a project
          <span style={{ color: MAGNOLIA }}>.</span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-md p-6 md:p-8"
          style={cardStyle}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className={labelClass} style={labelStyle}>
              Project name
            </label>
            <div className="relative">
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder="owner/repo"
                className={`w-full ${inputClass}`}
                style={inputStyle}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs" style={{ color: MAGNOLIA }}>
                  {errors.fullName}
                </p>
              )}
              {showDropdown && (
                <div
                  className="absolute z-10 mt-1 w-full overflow-hidden rounded-md"
                  style={{
                    backgroundColor: INPUT_BG,
                    border: `1px solid ${TILE_BORDER}`,
                    boxShadow: '0 20px 40px -20px rgba(0,0,0,0.6)',
                  }}
                >
                  {results.map((repo) => (
                    <button
                      key={repo.fullName}
                      type="button"
                      onClick={() => handleSelect(repo)}
                      className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                      style={{ color: MOONLIGHT, outlineColor: LANTERN }}
                    >
                      <span className="font-medium">{repo.fullName}</span>
                      {repo.description && (
                        <span
                          className="ml-2 truncate text-xs"
                          style={{ color: MIST }}
                        >
                          {repo.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className={labelClass}
              style={labelStyle}
            >
              Project description
            </label>
            <textarea
              name="description"
              id="description"
              value={form.description ?? ''}
              onChange={handleChange}
              rows={4}
              placeholder="What does this project do?"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="htmlUrl" className={labelClass} style={labelStyle}>
              GitHub link
            </label>
            <input
              id="htmlUrl"
              name="htmlUrl"
              value={form.htmlUrl}
              onChange={handleChange}
              required
              placeholder="https://github.com/owner/repo"
              className={inputClass}
              style={inputStyle}
            />
            {errors.htmlUrl && (
              <p className="mt-1 text-xs" style={{ color: MAGNOLIA }}>
                {errors.htmlUrl}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className={labelClass} style={labelStyle}>
              Topics
            </p>
            <div className="flex flex-wrap gap-2">
              {topicsList.map((topic) => {
                const isOn = form.topics?.includes(topic)
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopic(topic)}
                    aria-pressed={isOn}
                    className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.1em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      fontFamily: FONT_MONO,
                      backgroundColor: isOn ? MAGNOLIA : INPUT_BG,
                      border: `1px solid ${isOn ? MAGNOLIA : TILE_BORDER}`,
                      color: isOn ? MIDNIGHT : MIST,
                      outlineColor: LANTERN,
                    }}
                  >
                    {topic}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="self-start rounded-md px-6 py-2.5 text-xs uppercase tracking-[0.2em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
            style={{
              fontFamily: FONT_MONO,
              backgroundColor: INPUT_BG,
              border: `1px solid ${LANTERN}`,
              color: LANTERN,
              outlineColor: LANTERN,
            }}
          >
            {mutation.isPending ? 'Adding…' : 'Add project'}
          </button>
          {mutation.isError && (
            <p className="text-sm" style={{ color: MAGNOLIA }} role="alert">
              Something went wrong. Try again.
            </p>
          )}
          {mutation.isSuccess && (
            <div
              className="rounded-md px-4 py-3 text-center"
              role="status"
              style={{
                backgroundColor: INPUT_BG,
                border: `1px solid ${TILE_BORDER}`,
                borderLeft: `3px solid ${LOTUS}`,
              }}
            >
              <p
                className="text-sm uppercase tracking-[0.15em]"
                style={{ fontFamily: FONT_MONO, color: LOTUS }}
              >
                Project added — welcome to the catalogue.
              </p>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
