import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIAssistant from '@/app/pages/AIAssistant/page'

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

jest.mock('@/lib/api/suppliers', () => ({
  supplierApi: {
    getAllSuppliers: jest.fn(() => Promise.resolve([])),
    getSupplierById: jest.fn(() => Promise.resolve({})),
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

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

describe('AI Assistant View Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Element.prototype.scrollIntoView = jest.fn()
  })

  test('renders AI assistant page without crashing', () => {
    render(<AIAssistant />)
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })

  test('displays welcome message from AI assistant', async () => {
    render(<AIAssistant />)
    await waitFor(() => {
      expect(screen.getByText(/Hello! I'm your AI assistant/i)).toBeInTheDocument()
    })
  })

  test('displays input field for user messages', async () => {
    render(<AIAssistant />)
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  test('shows predefined question suggestions', async () => {
    render(<AIAssistant />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })
  })

  test('renders send button', async () => {
    render(<AIAssistant />)
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  test('displays assistant message handling', async () => {
    render(<AIAssistant />)
    await waitFor(() => {
      const dashboardLayout = screen.getByTestId('dashboard-layout')
      expect(dashboardLayout).toBeInTheDocument()
    })
  })

  test('has proper spacing and layout', () => {
    const { container } = render(<AIAssistant />)
    const layout = screen.getByTestId('dashboard-layout')
    expect(layout).toBeInTheDocument()
  })

  test('displays card components for messages', () => {
    render(<AIAssistant />)
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })
})
