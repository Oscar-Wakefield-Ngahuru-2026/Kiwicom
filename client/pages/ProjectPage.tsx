import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router'
import { Bookmark, ExternalLink } from 'lucide-react'
import {
  getProjectById,
  getBookmarkedProjects,
  addBookmark,
  removeBookmark,
} from '../apiClient'
import { useAuth } from '../hooks/use-auth'

const MIDNIGHT = '#0E1426'
const DEEP_SKY = '#1E2A4C'
const TILE_BORDER = '#2E3B5F'
const INPUT_BG = '#131C32'
const MOONLIGHT = '#F3EAD7'
const MIST = '#B3BCD0'
const MAGNOLIA = '#E8B4C4'
const LANTERN = '#E6B870'
const LOTUS = '#6FB3B8'
const FONT_BODY = 'Lexend, system-ui, sans-serif'
const FONT_MONO = 'JetBrains Mono, ui-monospace, monospace'

const pageWrap = 'min-h-screen pt-24 pb-16'
const pageWrapStyle = { backgroundColor: MIDNIGHT, fontFamily: FONT_BODY }
const cardStyle = {
  backgroundColor: DEEP_SKY,
  border: `1px solid ${TILE_BORDER}`,
  borderLeft: `3px solid ${MAGNOLIA}`,
}
const innerCardStyle = {
  backgroundColor: INPUT_BG,
  border: `1px solid ${TILE_BORDER}`,
  borderLeft: `2px solid ${LOTUS}`,
}

