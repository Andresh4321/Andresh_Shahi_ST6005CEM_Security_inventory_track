import { render, screen } from '@testing-library/react'
import AdminLoginPage from '@/app/pages/(auth)/admin/page'

// Mock the AdminLoginForm component
jest.mock('@/app/(auth)/_components/AdminLoginForm', () => {
  return function MockAdminLoginForm() {
    return <div data-testid="admin-login-form">Mock Admin Login Form</div>
  }
})

describe('Admin Login Page', () => {
  test('renders admin login page without crashing', () => {
    render(<AdminLoginPage />)
    expect(screen.getByText('Admin Access')).toBeInTheDocument()
  })

  test('displays the correct heading text', () => {
    render(<AdminLoginPage />)
    const heading = screen.getByText('Admin Access')
    expect(heading).toBeInTheDocument()
    expect(heading.tagName).toBe('H2')
  })

  test('displays restricted area warning message', () => {
    render(<AdminLoginPage />)
    const warning = screen.getByText('Restricted area. Please sign in with admin credentials.')
    expect(warning).toBeInTheDocument()
  })

  test('renders the AdminLoginForm component', () => {
    render(<AdminLoginPage />)
    const adminLoginForm = screen.getByTestId('admin-login-form')
    expect(adminLoginForm).toBeInTheDocument()
  })

  test('has proper layout classes', () => {
    const { container } = render(<AdminLoginPage />)
    const mainDiv = container.querySelector('.space-y-6')
    expect(mainDiv).toBeInTheDocument()
    expect(mainDiv).toHaveClass('space-y-6', 'w-full')
  })
})
