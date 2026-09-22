import React from 'react';
import { Todo } from '../types/todo';
import { CheckCircle2, Clock, Flame, ListTodo } from 'lucide-react';

interface DashboardStatsProps {
  todos: Todo[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ todos }) => {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = todos.filter((t) => t.priority === 'HIGH' && !t.completed).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tasks */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Tasks</span>
          <div className="p-2 rounded-xl bg-slate-800 text-slate-200">
            <ListTodo className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-100">{total}</span>
          <span className="text-[11px] text-slate-500">items</span>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-amber-400">Pending</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-amber-300">{pending}</span>
          <span className="text-[11px] text-slate-500">remaining</span>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-400">Completed</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-emerald-300">{completed}</span>
          <span className="text-[11px] text-slate-500">
            {total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* High Priority Urgent Tasks */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-rose-400">High Priority</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-rose-300">{highPriority}</span>
          <span className="text-[11px] text-slate-500">urgent pending</span>
        </div>
      </div>
    </div>
  );
};
