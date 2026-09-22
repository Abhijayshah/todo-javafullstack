import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RegisterPage } from '../RegisterPage';
import * as AuthContextModule from '../../context/AuthContext';

describe('RegisterPage Component', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
    });
  });

  it('renders register form elements', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter password')).toBeInTheDocument();
  });

  it('displays error if passwords do not match', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Alex Rivera'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'different123' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('displays error if password is less than 6 characters', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Alex Rivera'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('submits registration data and navigates on success', async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<div>Dashboard Landed</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Alex Rivera'), { target: { value: 'Alex Rivera' } });
    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'securepassword' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'securepassword' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: 'securepassword',
      });
      expect(screen.getByText('Dashboard Landed')).toBeInTheDocument();
    });
  });

  it('displays server error on registration conflict', async () => {
    mockRegister.mockRejectedValueOnce(new Error('An account with this email address already exists.'));

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Alex Rivera'), { target: { value: 'Alex Rivera' } });
    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'securepassword' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'securepassword' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText(/An account with this email address already exists/i)).toBeInTheDocument();
  });
});
