import { mockAppContextValue } from '../utils/test-utils'

export const useApp = jest.fn(() => mockAppContextValue)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}
