import { Link } from 'react-router'
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

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md motion-safe:transition">
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
          className="mt-1 self-start rounded text-sm text-slate-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
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
              className="rounded-full bg-teal-100 px-2 py-0.5 text-xs text-slate-700"
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
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        View on GitHub
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  )
}
