import { render, screen, waitFor } from '@testing-library/react'
import Reports from '@/app/pages/Reports/page'
import { mockAppContextValue } from '../utils/test-utils'

// Mock recharts
jest.mock('recharts', () => ({
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Cell: () => null,
}))

// Mock API dependencies
jest.mock('@/lib/api/reports', () => ({
  reportsApi: {
    getSnapshot: jest.fn(() => Promise.resolve({
      materials: [
        {
          id: '1',
          name: 'Test Material',
          unit: 'kg',
          quantity: 100,
          costPerUnit: 10,
          minimumStock: 20,
        },
      ],
    })),
  },
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

jest.mock('@/app/dashboard/_components/StatCard', () => ({
  StatCard: ({ title, value }: { title: string; value: number }) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}))

jest.mock('@/app/context/AppContext', () => ({
  useApp: () => ({
    ...mockAppContextValue,
    batches: [
      {
        id: '1',
        recipeId: '1',
        recipeName: 'Test Recipe',
        quantity: 100,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        estimatedOutput: 100,
        wastage: 5,
      },
    ],
    stockLogs: [],
  }),
}))

describe('Reports Page', () => {
  test('renders reports page without crashing', () => {
    render(<Reports />)
    expect(screen.getByText(/Reports/i)).toBeInTheDocument()
  })

  test('displays analytics and insights subtitle', () => {
    render(<Reports />)
    expect(screen.getByText(/analytics/i)).toBeInTheDocument()
  })

  test('displays stat cards for key metrics', () => {
    render(<Reports />)
    const statCards = screen.getAllByTestId('stat-card')
    expect(statCards.length).toBeGreaterThan(0)
  })

  test('renders charts for data visualization', () => {
    render(<Reports />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  test('displays production metrics', () => {
    render(<Reports />)
    const productionElements = screen.getAllByText(/Production/i)
    expect(productionElements.length).toBeGreaterThan(0)
  })
})
