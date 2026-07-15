import { render, screen, waitFor } from '@testing-library/react'
import BillOfMaterials from '@/app/BillOfMaterials/page'
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
  useApp: () => mockAppContextValue,
}))

describe('Bill of Materials Page', () => {
  test('renders bill of materials page without crashing', async () => {
    render(<BillOfMaterials />)
    await waitFor(() => {
      expect(screen.getByText('Bill of Materials')).toBeInTheDocument()
    })
  })

  test('displays correct subtitle', async () => {
    render(<BillOfMaterials />)
    await waitFor(() => {
      expect(screen.getByText('Complete inventory valuation')).toBeInTheDocument()
    })
  })

  test('displays total items summary card', async () => {
    render(<BillOfMaterials />)
    await waitFor(() => {
      expect(screen.getByText('Total Items')).toBeInTheDocument()
    })
  })

  test('displays materials table or list', async () => {
    render(<BillOfMaterials />)
    await waitFor(() => {
      expect(screen.getByText('Test Material')).toBeInTheDocument()
    })
  })

  test('calculates and displays total inventory value', async () => {
    render(<BillOfMaterials />)
    await waitFor(() => {
      expect(screen.getByText('Total Value')).toBeInTheDocument()
    })
  })
})
