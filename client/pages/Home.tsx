import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../apiClient'
import ProjectCard from '../components/ProjectCard'
import { useState } from 'react'
import { useDebounce } from '../hooks/use-debounce'

export default function Home() {
  const {
    data: projects,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search, 450)


  if (isPending) {
    return (
      <p role="status" aria-live="polite">
        Loading projects...
      </p>
    )
  }

  if (isError) {
    return (
      <p role="alert">
        Sorry-we couldn&apos;t load projects, Please try again.
      </p>
    )
  }

  const filteredProjects = projects?.filter((project) =>
    project.name?.toLowerCase().includes(debouncedSearch.toLowerCase()),
  )

  if (projects.length === 0) {
    return <p>No projects yet - be the first to add one!</p>
  }

  return (
    <section className="min-h-screen bg-gray-900 p-4">
      <h1 className="mb-4 text-2xl font-bold text-blue-400">Browse Projects</h1>
      <input
        type="text"
        placeholder="Search projects by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-96 rounded border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.length === 0 && search ? (
          <p className="text-slate-400">
            No projects found for &quot;{search}&quot;
          </p>
        ) : (
          filteredProjects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                id={project.id}
                name={project.name}
                description={project.description}
                ownerName={project.ownerName}
                githubUrl={project.githubUrl}
              />
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
