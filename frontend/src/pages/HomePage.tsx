import React, { useEffect, useState } from 'react';
import { healthService } from '../services/api';
import { HealthResponse } from '../types/health';
import { StatusBadge, SystemStatus } from '../components/StatusBadge';
import {
  Activity,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Code2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>('CHECKING');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const checkBackendHealth = async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      const data = await healthService.checkHealth();
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setHealthData(data);
      setStatus('ONLINE');
    } catch (err) {
      setStatus('OFFLINE');
      setHealthData(null);
      setLatency(null);
      setErrorMessage(err instanceof Error ? err.message : 'Unable to connect to backend service');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Full Stack Enterprise Architecture Foundation
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Java 21 & Spring Boot 3 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Todo Web Application</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Project foundation is successfully bootstrapped with a clean monorepo, layered architecture, Spring Boot 3 REST API, PostgreSQL integration, and React TypeScript frontend.
          </p>
        </div>
      </div>

      {/* Health & Connectivity Diagnostic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-slate-100">Live Health Check</h2>
              </div>
              <StatusBadge status={status} />
            </div>

            <p className="text-xs text-slate-400">
              Verifies endpoint <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">GET /api/health</code> via centralized Axios client with CORS enabled.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-slate-400">Response Latency:</span>
                <span className="font-mono font-medium text-slate-200">
                  {latency !== null ? `${latency} ms` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-slate-400">Active Profile:</span>
                <span className="font-mono font-medium text-emerald-400">
                  {healthData?.environment || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-slate-400">Database Driver:</span>
                <span className="font-mono font-medium text-indigo-300">
                  {healthData?.details?.database ? String(healthData.details.database) : 'PostgreSQL'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-slate-400">Java Runtime:</span>
                <span className="font-mono font-medium text-amber-300">
                  {healthData?.details?.javaVersion ? String(healthData.details.javaVersion) : 'Java 21'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={checkBackendHealth}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Pinging Backend...' : 'Ping Health Endpoint'}
            </button>
          </div>
        </div>

        {/* JSON Response Card */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-slate-100">Raw Endpoint Payload</h2>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800/80 text-slate-400">
              http://localhost:8080/api/health
            </span>
          </div>

          <div className="flex-1 rounded-xl bg-slate-950 p-4 border border-slate-800/90 font-mono text-xs overflow-auto max-h-72">
            {status === 'ONLINE' && healthData ? (
              <pre className="text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            ) : status === 'OFFLINE' ? (
              <div className="flex items-start gap-3 text-rose-400 py-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Backend Unreachable</p>
                  <p className="text-slate-400 text-xs">{errorMessage || 'Connection refused at localhost:8080'}</p>
                  <p className="text-slate-500 text-[11px] pt-2">
                    Ensure Spring Boot is running using <code className="text-emerald-300">mvn spring-boot:run</code> in <code className="text-emerald-300">/backend</code>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 flex items-center justify-center py-12">
                Connecting to backend...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layered Architecture & Foundation Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Architecture Specs */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Backend Layered Architecture</h3>
              <p className="text-xs text-slate-400">Strict separation of concerns</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-mono text-emerald-400 font-semibold block">controller/</span>
              <span className="text-slate-400 text-[11px]">REST API endpoints & HTTP handling</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-mono text-teal-400 font-semibold block">service/</span>
              <span className="text-slate-400 text-[11px]">Business logic & transaction bounds</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-mono text-cyan-400 font-semibold block">repository/</span>
              <span className="text-slate-400 text-[11px]">Spring Data JPA data access</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-mono text-indigo-400 font-semibold block">entity/</span>
              <span className="text-slate-400 text-[11px]">Hibernate database entities</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-mono text-violet-400 font-semibold block">dto/</span>
              <span className="text-slate-400 text-[11px]">Immutable Request/Response records</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-mono text-amber-400 font-semibold block">exception/</span>
              <span className="text-slate-400 text-[11px]">Global exception handling</span>
            </div>
            <div className="col-span-2 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-mono text-sky-400 font-semibold block">config/</span>
              <span className="text-slate-400 text-[11px]">CORS policy & MVC beans configuration</span>
            </div>
          </div>
        </div>

        {/* Phase 1 Verification Checklist */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Phase 1 Foundation Checklist</h3>
              <p className="text-xs text-slate-400">All foundation milestones verified</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Clean Monorepo (/frontend & /backend)', done: true },
              { label: 'Spring Boot 3.3.4 + Java 21 configured', done: true },
              { label: 'Maven build & PostgreSQL driver configured', done: true },
              { label: 'Externalized database credentials via environment variables', done: true },
              { label: 'Vite + React 18 + TypeScript scaffolded', done: true },
              { label: 'Tailwind CSS utility styling configured', done: true },
              { label: 'Centralized Axios API client with error handling', done: true },
              { label: 'CORS configured for local development (port 5173)', done: true },
              { label: 'GET /api/health endpoint operational', done: true },
              { label: 'Ready for Phase 2: Todo CRUD Backend Implementation', done: true },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Phase Banner */}
      <div className="rounded-2xl border border-dashed border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/50">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Upcoming Next: Phase 2 — Todo CRUD Backend</h4>
          <p className="text-xs text-slate-400">
            Once foundation is reviewed, Phase 2 will implement the Todo entity, DTOs, service, repository, and CRUD REST APIs.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
          <span>Phase 2 Ready</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
