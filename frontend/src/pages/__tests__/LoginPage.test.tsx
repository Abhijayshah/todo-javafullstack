import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import * as AuthContextModule from '../../context/AuthContext';

describe('LoginPage Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders login form and demo accounts', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('populates fields when clicking John Doe demo account', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const demoJohnBtn = screen.getByRole('button', { name: /John Doe/i });
    fireEvent.click(demoJohnBtn);

    expect(screen.getByPlaceholderText('name@example.com')).toHaveValue('john@todo.com');
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('password123');
  });

  it('populates fields when clicking Administrator demo account', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const demoAdminBtn = screen.getByRole('button', { name: /Administrator/i });
    fireEvent.click(demoAdminBtn);

    expect(screen.getByPlaceholderText('name@example.com')).toHaveValue('admin@todo.com');
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('admin123');
  });

  it('displays validation error if submitted without email or password', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const form = screen.getByRole('button', { name: /Sign In/i }).closest('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText(/Please fill in both email and password/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with credentials and redirects on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Dashboard Landed</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'john@todo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'john@todo.com',
        password: 'password123',
      });
      expect(screen.getByText('Dashboard Landed')).toBeInTheDocument();
    });
  });

  it('displays error alert when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'john@todo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
