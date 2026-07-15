import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LowStockAlerts from '@/app/LowStockAlerts/page'
import { mockAppContextValue } from '../utils/test-utils'

// Mock API dependencies
jest.mock('@/lib/api/material', () => ({
  fetchInventoryMaterials: jest.fn(() => Promise.resolve([
    {
      id: '1',
      name: 'Critical Material',
      unit: 'kg',
      quantity: 5,
      costPerUnit: 10,
      minimumStock: 20,
    },
    {
      id: '2',
      name: 'Low Material',
      unit: 'kg',
      quantity: 15,
      costPerUnit: 10,
      minimumStock: 20,
    },
    {
      id: '3',
      name: 'Normal Material',
      unit: 'kg',
      quantity: 100,
      costPerUnit: 10,
      minimumStock: 20,
    },
  ])),
}))

// Mock dependencies
jest.mock('@/app/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children, title, subtitle }: { 
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

jest.mock('@/app/context/AppContext', () => ({
  useApp: () => ({
    ...mockAppContextValue,
    materials: [
      {
        id: '1',
        name: 'Critical Material',
        unit: 'kg',
        quantity: 5,
        costPerUnit: 10,
        minimumStock: 20,
      },
      {
        id: '2',
        name: 'Low Material',
        unit: 'kg',
        quantity: 15,
        costPerUnit: 10,
        minimumStock: 20,
      },
      {
        id: '3',
        name: 'Normal Material',
        unit: 'kg',
        quantity: 100,
        costPerUnit: 10,
        minimumStock: 20,
      },
    ],
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Low Stock Alerts Page', () => {
  test('renders low stock alerts page without crashing', async () => {
    render(<LowStockAlerts />)
    await waitFor(() => {
      expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    })
  })

  test('displays correct subtitle', async () => {
    render(<LowStockAlerts />)
    await waitFor(() => {
      expect(screen.getByText('Monitor inventory levels')).toBeInTheDocument()
    })
  })

  test('displays critical stock summary card', async () => {
    render(<LowStockAlerts />)
    await waitFor(() => {
      expect(screen.getByText('Critical Stock')).toBeInTheDocument()
      expect(screen.getByText('Below 50% minimum')).toBeInTheDocument()
    })
  })

  test('displays low stock summary card', async () => {
    render(<LowStockAlerts />)
    await waitFor(() => {
      expect(screen.getByText('Low Stock')).toBeInTheDocument()
      expect(screen.getByText('At or below minimum')).toBeInTheDocument()
    })
  })

  test('categorizes materials correctly by stock level', async () => {
    render(<LowStockAlerts />)
    await waitFor(() => {
      expect(screen.getByText('Critical Material')).toBeInTheDocument()
    })
  })
})
