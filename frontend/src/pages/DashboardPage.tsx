import React, { useEffect, useState, useCallback } from 'react';
import { Todo, TodoRequest, Priority, PageResponse } from '../types/todo';
import { todoService } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { DashboardStats } from '../components/DashboardStats';
import { TodoCard } from '../components/TodoCard';
import { TodoModal } from '../components/TodoModal';
import { TodoDetailsModal } from '../components/TodoDetailsModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

type FilterTab = 'ALL' | 'PENDING' | 'COMPLETED';

export const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<Todo>>({
    content: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<FilterTab>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [detailTodoId, setDetailTodoId] = useState<number | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

  // Toggling state tracker
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Are any non-default filters active?
  const isFiltered =
    searchQuery.trim() !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    sortBy !== 'createdAt' ||
    sortDirection !== 'desc';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('createdAt');
    setSortDirection('desc');
    setPage(0);
  };

  const fetchTodos = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const data = await todoService.getAll({
          search: debouncedSearch.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          priority: priorityFilter !== 'ALL' ? (priorityFilter as Priority) : undefined,
          page,
          size: pageSize,
          sortBy,
          sortDirection,
        });

        setPageInfo(data);
        setTodos(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks from server');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, statusFilter, priorityFilter, page, pageSize, sortBy, sortDirection]
  );

  // Reset page to 0 when search, filters, or sorting change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter, priorityFilter, sortBy, sortDirection, pageSize]);

  // Fetch whenever params change
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // CRUD Handlers
  const handleCreateTodo = async (request: TodoRequest) => {
    const newTodo = await todoService.create(request);
    showToast(`Task "${newTodo.title}" created successfully`);
    fetchTodos(true);
  };

  const handleUpdateTodo = async (request: TodoRequest) => {
    if (!editingTodo) return;
    const updated = await todoService.update(editingTodo.id, request);
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Task updated successfully');
  };

  const handleToggleComplete = async (id: number) => {
    setTogglingId(id);
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const updated = await todoService.toggleComplete(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      // Background refetch to update counters if filtered
      fetchTodos(true);
    } catch (err) {
      // Revert optimistic update on failure
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
      showToast(err instanceof Error ? err.message : 'Failed to toggle status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    await todoService.delete(id);
    showToast('Task deleted successfully');
    fetchTodos(true);
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-2xl shadow-emerald-500/30 flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Task Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Server-side dynamic search, multi-field filtering, sorting & pagination
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTodos(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary */}
      <DashboardStats todos={todos} />

      {/* Controls Container: Search, Status, Priority, Sorting */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 shadow-lg">
        {/* Row 1: Search Bar & Status Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Debounced Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or description (debounced)..."
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-medium self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-1.5 rounded-xl transition ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-1.5 rounded-xl transition ${
                statusFilter === 'PENDING'
                  ? 'bg-slate-800 text-amber-300 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-4 py-1.5 rounded-xl transition ${
                statusFilter === 'COMPLETED'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Row 2: Priority, Sort By, Sort Direction & Clear Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-semibold">Priority:</span>
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500 cursor-pointer appearance-none transition"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
                <Filter className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Sort By Field */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500 cursor-pointer transition"
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title (Alphabetical)</option>
              </select>
            </div>

            {/* Sort Direction Toggle */}
            <button
              type="button"
              onClick={toggleSortDirection}
              title="Toggle Sort Direction"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>
          </div>

          {/* Right side: Items per page & Clear Filters */}
          <div className="flex items-center gap-3">
            {/* Page Size */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Todo List */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="rounded-3xl bg-rose-500/10 border border-rose-500/20 p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">Unable to load tasks</h3>
              <p className="text-xs text-rose-300/80">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchTodos()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Try Again
            </button>
          </div>
        ) : todos.length === 0 ? (
          <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {todos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={handleToggleComplete}
                  onViewDetails={(t) => setDetailTodoId(t.id)}
                  onEdit={(t) => setEditingTodo(t)}
                  onDelete={(t) => setDeletingTodo(t)}
                  isToggling={togglingId === todo.id}
                />
              ))}
            </div>

            {/* Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
              <div>
                <span>
                  Showing{' '}
                  <span className="font-semibold text-slate-200">
                    {pageInfo.totalElements > 0 ? pageInfo.pageNumber * pageInfo.pageSize + 1 : 0}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-200">
                    {Math.min((pageInfo.pageNumber + 1) * pageInfo.pageSize, pageInfo.totalElements)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-emerald-400">{pageInfo.totalElements}</span>{' '}
                  tasks
                </span>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={pageInfo.first || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 font-semibold">
                  Page {pageInfo.pageNumber + 1} of {Math.max(1, pageInfo.totalPages)}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={pageInfo.last || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TodoModal
        isOpen={isCreateModalOpen}
        mode="create"
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTodo}
      />

      <TodoModal
        isOpen={editingTodo !== null}
        mode="edit"
        initialData={editingTodo}
        onClose={() => setEditingTodo(null)}
        onSubmit={handleUpdateTodo}
      />

      <TodoDetailsModal
        todoId={detailTodoId}
        isOpen={detailTodoId !== null}
        onClose={() => setDetailTodoId(null)}
        onEdit={(t) => setEditingTodo(t)}
        onDelete={(t) => setDeletingTodo(t)}
        onToggleComplete={handleToggleComplete}
      />

      <DeleteConfirmModal
        todo={deletingTodo}
        isOpen={deletingTodo !== null}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
