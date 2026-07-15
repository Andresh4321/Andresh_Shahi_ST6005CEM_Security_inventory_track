import { render, screen } from '@testing-library/react'
import RegisterPage from '@/app/pages/(auth)/register/page'

// Mock the RegisterForm component
jest.mock('@/app/(auth)/_components/RegisterForm', () => {
  return function MockRegisterForm() {
    return <div data-testid="register-form">Mock Register Form</div>
  }
})

describe('Register Page', () => {
  test('renders the register page without crashing', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  test('displays the correct heading text', () => {
    render(<RegisterPage />)
    const heading = screen.getByText('Create your account')
    expect(heading).toBeInTheDocument()
    expect(heading.tagName).toBe('H1')
  })

  test('displays the correct subtitle text', () => {
    render(<RegisterPage />)
    const subtitle = screen.getByText('Sign up to get started')
    expect(subtitle).toBeInTheDocument()
  })

  test('renders the RegisterForm component', () => {
    render(<RegisterPage />)
    const registerForm = screen.getByTestId('register-form')
    expect(registerForm).toBeInTheDocument()
  })

  test('has proper layout and spacing classes', () => {
    const { container } = render(<RegisterPage />)
    const mainDiv = container.querySelector('.space-y-6')
    expect(mainDiv).toBeInTheDocument()
    expect(mainDiv).toHaveClass('space-y-6', 'w-full')
  })
})
