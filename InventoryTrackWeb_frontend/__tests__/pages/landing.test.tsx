import { render, screen } from '@testing-library/react'
import Home from '@/app/(public)/page'

// Mock the components
jest.mock('@/app/(public)/_components/HeroSection', () => {
  return function MockHeroSection() {
    return <section data-testid="hero-section">Hero Section</section>
  }
})

jest.mock('@/app/(public)/_components/FeaturesSection', () => {
  return function MockFeaturesSection() {
    return <section data-testid="features-section">Features Section</section>
  }
})

jest.mock('@/app/(public)/_components/HowItWorksSection', () => {
  return function MockHowItWorksSection() {
    return <section data-testid="how-it-works-section">How It Works Section</section>
  }
})

jest.mock('@/app/(public)/_components/CTASection', () => {
  return function MockCTASection() {
    return <section data-testid="cta-section">CTA Section</section>
  }
})

jest.mock('@/app/(public)/_components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>
  }
})

describe('Public Landing Page', () => {
  test('renders landing page without crashing', () => {
    render(<Home />)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  test('renders hero section', () => {
    render(<Home />)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  test('renders features section', () => {
    render(<Home />)
    expect(screen.getByTestId('features-section')).toBeInTheDocument()
  })

  test('renders how it works section', () => {
    render(<Home />)
    expect(screen.getByTestId('how-it-works-section')).toBeInTheDocument()
  })

  test('renders CTA section and footer', () => {
    render(<Home />)
    expect(screen.getByTestId('cta-section')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
