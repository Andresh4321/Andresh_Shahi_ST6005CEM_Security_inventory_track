import React from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock AppContext Provider
export const mockAppContextValue = {
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
  recipes: [
    {
      id: '1',
      name: 'Test Recipe',
      description: 'Test Description',
      price: 50,
      ingredients: [{ materialId: '1', quantity: 5 }],
    },
  ],
  batches: [
    {
      id: '1',
      recipeId: '1',
      recipeName: 'Test Recipe',
      quantity: 10,
      status: 'ongoing',
      startedAt: new Date(),
      estimatedOutput: 100,
    },
  ],
  suppliers: [
    {
      id: '1',
      name: 'Test Supplier',
      contactNumber: '1234567890',
      email: 'test@supplier.com',
      products: ['Test Product 1', 'Test Product 2'],
      prices: {},
      isFavorite: false,
      createdAt: new Date(),
    },
  ],
  addMaterial: jest.fn(),
  updateMaterial: jest.fn(),
  deleteMaterial: jest.fn(),
  addRecipe: jest.fn(),
  deleteRecipe: jest.fn(),
  startBatch: jest.fn(),
  completeBatch: jest.fn(),
  addSupplier: jest.fn(),
  updateSupplier: jest.fn(),
  deleteSupplier: jest.fn(),
  getLowStockMaterials: jest.fn(() => []),
  getTotalInventoryValue: jest.fn(() => 1000),
}

// Mock AuthContext Provider
export const mockAuthContextValue = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: false,
}

// Custom render function with providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
