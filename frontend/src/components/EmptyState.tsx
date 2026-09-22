import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center flex flex-col items-center justify-center space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <ClipboardList className="w-8 h-8" />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-bold text-slate-200">No tasks found</h3>
        <p className="text-xs text-slate-400">
          Your workspace is clean! Get started by creating your first task or changing active filters.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreateClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>Create First Task</span>
      </button>
    </div>
  );
};
