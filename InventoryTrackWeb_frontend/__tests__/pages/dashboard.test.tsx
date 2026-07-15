import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '@/app/pages/dashboard/page'
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

jest.mock('@/app/dashboard/_components/StatCard', () => ({
  StatCard: ({ title, value }: { title: string; value: number }) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}))

jest.mock('@/app/context/AppContext', () => ({
  useApp: () => mockAppContextValue,
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Dashboard Page', () => {
  test('renders dashboard without crashing', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  test('displays correct welcome message', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText("Welcome back! Here's your production overview.")).toBeInTheDocument()
    })
  })

  test('renders stat cards for materials, alerts, and value', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      const statCards = screen.getAllByTestId('stat-card')
      expect(statCards.length).toBeGreaterThanOrEqual(3)
    })
  })

  test('displays total materials stat card', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Total Materials')).toBeInTheDocument()
    })
  })

  test('calculates and displays inventory value', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      const inventoryValue = screen.getByText('Inventory Value')
      expect(inventoryValue).toBeInTheDocument()
    })
  })
})
