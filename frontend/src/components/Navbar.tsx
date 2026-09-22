import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  CheckSquare,
  Database,
  LayoutDashboard,
  Server,
  Terminal,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Left Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-100 tracking-tight">Todo Engine</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Full Stack
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Spring Boot 3 • Java 21 • React • PostgreSQL</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                location.pathname === '/'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/health"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                location.pathname === '/health'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>System Health</span>
            </Link>
          </nav>
        </div>

        {/* Right Section: System stats & User Profile */}
        <div className="flex items-center gap-3">
          {/* Server Badges */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 mr-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px]">
              <Server className="w-3 h-3 text-emerald-400" />
              <span>API: 8080</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px]">
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>UI: 5173</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px]">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>DB: 5432</span>
            </div>
          </div>

          {/* User Profile / Auth State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800/60 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3.5 py-1.5 rounded-xl transition shadow-sm shadow-emerald-500/20"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
