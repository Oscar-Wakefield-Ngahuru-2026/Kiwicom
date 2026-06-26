// @vitest-environment jsdom
import { renderApp } from '../../test-setup'
import { describe, it, expect } from 'vitest'


describe('Navbar.tsx', () => {
  it('renders the KIWICOM.COM logo linking to /', () => {
    // ARRANGE
    const { ...screen } = renderApp('/')
    const logo = screen.getByRole('link', { name: 'KIWICOM.COM' })
    // ASSERT
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('href', '/')
  })

  it('renders the Add Project link pointing to /projects/new', () => {
    // ARRANGE
    const { ...screen } = renderApp('/')
    const link = screen.getByRole('link', { name: 'Add Project' })
    // ASSERT
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/projects/new')
  })
})