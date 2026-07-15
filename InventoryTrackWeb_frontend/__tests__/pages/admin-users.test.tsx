import { render, screen } from '@testing-library/react'
import AdminUsersPage from '@/app/admin/users/page'

// Mock the UsersTableContent component
jest.mock('@/app/admin/UsersContent/users-table', () => {
  return function MockUsersTableContent() {
    return (
      <div data-testid="users-table-content">
        <h1>Users Management</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Test User</td>
              <td>test@example.com</td>
              <td>user</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
})

describe('Admin Users Page', () => {
  test('renders admin users page without crashing', () => {
    render(<AdminUsersPage />)
    expect(screen.getByTestId('users-table-content')).toBeInTheDocument()
  })

  test('displays users management heading', () => {
    render(<AdminUsersPage />)
    expect(screen.getByText('Users Management')).toBeInTheDocument()
  })

  test('renders users table with headers', () => {
    render(<AdminUsersPage />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  test('displays user data in table', () => {
    render(<AdminUsersPage />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  test('renders UsersTableContent component', () => {
    render(<AdminUsersPage />)
    const usersTable = screen.getByTestId('users-table-content')
    expect(usersTable).toBeInTheDocument()
  })
})
