import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ForgotPasswordPage from '@/app/pages/(auth)/handleForgotPassword/page'

// Mock the auth API
jest.mock('@/lib/api/auth', () => ({
  forgotPassword: jest.fn(),
}))

import { forgotPassword } from '@/lib/api/auth'

describe('Forgot Password Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders forgot password page without crashing', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })

  test('displays email input field', () => {
    render(<ForgotPasswordPage />)
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toBeInTheDocument()
  })

  test('allows user to enter email', () => {
    render(<ForgotPasswordPage />)
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(emailInput.value).toBe('test@example.com')
  })

  test('displays submit button', () => {
    render(<ForgotPasswordPage />)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    expect(submitButton).toBeInTheDocument()
  })

  test('shows success message after successful submission', async () => {
    (forgotPassword as jest.Mock).mockResolvedValue({
      message: 'Check your email for password reset instructions',
    })

    render(<ForgotPasswordPage />)
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })
})
