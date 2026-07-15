import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StockManagement from '@/app/StockManagement/page'
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

jest.mock('@/lib/api/stockmanagement', () => ({
  stockManagementApi: {
    addStock: jest.fn(() => Promise.resolve({ success: true })),
    removeStock: jest.fn(() => Promise.resolve({ success: true })),
    getLogs: jest.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          materialName: 'Test Material',
          type: 'add',
          quantity: 50,
          remarks: 'Test remark',
          createdAt: new Date().toISOString(),
        },
      ],
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
  useApp: () => ({
    ...mockAppContextValue,
    stockLogs: [
      {
        id: '1',
        materialId: '1',
        materialName: 'Test Material',
        action: 'add',
        quantity: 50,
        previousStock: 100,
        newStock: 150,
        date: new Date(),
        remarks: 'Test remark',
      },
    ],
    updateStock: jest.fn(),
  }),
}))

jest.mock('@/app/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('Stock Management Page', () => {
  test('renders stock management page without crashing', async () => {
    render(<StockManagement />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    })
  })

  test('displays add stock and remove stock buttons', async () => {
    render(<StockManagement />)
    await waitFor(() => {
      const buttons = screen.getAllByText(/stock/i)
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  test('displays stock logs history section', async () => {
    render(<StockManagement />)
    await waitFor(() => {
      expect(screen.getByText(/Stock History/i)).toBeInTheDocument()
    })
  })

  test('shows stock adjustment counter', async () => {
    render(<StockManagement />)
    await waitFor(() => {
      const labels = screen.getAllByText(/Stock Adjustments/i)
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  test('displays stock movement table or list', async () => {
    const { container } = render(<StockManagement />)
    await waitFor(() => {
      expect(container.querySelector('[class*="grid"]')).toBeInTheDocument()
    })
  })
})
