import { ProjectData } from '../../models/projects'
import { PREDEFINED_TOPICS } from '../../models/topics'
import { useAddProject } from '../hooks/use-add-project'
import { useState } from 'react'

const initialState: Partial<ProjectData> = {
  fullName: '',
  description: '',
  htmlUrl: '',
  topics: [],
}

export default function CreateProject() {
  const [form, setForm] = useState(initialState)
  const mutation = useAddProject()
  const topicsList = PREDEFINED_TOPICS

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

        <div className="flex flex-col gap-1">
          <p className="mb-1 text-sm font-medium text-slate-700">
            Choose the topics for your project
          </p>
          <div className="flex flex-wrap gap-2">
            {topicsList.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopic(topic)}
                className={
                  form.topics?.includes(topic)
                    ? 'rounded-full bg-green-500 px-3 py-1 text-sm text-white'
                    : 'rounded-full bg-blue-200 px-3 py-1 text-sm text-slate-700'
                }
              >
                {topic}
              </button>
            ))}
          </div>
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
