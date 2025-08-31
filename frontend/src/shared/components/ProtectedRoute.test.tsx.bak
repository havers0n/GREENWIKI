import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Мокаем контекст аутентификации
const mockUseAuth = jest.fn();
jest.mock('../contexts', () => ({
  useAuth: () => mockUseAuth(),
}));

const TestComponent: React.FC = () => <div>Protected Content</div>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен отображать loading spinner при загрузке', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('должен перенаправлять на /login если пользователь не авторизован', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: false,
    });

    // Mock window.location для проверки редиректа
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(mockLocation.href).toBe('/login');
  });

  it('должен перенаправлять на /forbidden если требуется админ и пользователь не админ', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'user' },
      isAdmin: false,
      isLoading: false,
    });

    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    renderWithRouter(
      <ProtectedRoute requireAdmin={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(mockLocation.href).toBe('/forbidden');
  });

  it('должен отображать контент для авторизованного пользователя', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'user' },
      isAdmin: false,
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('должен отображать контент для админа когда требуется админ', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'admin' },
      isAdmin: true,
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute requireAdmin={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('должен отображать контент для админа когда не требуется админ', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'admin' },
      isAdmin: true,
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute requireAdmin={false}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