function ProjectPage() {
  const { id } = useParams()
  const projectId = Number(id)
  const { user, isLoggedIn, signIn } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: project,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  })

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => getBookmarkedProjects(user!.id),
    enabled: isLoggedIn,
  })

  const isBookmarked = bookmarks?.some((p) => p.id === projectId) ?? false

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) return
      if (isBookmarked) {
        await removeBookmark(user.id, projectId)
      } else {
        await addBookmark(user.id, projectId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] })
    },
  })

  if (isPending) {
    return (
      <div className={pageWrap} style={pageWrapStyle}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ color: MIST }}>Loading project…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={pageWrap} style={pageWrapStyle}>
        <div className="mx-auto max-w-3xl px-4">
          <p style={{ color: MAGNOLIA }}>
            Sorry — this project doesn&apos;t match anything we have.
          </p>
        </div>
      </div>
    )
  }

  const owner = project.fullName.split('/')[0]
  const repo = project.fullName.split('/')[1]
  const primaryTopic = project.topics?.[0] ?? ''

  return (
    <main className={pageWrap} style={pageWrapStyle}>
      <div className="mx-auto max-w-3xl px-6">
        <p
          className="mb-2 text-xs uppercase tracking-[0.25em]"
          style={{ fontFamily: FONT_MONO, color: LOTUS }}
        >
          {primaryTopic ? `Project · ${primaryTopic}` : 'Project'}
        </p>

        <h1
          className="mb-8 text-4xl font-medium leading-tight md:text-5xl"
          style={{ color: MOONLIGHT }}
        >
          <Link
            to={`/developers/${owner}`}
            className="hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: LANTERN, outlineColor: LANTERN }}
          >
            {owner}
          </Link>
          <span style={{ color: MIST }}> / </span>
          {repo}
          <span style={{ color: MAGNOLIA }}>.</span>
        </h1>

        {isLoggedIn && (
          <button
            type="button"
            onClick={() => bookmarkMutation.mutate()}
            disabled={bookmarkMutation.isPending}
            aria-pressed={isBookmarked}
            aria-label={
              isBookmarked ? 'Remove bookmark' : 'Bookmark this project'
            }
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: FONT_MONO,
              color: isBookmarked ? LANTERN : MIST,
              outlineColor: LANTERN,
            }}
          >
            <Bookmark
              className="h-3.5 w-3.5"
              style={{
                fill: isBookmarked ? LANTERN : 'transparent',
                color: isBookmarked ? LANTERN : MIST,
              }}
              aria-hidden="true"
            />
            {isBookmarked ? 'Saved' : 'Save this project'}
          </button>
        )}

        <section className="mb-8 rounded-md p-6 md:p-8" style={cardStyle}>
          {project.description && (
            <>
              <p
                className="mb-2 text-xs uppercase tracking-[0.2em]"
                style={{ fontFamily: FONT_MONO, color: LOTUS }}
              >
                About
              </p>
              <p
                className="mb-6 text-base leading-relaxed"
                style={{ color: MIST }}
              >
                {project.description}
              </p>
            </>
          )}

          {project.topics && project.topics.length > 0 && (
            <>
              <p
                className="mb-2 text-xs uppercase tracking-[0.2em]"
                style={{ fontFamily: FONT_MONO, color: LOTUS }}
              >
                Topics
              </p>
              <p
                className="mb-6 text-xs uppercase tracking-[0.15em]"
                style={{ fontFamily: FONT_MONO, color: MIST }}
              >
                {project.topics.join(' · ')}
              </p>
            </>
          )}

          <p
            className="mb-2 text-xs uppercase tracking-[0.2em]"
            style={{ fontFamily: FONT_MONO, color: LOTUS }}
          >
            At a glance
          </p>
          <dl
            className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3"
            style={{ fontFamily: FONT_MONO }}
          >
            {project.primaryLanguage && (
              <div>
                <dt className="text-xs uppercase tracking-[0.15em]" style={{ color: MIST }}>
                  Language
                </dt>
                <dd style={{ color: MOONLIGHT }}>{project.primaryLanguage}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-[0.15em]" style={{ color: MIST }}>
                Stars
              </dt>
              <dd style={{ color: MOONLIGHT }}>{project.stars}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em]" style={{ color: MIST }}>
                Open issues
              </dt>
              <dd style={{ color: MOONLIGHT }}>{project.openIssuesCount}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em]" style={{ color: MIST }}>
                Open source
              </dt>
              <dd style={{ color: MOONLIGHT }}>
                {project.isOpenSource ? 'Yes' : 'No'}
              </dd>
            </div>
            {project.license && (
              <div>
                <dt className="text-xs uppercase tracking-[0.15em]" style={{ color: MIST }}>
                  License
                </dt>
                <dd style={{ color: MOONLIGHT }}>{project.license}</dd>
              </div>
            )}
            {project.homepage && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs uppercase tracking-[0.15em]" style={{ color: MIST }}>
                  Homepage
                </dt>
                <dd>
                  <a
                    href={project.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ color: LANTERN, outlineColor: LANTERN }}
                  >
                    {project.homepage}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {project.aiSummary && (
          <section className="mb-8 rounded-md p-6" style={innerCardStyle}>
            <p
              className="mb-2 text-xs uppercase tracking-[0.2em]"
              style={{ fontFamily: FONT_MONO, color: LOTUS }}
            >
              AI Summary
            </p>
            <p className="text-sm leading-relaxed" style={{ color: MIST }}>
              {project.aiSummary}
            </p>
          </section>
        )}

        {project.readme && (
          <section className="mb-8 rounded-md p-6" style={cardStyle}>
            <p
              className="mb-3 text-xs uppercase tracking-[0.2em]"
              style={{ fontFamily: FONT_MONO, color: LOTUS }}
            >
              README
            </p>
            <pre
              className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md p-4 text-xs leading-relaxed"
              style={{
                fontFamily: FONT_MONO,
                backgroundColor: INPUT_BG,
                border: `1px solid ${TILE_BORDER}`,
                color: MIST,
              }}
            >
              {project.readme}
            </pre>
          </section>
        )}

        <a
          href={isLoggedIn ? project.htmlUrl : undefined}
          onClick={!isLoggedIn ? signIn : undefined}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs uppercase tracking-[0.2em] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontFamily: FONT_MONO,
            backgroundColor: INPUT_BG,
            border: `1px solid ${LANTERN}`,
            color: LANTERN,
            outlineColor: LANTERN,
          }}
        >
          {isLoggedIn ? 'Take me to GitHub repo' : 'Sign in to view repo'}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        {project.lastSyncedAt && (
          <p
            className="mt-8 text-[0.65rem] uppercase tracking-[0.15em]"
            style={{ fontFamily: FONT_MONO, color: MIST }}
          >
            Last synced · {new Date(project.lastSyncedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </main>
  )
}

export default ProjectPage
