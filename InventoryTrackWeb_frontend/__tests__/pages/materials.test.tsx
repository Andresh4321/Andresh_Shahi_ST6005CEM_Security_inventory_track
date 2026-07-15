import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Materials from '@/app/Materials/page'
import { mockAppContextValue } from '../utils/test-utils'

// Mock API dependencies
jest.mock('@/lib/api/endpoints', () => ({
  materialsAPI: {
    getAll: jest.fn(() => Promise.resolve({
      data: {
        data: [
          {
            _id: '1',
            name: 'Test Material',
            unit: 'kg',
            unit_price: 10,
            minimum_stock: 20,
          },
        ],
      },
    })),
  },
  stockAPI: {
    getCurrentStock: jest.fn(() => Promise.resolve({
      data: {
        data: [
          {
            material: '1',
            quantity: 100,
          },
        ],
      },
    })),
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

describe('Materials Page', () => {
  test('renders materials page without crashing', async () => {
    render(<Materials />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })
  })

  test('displays the add material button', async () => {
    render(<Materials />)
    await waitFor(() => {
      const addButtons = screen.getAllByText(/add material/i)
      expect(addButtons.length).toBeGreaterThan(0)
    })
  })

  test('displays material list from context', async () => {
    render(<Materials />)
    await waitFor(() => {
      expect(screen.getByText('Test Material')).toBeInTheDocument()
    })
  })

  test('displays material information', async () => {
    const { container } = render(<Materials />)
    await waitFor(() => {
      expect(container.textContent).toContain('Test Material')
    })
  })

  test('shows material inventory cards', async () => {
    const { container } = render(<Materials />)
    await waitFor(() => {
      const cards = container.querySelectorAll('[class*="gap"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })
})
