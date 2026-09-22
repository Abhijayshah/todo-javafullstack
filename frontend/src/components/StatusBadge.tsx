import React from 'react';

export type SystemStatus = 'ONLINE' | 'OFFLINE' | 'CHECKING';

interface StatusBadgeProps {
  status: SystemStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'ONLINE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          System Online
        </span>
      );
    case 'OFFLINE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          Backend Offline
        </span>
      );
    case 'CHECKING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
          Checking Health...
        </span>
      );
  }
};
