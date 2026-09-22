import React, { useEffect, useState } from 'react';
import { Todo } from '../types/todo';
import { todoService } from '../services/api';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Flag,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';

interface TodoDetailsModalProps {
  todoId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggleComplete: (id: number) => void;
}

export const TodoDetailsModal: React.FC<TodoDetailsModalProps> = ({
  todoId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (todoId && isOpen) {
      setLoading(true);
      setError(null);
      todoService
        .getById(todoId)
        .then((data) => setTodo(data))
        .catch((err) => setError(err instanceof Error ? err.message : 'Error fetching todo'))
        .finally(() => setLoading(false));
    } else {
      setTodo(null);
    }
  }, [todoId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Task #{todoId}
            </span>
            {todo && (
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  todo.completed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {todo.completed ? 'Completed' : 'Pending'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
            <span className="text-sm">Loading task details...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        ) : todo ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-100 leading-snug">{todo.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{todo.priority} Priority</span>
                </div>
                {todo.dueDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due {todo.dueDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                Description
              </span>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {todo.description || 'No description provided.'}
              </p>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 border-t border-slate-800/60 pt-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Created: {new Date(todo.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated: {new Date(todo.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onToggleComplete(todo.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(todo);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(todo);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/20 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
