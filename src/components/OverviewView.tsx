import React from 'react';
import { Incident, SystemHealth, OrganizationalMemory, LearningEvent } from '../types.ts';
import { 
  AlertCircle, 
  CheckCircle2, 
  BrainCircuit, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  Database, 
  Cpu, 
  Activity,
  Flame,
  ArrowRight
} from 'lucide-react';

interface OverviewViewProps {
  incidents: Incident[];
  memories: OrganizationalMemory[];
  learningEvents: LearningEvent[];
  health: SystemHealth | null;
  onSelectIncident: (id: string) => void;
  onLaunchDemo: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  incidents,
  memories,
  learningEvents,
  health,
  onSelectIncident,
  onLaunchDemo,
  onNavigateToTab
}) => {
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalCount = activeIncidents.filter(i => i.severity === 'CRITICAL').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
  const memoryAssistedCount = incidents.filter(i => i.hasMemoryMatch || i.memoryInfluence).length;
  const memoryAssistedPct = Math.round((memoryAssistedCount / Math.max(1, incidents.length)) * 100);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/50';
      case 'HIGH':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
      case 'MEDIUM':
        return 'text-blue-400 bg-blue-950/40 border-blue-800/50';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'INVESTIGATING':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40 animate-pulse';
      case 'SIMULATING':
        return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40';
      default:
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Hero Demo Anchor */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-blue-950/40 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-700/50">
                HACK WITH HYD 3.0 SPOTLIGHT
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300 font-medium">Interactive Learning Demonstration</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white text-balance">
              Every incident teaches the next response.
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Watch IncidentMind resolve <strong className="text-cyan-300 font-semibold">INC-024</strong> (Database Latency), retain the verified lesson into Hindsight, and autonomously alter its response plan during <strong className="text-cyan-300 font-semibold">INC-027</strong> to prevent destructive service restarts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onLaunchDemo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>LAUNCH LEARNING DEMO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>ACTIVE INCIDENTS</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {activeIncidents.length}
          </div>
          <div className="text-[10px] text-slate-500">Live operational scope</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>CRITICAL SEVERITY</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {criticalCount}
          </div>
          <div className="text-[10px] text-slate-500">Immediate attention</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>RESOLVED TODAY</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {resolvedCount}
          </div>
          <div className="text-[10px] text-slate-500">Sandbox verified</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>MEMORY-ASSISTED</span>
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {memoryAssistedPct}%
          </div>
          <div className="text-[10px] text-slate-500">{memoryAssistedCount} incidents linked</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>LESSONS LEARNED</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            {memories.length}
          </div>
          <div className="text-[10px] text-slate-500">In Hindsight memory</div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>AVG RESPONSE TIME</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            4.2m
          </div>
          <div className="text-[10px] text-emerald-400">-58% vs naive MTTR</div>
        </div>
      </div>

      {/* Main Grid: Active Incidents + Memory Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Incidents (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white tracking-tight">Active Incidents</h2>
              <span className="text-xs font-mono text-slate-400">({activeIncidents.length} active)</span>
            </div>
            <button
              onClick={() => onNavigateToTab('investigations')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Open Investigation Console</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 overflow-hidden divide-y divide-slate-800/70">
            {activeIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className="p-4 hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {inc.id}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{inc.service}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getStatusBadge(inc.status)}`}>
                      {inc.status}
                    </span>
                    {inc.hasMemoryMatch && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <BrainCircuit className="w-2.5 h-2.5" />
                        <span>MEMORY MATCH</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white">
                    {inc.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {inc.impact}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="text-right">
                    <div className="text-[11px] font-mono text-slate-400">
                      P95: <span className="text-amber-300 font-semibold">{inc.metrics.latencyP95}ms</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Conn: {inc.metrics.connectionSaturation}%
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Investigate</span>
                    <ChevronRightSmall />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Memory Impact & Recent Activity (1 col) */}
        <div className="space-y-5">
          {/* Memory Impact Showcase */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 p-4 space-y-3 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Memory Impact Showcase
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                ACTIVE LESSON
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>INC-024</span>
                <span className="text-slate-500">→</span>
                <span className="text-cyan-300">INC-027</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                "Historical memory prevented service restart. Diverted 60% read traffic and remediated connection saturation instead."
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Downtime Saved: <strong className="text-emerald-400">38 mins</strong></span>
                <span>Relevance: <strong className="text-cyan-400">87%</strong></span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('memory')}
              className="w-full py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-md font-medium transition-colors text-center"
            >
              Explore Organizational Memory Bank
            </button>
          </div>

          {/* Learning Activity Feed */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recent Learning Activity
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Real-time</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {memories.slice(0, 3).map((mem) => (
                <div key={mem.id} className="text-xs border-l-2 border-cyan-500/60 pl-2.5 py-0.5 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-cyan-400 font-semibold">{mem.incidentId}</span>
                    <span>{mem.type}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                    {mem.lesson}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Check Panel */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Infrastructure Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-300">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>State Store</span>
                </div>
                <span className="font-mono text-emerald-400 text-[11px]">SQLite (node:sqlite)</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hindsight Memory</span>
                </div>
                <span className="font-mono text-cyan-400 text-[11px]">
                  {health?.hindsight.connected ? 'Cloud Connected' : 'Cached Org Bank'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Groq AI Reasoning</span>
                </div>
                <span className="font-mono text-indigo-400 text-[11px]">
                  {health?.groq.connected ? 'Live Groq Online' : 'Verified Engine'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ChevronRightSmall() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
