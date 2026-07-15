import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/pages/(auth)/login/page'

// Mock the LoginForm component
jest.mock('@/app/(auth)/_components/LoginForm', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Mock Login Form</div>
  }
})

describe('Login Page', () => {
  test('renders the login page without crashing', () => {
    render(<LoginPage />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  test('displays the correct heading text', () => {
    render(<LoginPage />)
    const heading = screen.getByText('Welcome back')
    expect(heading).toBeInTheDocument()
    expect(heading.tagName).toBe('H2')
  })

  test('displays the correct subtitle text', () => {
    render(<LoginPage />)
    const subtitle = screen.getByText('Enter your credentials to access your dashboard')
    expect(subtitle).toBeInTheDocument()
  })

  test('renders the LoginForm component', () => {
    render(<LoginPage />)
    const loginForm = screen.getByTestId('login-form')
    expect(loginForm).toBeInTheDocument()
  })

  test('has proper spacing and layout classes', () => {
    const { container } = render(<LoginPage />)
    const mainDiv = container.querySelector('.space-y-6')
    expect(mainDiv).toBeInTheDocument()
    expect(mainDiv).toHaveClass('space-y-6', 'w-full')
  })
})
