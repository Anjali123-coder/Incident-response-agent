import React from 'react';
import { Incident, OrganizationalMemory } from '../types.ts';
import { 
  BarChart3, 
  TrendingDown, 
  BrainCircuit, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Flame,
  CheckCircle2
} from 'lucide-react';

interface AnalyticsViewProps {
  incidents: Incident[];
  memories: OrganizationalMemory[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  incidents,
  memories
}) => {
  const critical = incidents.filter(i => i.severity === 'CRITICAL').length;
  const high = incidents.filter(i => i.severity === 'HIGH').length;
  const medium = incidents.filter(i => i.severity === 'MEDIUM').length;
  const total = incidents.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Operational & Memory Analytics
            </h1>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              SYNTHETIC BENCHMARK DATA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Measuring the tangible MTTR reduction and prevention efficacy powered by Hindsight long-term memory
          </p>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-mono">AVG MTTR (WITH HINDSIGHT)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            18.4 mins
          </div>
          <div className="text-[11px] text-emerald-400/80 font-mono">
            ↓ 58% vs Naive MTTR (44.0 mins)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-mono">REPEATED INCIDENTS AVERTED</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            14 incidents
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Prevented by learned invariants
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-mono">MEMORY ASSISTANCE RATE</div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            87.5%
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            7 of 8 incidents matched memory
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-mono">SAVED OPERATOR DOWNTIME</div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            142 mins
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Zero thundering herd restarts
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MTTR Comparison Chart */}
        <div className="p-5 rounded-2xl border border-slate-800/90 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Resolution Time (MTTR) Comparison
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">58% FASTER RESOLUTION</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Without Memory (Naive service restart / guessing)</span>
                <span className="font-mono text-rose-400 font-bold">44.0 mins</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500/80 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>With Hindsight (Surgical connection pool tuning)</span>
                <span className="font-mono text-emerald-400 font-bold">18.4 mins</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
            By recalling INC-024 anti-pattern warnings, the agent suppressed unhelpful service restarts and immediately focused on database connection pool saturation, cutting MTTR in half.
          </p>
        </div>

        {/* Severity Distribution */}
        <div className="p-5 rounded-2xl border border-slate-800/90 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Incident Severity Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Total {total} Incidents</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-rose-950 text-center space-y-1">
              <div className="text-[10px] text-rose-400 font-mono">CRITICAL</div>
              <div className="text-xl font-bold font-mono text-white">{critical}</div>
              <div className="text-[10px] text-slate-500">{Math.round((critical/total)*100)}%</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-amber-950 text-center space-y-1">
              <div className="text-[10px] text-amber-400 font-mono">HIGH</div>
              <div className="text-xl font-bold font-mono text-white">{high}</div>
              <div className="text-[10px] text-slate-500">{Math.round((high/total)*100)}%</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-blue-950 text-center space-y-1">
              <div className="text-[10px] text-blue-400 font-mono">MEDIUM</div>
              <div className="text-xl font-bold font-mono text-white">{medium}</div>
              <div className="text-[10px] text-slate-500">{Math.round((medium/total)*100)}%</div>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div className="h-full bg-rose-500" style={{ width: `${(critical/total)*100}%` }} />
            <div className="h-full bg-amber-500" style={{ width: `${(high/total)*100}%` }} />
            <div className="h-full bg-blue-500" style={{ width: `${(medium/total)*100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
