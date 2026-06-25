import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import Home from '../Home'
import { getProjects } from '../../apiClient'

vi.mock('../../apiClient')

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Home', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows a loading state while projects are fetching', () => {
    vi.mocked(getProjects).mockReturnValue(new Promise(() => {}))

    renderHome()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows an empty-state message when there are no projects', async () => {
    vi.mocked(getProjects).mockResolvedValue([])

    renderHome()

    expect(await screen.findByText(/no projects yet/i)).toBeInTheDocument()
  })

  it('renders a card for each project on success', async () => {
    vi.mocked(getProjects).mockResolvedValue([
      {
        id: 1,
        name: 'Kiwicom',
        description: 'A discovery catalogue for GitHub projects',
        githubUrl: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
        ownerName: 'Oscar-Wakefield-Ngahuru-2026',
        createdAt: '2026-06-25T19:50:55.000Z',
      },
      {
        id: 2,
        name: 'Boilerplate',
        description: 'A starter template',
        githubUrl: 'https://github.com/dev-academy/boilerplate',
        ownerName: 'dev-academy',
        createdAt: '2026-06-24T10:00:00.000Z',
      },
    ])

    renderHome()

    expect(
      await screen.findByRole('heading', { name: /kiwicom/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /boilerplate/i }),
    ).toBeInTheDocument()
  })

  it('shows an error message when the API fails', async () => {
    vi.mocked(getProjects).mockRejectedValue(new Error('Network down'))

    renderHome()

    expect(
      await screen.findByText(/couldn't load projects/i),
    ).toBeInTheDocument()
  })
})