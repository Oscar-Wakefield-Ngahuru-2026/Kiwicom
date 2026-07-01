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

// vixenz-derived tokens (card bumped lighter — playground)
const DEEP_SKY = '#1E2A4C'
const TILE_BORDER = '#2E3B5F'
const MOONLIGHT = '#F3EAD7'
const MIST = '#B3BCD0'
const MAGNOLIA = '#E8B4C4'
const LANTERN = '#E6B870'
const LOTUS = '#6FB3B8'

const FONT_BODY = 'Lexend, system-ui, sans-serif'
const FONT_MONO = 'JetBrains Mono, ui-monospace, monospace'

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
  const isBeginnerFriendly = (topics ?? []).some(
    (t) => t.toLowerCase().includes('beginner') || t.toLowerCase().includes('good-first'),
  )

  return (
    <article
      className="flex h-full flex-col rounded-md border p-6 transition-all hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        backgroundColor: DEEP_SKY,
        borderColor: TILE_BORDER,
        borderLeft: `3px solid ${MAGNOLIA}`,
        fontFamily: FONT_BODY,
      }}
    >
      {imgUrl && (
        <img
          src={imgUrl}
          alt=""
          className="mb-4 h-32 w-full rounded object-cover"
        />
      )}

      {/* Mono meta label */}
      <p
        className="mb-3 text-[0.6875rem] uppercase tracking-[0.15em]"
        style={{
          fontFamily: FONT_MONO,
          color: isBeginnerFriendly ? MAGNOLIA : LOTUS,
        }}
      >
        {primaryTopic ? `PROJECT · ${primaryTopic}` : 'PROJECT'}
      </p>

      {/* Title */}
      <h3
        className="mb-2 text-lg font-medium leading-snug"
        style={{ color: MOONLIGHT }}
      >
        <Link
          to={`/projects/${id}`}
          className="transition-colors"
          style={{ color: MOONLIGHT, textDecoration: 'none' }}
        >
          {name}
        </Link>
      </h3>

      {/* By line */}
      <p className="mb-3 text-xs" style={{ color: MIST }}>
        by{' '}
        <Link
          to={`/developers/${ownerName}`}
          className="border-b border-transparent hover:border-current transition-colors"
          style={{ color: LANTERN }}
        >
          {ownerName}
        </Link>
      </p>

      {/* Description */}
      <p
        className="mb-4 flex-1 text-sm leading-relaxed"
        style={{ color: MIST, lineHeight: 1.55 }}
      >
        {description}
      </p>

      {/* All topics as mono meta */}
      {topics && topics.length > 1 && (
        <p
          className="mb-4 text-[0.6875rem] uppercase tracking-[0.15em]"
          style={{ fontFamily: FONT_MONO, color: LOTUS }}
        >
          {topics.slice(1).join(' · ')}
        </p>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center gap-4">
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            aria-pressed={isBookmarked}
            aria-label={
              isBookmarked ? 'Remove bookmark' : 'Bookmark this project'
            }
            className="inline-flex items-center gap-1.5 text-xs transition-colors"
            style={{
              fontFamily: FONT_MONO,
              color: isBookmarked ? LANTERN : MIST,
            }}
          >
            <Bookmark
              className="w-3.5 h-3.5"
              style={{
                fill: isBookmarked ? LANTERN : 'transparent',
                color: isBookmarked ? LANTERN : MIST,
              }}
            />
            {isBookmarked ? 'SAVED' : 'SAVE'}
          </button>
        )}
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto group inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] transition-colors"
          style={{ fontFamily: FONT_MONO, color: LOTUS }}
        >
          GitHub
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </article>
  )
}
