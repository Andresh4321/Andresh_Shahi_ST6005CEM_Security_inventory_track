# Testing Documentation for BusinessTrack Web Application

## Overview
This document provides comprehensive information about the testing infrastructure for the BusinessTrack web application. The test suite uses Jest and React Testing Library following industry best practices.

## Test Structure

### Directory Organization
```
BusinessTrackWeb/
├── __tests__/
│   ├── pages/              # Page component tests
│   │   ├── login.test.tsx
│   │   ├── register.test.tsx
│   │   ├── admin-login.test.tsx
│   │   ├── forgot-password.test.tsx
│   │   ├── landing.test.tsx
│   │   ├── dashboard.test.tsx
│   │   ├── materials.test.tsx
│   │   ├── production.test.tsx
│   │   ├── billofmaterials.test.tsx
│   │   ├── suppliers.test.tsx
│   │   ├── lowstockalerts.test.tsx
│   │   ├── stockmanagement.test.tsx
│   │   ├── reports.test.tsx
│   │   ├── settings.test.tsx
│   │   └── admin-users.test.tsx
│   ├── utils/              # Test utilities
│   │   └── test-utils.tsx
│   └── __mocks__/          # Mock implementations
│       └── AppContext.tsx
├── jest.config.js          # Jest configuration
└── jest.setup.js           # Test setup and global mocks
```

## Test Coverage

### Pages Tested
Each page has 5 comprehensive tests covering:

1. **Authentication Pages**
   - Login Page (5 tests)
   - Register Page (5 tests)
   - Admin Login Page (5 tests)
   - Forgot Password Page (5 tests)

2. **Public Pages**
   - Landing Page (5 tests)

3. **Dashboard & Management Pages**
   - Dashboard Page (5 tests)
   - Materials Page (5 tests)
   - Production Page (5 tests)
   - Bill of Materials Page (5 tests)
   - Suppliers Page (5 tests)
   - Low Stock Alerts Page (5 tests)
   - Stock Management Page (5 tests)
   - Reports Page (5 tests)
   - Settings Page (5 tests)

4. **Admin Pages**
   - Admin Users Page (5 tests)

**Total: 15 pages × 5 tests = 75 tests**

## Test Categories

### 1. Rendering Tests
- Verify components render without crashing
- Check for correct text content
- Validate proper HTML structure

### 2. User Interaction Tests
- Button clicks
- Form input changes
- Dialog/modal opening
- Tab switching

### 3. Data Display Tests
- Verify data from context is displayed
- Check calculation accuracy
- Validate list rendering

### 4. Form Validation Tests
- Input field validation
- Submit functionality
- Error message display

### 5. Integration Tests
- Component interaction with context
- API mock integration
- Navigation behavior

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- login.test.tsx
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="renders"
```

## Configuration

### Jest Configuration (`jest.config.js`)
- Uses Next.js Jest configuration
- Configured for jsdom environment
- Path aliases mapped (@/ → root)
- Coverage collection from app/, components/, and lib/
- Ignores node_modules and .next directories

### Jest Setup (`jest.setup.js`)
- Imports @testing-library/jest-dom for custom matchers
- Mocks Next.js router
- Mocks window.matchMedia for responsive tests
- Mocks IntersectionObserver for animation tests

## Test Utilities

### Custom Render Function (`test-utils.tsx`)
```typescript
import { renderWithProviders } from '../utils/test-utils'

renderWithProviders(<YourComponent />)
```

### Mock Context Values
The `mockAppContextValue` provides default mock data for:
- Materials
- Recipes
- Batches
- Suppliers
- Context functions (addMaterial, updateMaterial, etc.)

## Writing New Tests

### Test Template
```typescript
import { render, screen } from '@testing-library/react'
import YourComponent from '@/app/path/to/component'

// Mock dependencies
jest.mock('@/app/context/AppContext', () => ({
  useApp: () => mockAppContextValue,
}))

describe('Your Component', () => {
  test('renders component without crashing', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  test('handles user interaction', () => {
    render(<YourComponent />)
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    // Assert expected behavior
  })
})
```

## Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow "should/does" pattern
- Be specific about what is being tested

### 2. Test Organization
- Group related tests in describe blocks
- Use beforeEach/afterEach for setup/cleanup
- Keep tests independent

### 3. Mocking
- Mock external dependencies
- Use jest.fn() for function mocks
- Mock API calls to avoid network requests

### 4. Assertions
- Use appropriate matchers from jest-dom
- Test user-visible behavior, not implementation
- Avoid testing internal state

### 5. Async Testing
- Use waitFor for async operations
- Use async/await properly
- Handle loading states

## Common Testing Patterns

### Testing Forms
```typescript
const input = screen.getByLabelText(/email/i)
fireEvent.change(input, { target: { value: 'test@example.com' } })
expect(input).toHaveValue('test@example.com')
```

### Testing Buttons
```typescript
const button = screen.getByRole('button', { name: /submit/i })
fireEvent.click(button)
expect(mockFunction).toHaveBeenCalled()
```

### Testing Lists
```typescript
const items = screen.getAllByTestId('list-item')
expect(items).toHaveLength(3)
```

### Testing API Calls
```typescript
await waitFor(() => {
  expect(mockApiFunction).toHaveBeenCalledWith(expectedData)
})
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check path aliases in jest.config.js
   - Verify import statements

2. **Timeout errors**
   - Increase timeout for slow operations
   - Check for unresolved promises

3. **Mock not working**
   - Ensure mock is defined before import
   - Check mock path matches actual module

4. **Component not updating**
   - Use waitFor for async updates
   - Check if state changes are batched

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests
  run: npm test -- --ci --coverage --maxWorkers=2
```

### Pre-commit Hook
```json
"husky": {
  "hooks": {
    "pre-commit": "npm test"
  }
}
```

## Maintenance

### Updating Tests
- Update tests when component behavior changes
- Refactor tests to match refactored components
- Keep mock data synchronized with real data structures

### Adding New Tests
1. Create test file in appropriate directory
2. Import necessary utilities and mocks
3. Write descriptive test cases
4. Run tests to verify they pass
5. Check coverage to ensure adequate testing

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)

## Contact

For questions or issues with the test suite, please contact the development team or create an issue in the project repository.
