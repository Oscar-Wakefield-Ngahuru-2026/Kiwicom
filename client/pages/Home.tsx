import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../apiClient'
import ProjectCard from '../components/ProjectCard'
import FilterBar from '../components/FilterBar'
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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [learningMode, setLearningMode] = useState(false)

  function toggleItem(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
  }

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

  const languages = [...new Set(projects.map((p) => p.primaryLanguage).filter(Boolean))] as string[]
  const topics = [...new Set(projects.flatMap((p) => p.topics ?? []).filter(Boolean))]

  const filteredProjects = projects
    .filter((p) => p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter((p) => selectedLanguages.length === 0 || (p.primaryLanguage && selectedLanguages.includes(p.primaryLanguage)))
    .filter((p) => selectedTopics.length === 0 || selectedTopics.every((t) => p.topics?.includes(t)))
    .filter((p) => !learningMode || p.isOpenSource)


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
      <FilterBar
        languages={languages}
        topics={topics}
        selectedLanguages={selectedLanguages}
        selectedTopics={selectedTopics}
        learningMode={learningMode}
        onLanguageChange={(lang) => setSelectedLanguages(toggleItem(selectedLanguages, lang))}
        onTopicChange={(topic) => setSelectedTopics(toggleItem(selectedTopics, topic))}
        onLearningChange={setLearningMode}
      />
      <ul className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.length === 0 && search ? (
          <p className="text-slate-400">
            No projects found for &quot;{search}&quot;
          </p>
        ) : (
          filteredProjects.map((project) => (
            <li key={project.id} className="h-full">
              <ProjectCard
                id={project.id}
                name={project.name}
                description={project.description}
                ownerName={project.ownerName}
                githubUrl={project.githubUrl}
                topics={project.topics ?? []}
              />
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
