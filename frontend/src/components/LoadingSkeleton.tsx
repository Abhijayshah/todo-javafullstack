import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 flex items-start gap-4 animate-pulse"
        >
          <div className="mt-1 h-6 w-6 rounded-lg bg-slate-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-12 rounded-full bg-slate-800" />
              <div className="h-4 w-24 rounded-full bg-slate-800" />
            </div>
            <div className="h-5 w-3/4 rounded-lg bg-slate-800" />
            <div className="h-3.5 w-1/2 rounded-lg bg-slate-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
};
