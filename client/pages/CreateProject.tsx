import { ProjectData } from '../../models/projects'
import { useAddProject } from '../hooks/use-add-project'
import { useState, useRef } from 'react'
import { useAuth } from '../hooks/use-auth'
import { getGithubRepos, RepoResult } from '../apiClient'

const initialState: Partial<ProjectData> = {
  fullName: '',
  description: '',
  htmlUrl: '',
}

export default function CreateProject() {
  const [form, setForm] = useState(initialState)
  const mutation = useAddProject()

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(form as ProjectData, {
      onSuccess: () => setForm(initialState),
    })
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Add a Project</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="fullName"
            className="text-sm font-medium text-slate-700"
          >
            Project Name
          </label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            placeholder="owner/repo"
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-slate-700"
          >
            Project Description
          </label>
          <textarea
            name="description"
            id="description"
            value={form.description ?? ''}
            onChange={handleChange}
            rows={4}
            placeholder="What does this project do?"
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="htmlUrl"
            className="text-sm font-medium text-slate-700"
          >
            GitHub Link
          </label>
          <input
            id="htmlUrl"
            name="htmlUrl"
            value={form.htmlUrl}
            onChange={handleChange}
            required
            placeholder="https://github.com/owner/repo"
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Adding...' : 'Add'}
        </button>
        {mutation.isError && (
          <p className="text-sm text-red-600">
            Something went wrong. Try again.
          </p>
        )}
      </form>
    </div>
  )
}
