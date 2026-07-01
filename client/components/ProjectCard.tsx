import { Link } from 'react-router'
import { Bookmark, ExternalLink } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/use-auth'
import {
  getBookmarkedProjects,
  addBookmark,
  removeBookmark,
} from '../apiClient'
import type { ProjectSummary } from '../../models/projects'

interface Props extends ProjectSummary {
  imgUrl?: string
}

function getTopicColor(topic: string): { chip: string; border: string } {
  const t = topic.toLowerCase()
  if (t.includes('beginner') || t.includes('good-first'))
    return {
      chip: 'bg-lime-100 text-lime-800 ring-1 ring-lime-300',
      border: 'border-l-lime-500',
    }
  if (t.includes('react'))
    return { chip: 'bg-blue-100 text-blue-800', border: 'border-l-blue-500' }
  if (t.includes('vue'))
    return {
      chip: 'bg-emerald-100 text-emerald-800',
      border: 'border-l-emerald-500',
    }
  if (t.includes('typescript') || t === 'ts')
    return { chip: 'bg-sky-100 text-sky-800', border: 'border-l-sky-500' }
  if (t.includes('python'))
    return {
      chip: 'bg-yellow-100 text-yellow-800',
      border: 'border-l-yellow-500',
    }
  if (t.includes('tailwind'))
    return { chip: 'bg-cyan-100 text-cyan-800', border: 'border-l-cyan-500' }
  if (t.includes('javascript') || t === 'js')
    return {
      chip: 'bg-amber-100 text-amber-800',
      border: 'border-l-amber-500',
    }
  if (t.includes('node'))
    return {
      chip: 'bg-green-100 text-green-800',
      border: 'border-l-green-500',
    }
  if (t.includes('express'))
    return {
      chip: 'bg-slate-100 text-slate-800',
      border: 'border-l-slate-500',
    }
  return { chip: 'bg-teal-100 text-teal-800', border: 'border-l-teal-500' }
}

export default function ProjectCard({
  id,
  name,
  description,
  ownerName,
  githubUrl,
  imgUrl,
  topics,
}: Props) {
  const { user, isLoggedIn } = useAuth()
  const queryClient = useQueryClient()

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => getBookmarkedProjects(user!.id),
    enabled: isLoggedIn,
  })

  const isBookmarked = bookmarks?.some((p) => p.id === id) ?? false

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) return
      if (isBookmarked) {
        await removeBookmark(user.id, id)
      } else {
        await addBookmark(user.id, id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] })
    },
  })

  const primaryTopic = topics?.[0] ?? ''
  const borderClass = getTopicColor(primaryTopic).border

  return (
    <article
      className={`flex h-full flex-col rounded-lg border border-l-4 border-slate-200 bg-gradient-to-br from-blue-50 via-emerald-50 to-yellow-50 p-4 shadow-sm hover:scale-[1.02] hover:shadow-lg motion-safe:transition-all ${borderClass}`}
    >
      {imgUrl && (
        <img
          src={imgUrl}
          alt=""
          className="mb-3 h-32 w-full rounded object-cover"
        />
      )}

      <h3 className="text-lg font-semibold">
        <Link
          to={`/projects/${id}`}
          className="text-slate-900 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {name}
        </Link>
      </h3>
      {isLoggedIn && (
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          aria-pressed={isBookmarked}
          aria-label={
            isBookmarked ? 'Remove bookmark' : 'Bookmark this project'
          }
          className="mt-1 inline-flex items-center gap-1.5 self-start rounded-full px-2 py-1 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
        >
          <Bookmark
            className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
          />
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      )}

      <p className="mt-1 text-sm text-slate-600">
        by{' '}
        <Link
          to={`/developers/${ownerName}`}
          className="text-blue-700 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {ownerName}
        </Link>
      </p>
      <p className="mt-2 flex-1 text-sm text-slate-700">{description}</p>

      {topics && topics.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <li
              key={topic}
              className={`rounded-full px-2 py-0.5 text-xs ${getTopicColor(topic).chip}`}
            >
              {topic}
            </li>
          ))}
        </ul>
      )}

      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 group inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all"
      >
        View on GitHub
        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </article>
  )
}
