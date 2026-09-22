import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../DashboardPage';
import { todoService } from '../../services/api';
import { Todo, PageResponse } from '../../types/todo';

vi.mock('../../services/api', () => ({
  todoService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    toggleComplete: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('DashboardPage Component', () => {
  const mockTodos: Todo[] = [
    {
      id: 1,
      title: 'Build Secure API',
      description: 'Using Spring Security and JWT',
      completed: false,
      priority: 'HIGH',
      dueDate: '2026-10-15',
      createdAt: '2026-09-20T10:00:00',
      updatedAt: '2026-09-20T10:00:00',
    },
    {
      id: 2,
      title: 'Write Frontend Tests',
      description: 'Using Vitest and Testing Library',
      completed: true,
      priority: 'MEDIUM',
      dueDate: '2026-10-20',
      createdAt: '2026-09-21T10:00:00',
      updatedAt: '2026-09-21T10:00:00',
    },
  ];

  const mockPageResponse: PageResponse<Todo> = {
    content: mockTodos,
    pageNumber: 0,
    pageSize: 10,
    totalElements: 2,
    totalPages: 1,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and renders todo items and stats', async () => {
    vi.mocked(todoService.getAll).mockResolvedValueOnce(mockPageResponse);

    render(<DashboardPage />);

    expect(await screen.findByText('Build Secure API')).toBeInTheDocument();
    expect(screen.getByText('Write Frontend Tests')).toBeInTheDocument();
    expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
  });

  it('renders empty state when no tasks exist', async () => {
    vi.mocked(todoService.getAll).mockResolvedValueOnce({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    });

    render(<DashboardPage />);

    expect(await screen.findByText(/No tasks found/i)).toBeInTheDocument();
  });

  it('renders error banner with retry button on fetch failure', async () => {
    vi.mocked(todoService.getAll).mockRejectedValueOnce(new Error('Network error'));

    render(<DashboardPage />);

    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('filters by status when clicking status tabs', async () => {
    vi.mocked(todoService.getAll).mockResolvedValue(mockPageResponse);

    render(<DashboardPage />);

    await screen.findByText('Build Secure API');

    const pendingTab = screen.getByRole('button', { name: 'Pending' });
    fireEvent.click(pendingTab);

    await waitFor(() => {
      expect(todoService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PENDING' })
      );
    });
  });

  it('filters by priority when selecting priority dropdown', async () => {
    vi.mocked(todoService.getAll).mockResolvedValue(mockPageResponse);

    render(<DashboardPage />);

    await screen.findByText('Build Secure API');

    const prioritySelect = screen.getByDisplayValue('All Priorities');
    fireEvent.change(prioritySelect, { target: { value: 'HIGH' } });

    await waitFor(() => {
      expect(todoService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'HIGH' })
      );
    });
  });

  it('creates a new todo successfully', async () => {
    vi.mocked(todoService.getAll).mockResolvedValue(mockPageResponse);
    vi.mocked(todoService.create).mockResolvedValueOnce({
      id: 3,
      title: 'Deploy to Kubernetes',
      description: 'Cluster manifest deployment',
      completed: false,
      priority: 'HIGH',
      dueDate: '2026-11-01',
      createdAt: '2026-09-22T10:00:00',
      updatedAt: '2026-09-22T10:00:00',
    });

    render(<DashboardPage />);

    await screen.findByText('Build Secure API');

    // Open create modal
    const newTaskBtn = screen.getByRole('button', { name: /New Task/i });
    fireEvent.click(newTaskBtn);

    // Modal is visible
    expect(screen.getByText('Create New Task')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Implement authentication/i), {
      target: { value: 'Deploy to Kubernetes' },
    });

    const submitBtn = screen.getByRole('button', { name: 'Create Task' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(todoService.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Deploy to Kubernetes' })
      );
    });
  });

  it('toggles task completion when clicking status checkbox', async () => {
    vi.mocked(todoService.getAll).mockResolvedValue(mockPageResponse);
    vi.mocked(todoService.toggleComplete).mockResolvedValueOnce({
      ...mockTodos[0],
      completed: true,
    });

    render(<DashboardPage />);

    await screen.findByText('Build Secure API');

    // Toggle button on task 1
    const toggleButtons = screen.getAllByRole('button', {
      name: /Mark as complete|Mark as incomplete/i,
    });
    fireEvent.click(toggleButtons[0]);

    await waitFor(() => {
      expect(todoService.toggleComplete).toHaveBeenCalledWith(1);
    });
  });

  it('opens delete modal and deletes todo when confirmed', async () => {
    vi.mocked(todoService.getAll).mockResolvedValue(mockPageResponse);
    vi.mocked(todoService.delete).mockResolvedValueOnce(undefined);

    render(<DashboardPage />);

    await screen.findByText('Build Secure API');

    // Click delete on task
    const deleteButtons = screen.getAllByTitle('Delete Task');
    fireEvent.click(deleteButtons[0]);

    // Modal prompt appears
    expect(screen.getByText('Confirm permanent deletion')).toBeInTheDocument();

    // Confirm deletion inside the modal (modal button is the last one with name Delete Task)
    const deleteRoleButtons = screen.getAllByRole('button', { name: 'Delete Task' });
    const modalConfirmBtn = deleteRoleButtons[deleteRoleButtons.length - 1];
    fireEvent.click(modalConfirmBtn);

    await waitFor(() => {
      expect(todoService.delete).toHaveBeenCalledWith(1);
    });
  });
});
