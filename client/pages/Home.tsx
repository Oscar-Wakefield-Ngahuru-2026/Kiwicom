import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../apiClient'
import ProjectCard from '../components/ProjectCard'

export default function Home() {
  const {
    data: projects,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

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

  if (projects.length === 0) {
    return <p>No projects yet - be the first to add one!</p>
  }

  return (
    <section className="min-h-screen bg-gray-900 p-4">
      <h1 className="mb-4 text-2xl font-bold text-blue-400">Browse Projects</h1>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard
              id={project.id}
              name={project.name}
              description={project.description}
              ownerName={project.ownerName}
              githubUrl={project.githubUrl}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
