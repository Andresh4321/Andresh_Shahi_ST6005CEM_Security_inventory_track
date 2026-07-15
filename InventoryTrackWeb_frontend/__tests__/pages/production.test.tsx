import { render, screen, waitFor } from '@testing-library/react'
import Production from '@/app/pages/Production/page'
import { mockAppContextValue } from '../utils/test-utils'
// Mock API dependencies
jest.mock('@/lib/api/material', () => ({
  fetchInventoryMaterials: jest.fn(() => Promise.resolve([
    {
      id: '1',
      name: 'Test Material',
      unit: 'kg',
      quantity: 100,
      costPerUnit: 10,
      minimumStock: 20,
    },
  ])),
}))

jest.mock('@/lib/api/production', () => ({
  productionAPI: {
    getAll: jest.fn(() => Promise.resolve({
      data: {
        data: [
          {
            _id: '1',
            recipe: { name: 'Test Recipe' },
            batchQuantity: 50,
            estimatedOutput: 100,
            wastage: 5,
            status: 'ongoing',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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

describe('Production Page', () => {
  test('renders production page without crashing', async () => {
    render(<Production />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })
  })

  test('displays recipe management content', async () => {
    render(<Production />)
    await waitFor(() => {
      const recipeElements = screen.queryAllByText(/recipe/i)
      expect(recipeElements.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  test('displays recipe information from context', async () => {
    const { container } = render(<Production />)
    await waitFor(() => {
      expect(container.textContent).toContain('Recipe')
    }, { timeout: 3000 })
  })

  test('displays production batches section', async () => {
    render(<Production />)
    await waitFor(() => {
      const batchElements = screen.queryAllByText(/batch/i)
      expect(batchElements.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  test('shows loading state initially', () => {
    const { container } = render(<Production />)
    expect(container.querySelector('[class*="animate"]')).toBeInTheDocument()
  })
})
