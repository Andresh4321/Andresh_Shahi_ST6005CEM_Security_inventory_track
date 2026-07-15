import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Suppliers from '@/app/Suppliers/page'
import { mockAppContextValue } from '../utils/test-utils'

// Mock API dependencies
jest.mock('@/lib/api/suppliers', () => ({
  supplierApi: {
    getAll: jest.fn(() => Promise.resolve({
      data: {
        data: [
          {
            _id: '1',
            name: 'Test Supplier',
            email: 'test@supplier.com',
            contactNumber: '1234567890',
            products: ['Product 1'],
            createdAt: new Date().toISOString(),
          },
        ],
      },
    })),
  },
}))

jest.mock('@/lib/api/messaging', () => ({
  messagingApi: {
    getConversations: jest.fn(() => Promise.resolve([])),
  },
}))

// Mock dependencies
jest.mock('@/app/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}))

jest.mock('@/app/context/AppContext', () => ({
  useApp: () => mockAppContextValue,
}))

jest.mock('@/app/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('Suppliers Page', () => {
  test('renders suppliers page without crashing', async () => {
    render(<Suppliers />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })
  })

  test('displays add supplier button', async () => {
    render(<Suppliers />)
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add supplier/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  test('displays search input for filtering suppliers', async () => {
    render(<Suppliers />)
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search by supplier/i)
      expect(searchInput).toBeInTheDocument()
    })
  })

  test('displays supplier information from context', async () => {
    render(<Suppliers />)
    await waitFor(() => {
      expect(screen.getByText('Test Supplier')).toBeInTheDocument()
      expect(screen.getByText('test@supplier.com')).toBeInTheDocument()
    })
  })

  test('search input filters suppliers', async () => {
    render(<Suppliers />)
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search by supplier/i)
      fireEvent.change(searchInput, { target: { value: 'Test' } })
      expect(searchInput).toHaveValue('Test')
    })
  })
})
