import '@testing-library/jest-dom'

// Suppress console errors and logs during tests
const originalError = console.error
const originalLog = console.log
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    // Suppress specific known warnings that don't affect test validity
    const message = args[0]?.toString() || ''
    if (
      message.includes('linearGradient') ||
      message.includes('<stop>') ||
      message.includes('<defs>') ||
      message.includes('Cross origin') ||
      message.includes('unrecognized in this browser') ||
      message.includes('incorrect casing') ||
      message.includes('AggregateError') ||
      message.includes('XMLHttpRequest') ||
      message.includes('not wrapped in act')
    ) {
      return
    }
    originalError.apply(console, args)
  }

  console.log = (...args) => {
    // Suppress debug logs from Suppliers page
    const message = args[0]?.toString() || ''
    if (
      message.includes('Suppliers page') ||
      message.includes('Suppliers data')
    ) {
      return
    }
    originalLog.apply(console, args)
  }

  console.warn = (...args) => {
    // Suppress React warnings during tests
    const message = args[0]?.toString() || ''
    if (
      message.includes('ReactDOM.render') ||
      message.includes('deprecated')
    ) {
      return
    }
    originalWarn.apply(console, args)
  }
})

afterAll(() => {
  console.error = originalError
  console.log = originalLog
  console.warn = originalWarn
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}
