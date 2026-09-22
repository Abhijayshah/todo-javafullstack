import React from 'react';
import { Todo, Priority } from '../types/todo';
import { Calendar, Check, Clock, Edit3, Eye, Trash2 } from 'lucide-react';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (id: number) => void;
  onViewDetails: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  isToggling?: boolean;
}

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Medium
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Low
        </span>
      );
  }
};

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onToggleComplete,
  onViewDetails,
  onEdit,
  onDelete,
  isToggling = false,
}) => {
  const isOverdue =
    todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 p-5 ${
        todo.completed
          ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-emerald-500/5'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox Toggle */}
        <button
          type="button"
          onClick={() => onToggleComplete(todo.id)}
          disabled={isToggling}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          className={`mt-1 flex-shrink-0 h-6 w-6 rounded-lg border flex items-center justify-center transition-all duration-200 ${
            todo.completed
              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
              : 'border-slate-600 hover:border-emerald-400 bg-slate-950/60 text-transparent hover:text-emerald-400/40'
          } ${isToggling ? 'opacity-50 animate-pulse' : ''}`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {getPriorityBadge(todo.priority)}

            {todo.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  isOverdue
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {todo.dueDate} {isOverdue ? '(Overdue)' : ''}
              </span>
            )}

            {todo.completed && (
              <span className="text-[11px] font-medium text-emerald-400/90 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Done
              </span>
            )}
          </div>

          <h3
            onClick={() => onViewDetails(todo)}
            className={`text-base font-semibold text-slate-100 cursor-pointer hover:text-emerald-300 transition-colors leading-snug line-clamp-1 ${
              todo.completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {todo.title}
          </h3>

          {todo.description && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            type="button"
            onClick={() => onViewDetails(todo)}
            title="View Details"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(todo)}
            title="Edit Task"
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo)}
            title="Delete Task"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
