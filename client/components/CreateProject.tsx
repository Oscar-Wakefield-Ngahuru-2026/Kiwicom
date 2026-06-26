import { ProjectData } from '../../server/models/projects'
import { useAddProject } from '../hooks/use-add-project'
import { useState } from 'react'

const initialState: Partial<ProjectData> = {
  fullName: '',
  description: '',
  htmlUrl: '',
}

export default function CreateProject() {
  const [form, setForm] = useState(initialState)
  const mutation = useAddProject()

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(form as ProjectData, {
      onSuccess: () => setForm(initialState),
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="fullName">Project Name:</label>
        <input
          id="fullName"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Project Description:</label>
        <textarea
          name="description"
          id="description"
          value={form.description ?? ''}
          onChange={handleChange}
        />

        <label htmlFor="htmlUrl">GitHub Link:</label>
        <input
          id="htmlUrl"
          name="htmlUrl"
          value={form.htmlUrl}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Adding...' : 'Add'}
        </button>
        {mutation.isError && <p>Something went wrong. Try again</p>}
      </form>
    </div>
  )
}
