import React from 'react';
import { SystemHealth } from '../types.ts';
import { Play, RotateCcw, ShieldCheck, Activity, Cpu, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TopBarProps {
  health: SystemHealth | null;
  onLaunchDemo: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  health,
  onLaunchDemo,
  onResetDemo,
  isResetting
}) => {
  const isHindsightConnected = health?.hindsight.connected ?? false;
  const isGroqConnected = health?.groq.connected ?? false;
  const isSystemOperational = health?.status === 'OPERATIONAL';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand Zone */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/40 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/40">
          <span className="font-mono font-black text-cyan-400 text-sm tracking-tighter">IM</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">IncidentMind</span>
            <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">Response Intelligence</span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Every incident teaches the next response.</p>
        </div>
      </div>

      {/* Center Live System Statuses */}
      <div className="hidden lg:flex items-center gap-2.5">
        {/* System Health */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-xs">
          <span className={`w-2 h-2 rounded-full ${isSystemOperational ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'}`} />
          <span className="text-slate-300 font-medium text-[11px]">
            {isSystemOperational ? 'SYSTEM OPERATIONAL' : 'SYSTEM DEGRADED'}
          </span>
        </div>

        {/* Hindsight Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-xs" title={health?.hindsight.message}>
          <Activity className={`w-3.5 h-3.5 ${isHindsightConnected ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className="text-slate-300 font-medium text-[11px]">
            {isHindsightConnected ? 'HINDSIGHT CONNECTED' : 'HINDSIGHT CACHED BANK'}
          </span>
        </div>

        {/* Groq Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-xs" title={health?.groq.message}>
          <Cpu className={`w-3.5 h-3.5 ${isGroqConnected ? 'text-indigo-400' : 'text-slate-400'}`} />
          <span className="text-slate-300 font-medium text-[11px]">
            {isGroqConnected ? `GROQ CONNECTED` : 'GROQ REASONING ENGINE'}
          </span>
        </div>

        {/* Simulation Only Mode */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/30 border border-amber-800/40 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300 font-medium text-[11px]">SIMULATION ONLY</span>
        </div>
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Reset simulated environment to initial state"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        <button
          onClick={onLaunchDemo}
          className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/60 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current group-hover:rotate-12 transition-transform" />
          <span>LAUNCH LEARNING DEMO</span>
        </button>
      </div>
    </header>
  );
};
