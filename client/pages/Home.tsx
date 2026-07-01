import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../apiClient'
import ProjectCard from '../components/ProjectCard'
import { useState, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useDebounce } from '../hooks/use-debounce'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

function KiwicomGradientCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const prefersReducedMotion = useReducedMotion()

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = -(y / rect.height) * 5
    const rotateY = (x / rect.width) * 5
    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative rounded-[32px] overflow-hidden mx-auto"
      style={{
        width: '360px',
        height: '450px',
        transformStyle: 'preserve-3d',
        backgroundColor: '#0e131f',
        boxShadow:
          '0 -10px 100px 10px rgba(78, 99, 255, 0.25), 0 0 10px 0 rgba(0, 0, 0, 0.5)',
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered && !prefersReducedMotion ? -5 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        perspective: 1000,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Glass reflection overlay */}
      <motion.div
        className="absolute inset-0 z-35 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(2px)',
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0.5,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Dark background */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(180deg, #000000 0%, #000000 70%)' }}
      />

      {/* Blue/cyan side glows */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-20"
        style={{
          background: `radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.7) -10%, rgba(59, 130, 246, 0) 70%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.7) -10%, rgba(6, 182, 212, 0) 70%)`,
          filter: 'blur(40px)',
        }}
        animate={{ opacity: isHovered ? 0.9 : 0.8 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Central indigo glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-21"
        style={{
          background: `radial-gradient(circle at bottom center, rgba(99, 102, 241, 0.7) -20%, rgba(99, 102, 241, 0) 60%)`,
          filter: 'blur(45px)',
        }}
        animate={{ opacity: isHovered ? 0.85 : 0.75, y: '10%' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Bottom border glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
        style={{
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)',
        }}
        animate={{
          boxShadow: isHovered
            ? '0 0 20px 4px rgba(59, 130, 246, 0.9), 0 0 30px 6px rgba(99, 102, 241, 0.7), 0 0 40px 8px rgba(6, 182, 212, 0.5)'
            : '0 0 15px 3px rgba(59, 130, 246, 0.8), 0 0 25px 5px rgba(99, 102, 241, 0.6), 0 0 35px 7px rgba(6, 182, 212, 0.4)',
          opacity: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Card content */}
      <motion.div className="relative flex flex-col h-full p-8 z-40">
        {/* Star icon circle */}
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(225deg, #171c2c 0%, #121624 100%)',
          }}
          animate={{
            boxShadow: isHovered
              ? '0 8px 16px -2px rgba(0, 0, 0, 0.3), inset 2px 2px 5px rgba(255, 255, 255, 0.15), inset -2px -2px 5px rgba(0, 0, 0, 0.7)'
              : '0 6px 12px -2px rgba(0, 0, 0, 0.25), inset 1px 1px 3px rgba(255, 255, 255, 0.12), inset -2px -2px 4px rgba(0, 0, 0, 0.5)',
            y: isHovered ? -2 : 0,
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div
            className="absolute top-0 left-0 w-2/3 h-2/3 opacity-40 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(255, 255, 255, 0.5), transparent 80%)',
              filter: 'blur(10px)',
            }}
          />
          <div className="flex items-center justify-center w-full h-full relative z-10">
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 0L9.4 5.4L14.8 5.4L10.6 8.8L12 14.2L8 10.8L4 14.2L5.4 8.8L1.2 5.4L6.6 5.4L8 0Z"
                fill="white"
              />
            </svg>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h3
          className="text-2xl font-medium text-white mb-3"
          style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
        >
          Find your next project
        </motion.h3>

        {/* Description */}
        <motion.p
          className="text-sm mb-6 text-gray-300"
          style={{ lineHeight: 1.5, fontWeight: 350, opacity: 0.85 }}
        >
          A community-curated catalogue of beginner-friendly open-source
          repos — discover what&apos;s growing.
        </motion.p>

        {/* Start browsing link */}
        <motion.a
          href="#projects"
          className="inline-flex items-center text-white text-sm font-medium group mt-auto self-start"
        >
          Start browsing
          <motion.svg
            className="ml-1 w-4 h-4"
            width="8"
            height="8"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <path
              d="M1 8H15M15 8L8 1M15 8L8 15"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.a>
      </motion.div>
    </motion.div>
  )
}

function PlaygroundHero() {
  return (
    <div className="relative w-full bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-slate-50 to-slate-50" />
      <section className="relative max-w-full mx-auto">
        <div className="max-w-screen-xl z-10 mx-auto px-4 py-20 gap-12 md:px-8 flex flex-col lg:flex-row items-center">
          {/* Left: text */}
          <div className="space-y-6 max-w-2xl lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Built by Dev Academy Ngahuru 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="block text-slate-900">Find your next</span>
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                open-source project
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl">
              A community-curated catalogue of beginner-friendly repos.
              Discover something to contribute to, share what you&apos;ve built.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#projects"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                Browse projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/projects/new"
                className="px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                Add your project
              </Link>
            </div>
          </div>
          {/* Right: animated gradient card */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
            <KiwicomGradientCard />
          </div>
        </div>
      </section>
    </div>
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
    <>
      <PlaygroundHero />
      <section id="projects" className="min-h-screen bg-gray-900 p-4">
        <h1 className="mb-4 text-2xl font-bold text-blue-400">Browse Projects</h1>
      <input
        type="text"
        placeholder="Search projects by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-96 rounded border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                createdAt={project.createdAt}
              />
            </li>
          ))
        )}
      </ul>
    </section>
    </>
  )
}
