import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router'
import {
  getProjectById,
  getBookmarkedProjects,
  addBookmark,
  removeBookmark,
} from '../apiClient'
import { useAuth } from '../hooks/use-auth'

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
    return <p>loading project...</p>
  }

  if (isError) {
    return <p>error: this id does not match anything</p>
  }

  return (
    <div className="min-h-screen bg-slate-300 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold">
          <Link
            to={`/developers/${project.fullName.split('/')[0]}`}
            className="text-blue-700 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            {project.fullName.split('/')[0]}
          </Link>
          /{project.fullName.split('/')[1]}
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
            className="mb-4 rounded text-sm font-medium text-slate-700 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        )}

        <div className="mb-6 flex h-64 w-full items-center justify-center rounded-lg bg-gray-200">
          <span className="text-gray-400">No image available</span>
        </div>

        <div className="mb-8 space-y-3 text-base text-gray-800">
          <p>
            <span className="font-semibold">Description:</span>{' '}
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Topics:</span>
            {project.topics?.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {topic}
              </span>
            ))}
          </div>

          <p>
            <span className="font-semibold">Language:</span>{' '}
            {project.primaryLanguage}
          </p>
          <p>
            <span className="font-semibold">Stars:</span> {project.stars}
          </p>
          <p>
            <span className="font-semibold">Open issues:</span>{' '}
            {project.openIssuesCount}
          </p>
          <p>
            <span className="font-semibold">Open source:</span>{' '}
            {project.isOpenSource ? 'Yes' : 'No'}
          </p>

          {project.license && (
            <p>
              <span className="font-semibold">License:</span> {project.license}
            </p>
          )}

          {project.homepage && (
            <p>
              <span className="font-semibold">Homepage:</span>{' '}
              <a
                href={project.homepage}
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                {project.homepage}
              </a>
            </p>
          )}

          {project.aiSummary && (
            <div>
              <span className="font-semibold">AI Summary:</span>
              <p className="mt-1 rounded-lg bg-gray-100 p-3">
                {project.aiSummary}
              </p>
            </div>
          )}

          {project.readme && (
            <div>
              <span className="font-semibold">README:</span>
              <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-100 p-3 text-xs">
                {project.readme}
              </pre>
            </div>
          )}

          {project.lastSyncedAt && (
            <p className="text-xs text-gray-400">
              Last synced: {new Date(project.lastSyncedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <a
          href={isLoggedIn ? project.htmlUrl : undefined}
          onClick={!isLoggedIn ? signIn : undefined}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-full border-2 border-black bg-gray-200 px-6 py-3 font-bold transition-colors hover:border-green-600 hover:bg-green-600 hover:text-white"
        >
          {isLoggedIn ? 'Take me to GitHub repo' : 'Sign in to view repo'}
        </a>
      </div>
    </div>
  )
}

export default ProjectPage
