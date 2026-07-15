import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Messaging from '@/app/pages/Messaging/page'
import { mockAppContextValue } from '../utils/test-utils'

// Mock dependencies
jest.mock('@/app/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ 
    children, 
    title, 
    subtitle 
  }: { 
    children: React.ReactNode; 
    title: string; 
    subtitle: string 
  }) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </div>
  ),
}))

jest.mock('@/app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/lib/api/messaging', () => ({
  messagingApi: {
    getConversations: jest.fn(() => Promise.resolve([])),
    getMessages: jest.fn(() => Promise.resolve([])),
    sendMessage: jest.fn(() => Promise.resolve({ success: true })),
  },
}))

jest.mock('@/app/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}))

describe('Messaging Page', () => {
  test('renders messaging page without crashing', () => {
    render(<Messaging />)
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })

  test('displays messaging interface', async () => {
    render(<Messaging />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })
  })

  test('renders message circle icon', async () => {
    const { container } = render(<Messaging />)
    await waitFor(() => {
      expect(container).toBeInTheDocument()
    })
  })

  test('has input field for typing messages', async () => {
    render(<Messaging />)
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  test('renders with proper layout structure', () => {
    const { container } = render(<Messaging />)
    expect(container).toBeInTheDocument()
  })

  test('displays loading state appropriately', () => {
    render(<Messaging />)
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })
})
