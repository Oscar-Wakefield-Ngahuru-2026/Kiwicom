import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ProjectCard from '../ProjectCard'

describe('ProjectCard', () => {
  const baseProps = {
    id: 1,
    name: 'Kiwicom',
    description: ' A discovery catalogue for GitHub projects',
    ownerName: 'Oscar-Wakefield-Ngahuru-2026',
    githubUrl: 'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
  }

  it('renders the project name, description, and owner', () => {
    render(
      <MemoryRouter>
        <ProjectCard {...baseProps} />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', {name: /kiwicom/i})).toBeInTheDocument()
    expect(
      screen.getByText('A discovery catalogue for GitHub projects'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Oscar-Wakefield-Ngahuru-2026/i)).toBeInTheDocument()
  })

  it('links the project name to its detail page', () => {
    render(
      <MemoryRouter>
        <ProjectCard {...baseProps} />
      </MemoryRouter>
    )

    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/Oscar-Wakefield-Ngahuru-2026/Kiwicom',
    )

    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})