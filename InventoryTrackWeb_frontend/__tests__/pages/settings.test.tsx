import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Settings from '@/app/Setting/page'

// Mock dependencies
jest.mock('@/app/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}))

jest.mock('@/app/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock('@/lib/api/auth', () => ({
  uploadProfilePhoto: jest.fn(),
  updateProfile: jest.fn(),
}))

describe('Settings Page', () => {
  beforeEach(() => {
    // Mock localStorage
    const mockUser = {
      fullname: 'Test User',
      email: 'test@example.com',
      phone_number: '1234567890',
      profileImage: '',
    }
    localStorage.setItem('businesstrack_user', JSON.stringify(mockUser))
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('renders settings page without crashing', () => {
    render(<Settings />)
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })

  test('loads user data from localStorage on mount', async () => {
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    })
  })

  test('displays profile image section', () => {
    const { container } = render(<Settings />)
    expect(container.textContent).toMatch(/upload/i)
  })

  test('displays input fields for user information', async () => {
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
    })
  })

  test('has save button to update profile', () => {
    render(<Settings />)
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    expect(saveButton).toBeInTheDocument()
  })
})
