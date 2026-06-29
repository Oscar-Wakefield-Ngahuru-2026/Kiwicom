import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router'
import ProjectPage from '../../pages/ProjectPage'
import { getProjectById } from '../../apiClient'

vi.mock('../../apiClient')

function renderProjectPage(id = '12345') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/projects/${id}`]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProjectPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  it('shows a loading state while the project is fetching', () => {
    vi.mocked(getProjectById).mockReturnValue(new Promise(() => {}))

    renderProjectPage()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
  it('renders the project details on success', async () => {
    vi.mocked(getProjectById).mockResolvedValue({
      id: 12345,
      fullName: 'Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      description: 'A discovery catalogue for GitHub projects',
      htmlUrl: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
      homepage: null,
      primaryLanguage: 'TypeScript',
      topics: ['react', 'tailwind'],
      stars: 42,
      openIssuesCount: 3,
      isOpenSource: true,
      license: null,
      readme: null,
      aiSummary: null,
      aiSummaryAt: null,
      lastSyncedAt: null,
      createdAt: new Date('2026-06-25'),
    })

    renderProjectPage()

    expect(
      await screen.findByRole('heading', {
        name: /Oscar-Wakefield-Ngahuru-2026\/Kiwicom/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/A discovery catalogue for GitHub projects/i),
    ).toBeInTheDocument()
  })
  it('shows the error message when the project is not found', async () => {
    vi.mocked(getProjectById).mockRejectedValue(new Error('Not Found'))

    renderProjectPage('999999')

    expect(
      await screen.findByText(/does not match anything/i),
    ).toBeInTheDocument()
  })
  it('shows the error message when the API is false', async () => {
    vi.mocked(getProjectById).mockRejectedValue(new Error('Network down'))

    renderProjectPage()

    expect(
      await screen.findByText(/does not match anything/i),
    ).toBeInTheDocument()
  })
})
