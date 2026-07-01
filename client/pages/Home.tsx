import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../apiClient'
import ProjectCard from '../components/ProjectCard'
import FilterBar from '../components/FilterBar'
import { useState } from 'react'
import { useDebounce } from '../hooks/use-debounce'
import { Link } from 'react-router'


function PlaygroundHero() {
  return (
    <section
      className="relative w-full min-h-[560px] flex items-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(14, 20, 38, 0.92) 0%, rgba(14, 20, 38, 0.6) 45%, rgba(14, 20, 38, 0.15) 100%), url('/avatars/wanakatree.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32 w-full"
        style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
      >
        <p
          className="mb-6 text-xs uppercase tracking-[0.25em]"
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            color: '#6FB3B8',
          }}
        >
          Open Source · Curated by Ngahuru 2026 · Aotearoa
        </p>
        <h1
          className="mb-6 text-6xl md:text-7xl font-medium tracking-tight"
          style={{ color: '#F3EAD7' }}
        >
          Kiwicom<span style={{ color: '#E8B4C4' }}>.</span>
        </h1>
        <p
          className="mb-10 max-w-2xl text-lg leading-relaxed"
          style={{ color: '#B3BCD0' }}
        >
          A community-curated catalogue of beginner-friendly open-source repos.
          Discover something to contribute to, share what you&apos;ve built.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded border text-sm font-medium hover:-translate-y-0.5 transition-all"
            style={{
              borderColor: '#1F2A45',
              backgroundColor: 'rgba(19, 28, 50, 0.7)',
              color: '#F3EAD7',
            }}
          >
            Browse projects
            <span style={{ color: '#E6B870' }}>→</span>
          </a>
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded border text-sm font-medium hover:-translate-y-0.5 transition-all"
            style={{ borderColor: '#1F2A45', color: '#B3BCD0' }}
          >
            Add your project
          </Link>
        </div>
      </div>
    </section>
  )
}

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
    <>
      <PlaygroundHero />
      <section
        id="projects"
        className="min-h-screen p-6 md:p-10"
        style={{ backgroundColor: '#0E1426' }}
      >
        <p
          className="mb-3 text-xs uppercase tracking-[0.25em]"
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            color: '#6FB3B8',
          }}
        >
          The Catalogue
        </p>
        <h1
          className="mb-8 text-3xl font-medium"
          style={{
            fontFamily: 'Lexend, system-ui, sans-serif',
            color: '#F3EAD7',
          }}
        >
          Projects
        </h1>
      <input
        type="text"
        placeholder="Search projects by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 w-full max-w-md rounded border px-4 py-2 text-sm focus:outline-none focus:ring-1"
        style={{
          backgroundColor: '#131C32',
          borderColor: '#1F2A45',
          color: '#F3EAD7',
        }}
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
              <ProjectCard {...project} topics={project.topics ?? []} />
            </li>
          ))
        )}
      </ul>
    </section>
    </>
  )
}
