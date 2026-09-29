import React, { useState, useEffect } from 'react';
import { Incident, ResponseAction } from '../types.ts';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Check, 
  ArrowRight, 
  X, 
  Play, 
  Sparkles,
  Activity,
  Layers,
  FileText
} from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  incident: Incident | null;
  action: ResponseAction | null;
  onClose: () => void;
  onExecuteSimulation: (incidentId: string, actionId: string) => Promise<any>;
  onNavigateToPostmortem: (incidentId: string) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  incident,
  action,
  onClose,
  onExecuteSimulation,
  onNavigateToPostmortem
}) => {
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const stages = [
    { title: 'ACTION APPROVED', desc: 'Operator authorized simulated sandbox execution' },
    { title: 'SIMULATION STARTED', desc: 'Targeting isolated sandbox environment replica' },
    { title: 'ACTION EXECUTED IN SANDBOX', desc: action?.description || 'Applying configuration' },
    { title: 'SYSTEM RESPONSE', desc: 'Database connection queue unblocked; locks released' },
    { title: 'METRICS IMPROVING', desc: 'P95 latency recovering towards baseline' },
    { title: 'VERIFICATION', desc: 'Simulated health check returned HTTP 200 OK' },
    { title: 'SUCCESS', desc: 'Simulated resolution verified successfully' }
  ];

  useEffect(() => {
    if (isOpen) {
      setStageIndex(0);
      setIsRunning(false);
      setIsCompleted(false);
    }
  }, [isOpen]);

  if (!isOpen || !incident || !action) return null;

  const handleStartSimulation = async () => {
    setIsRunning(true);

    // Step through the timeline sequentially
    for (let i = 0; i < stages.length; i++) {
      setStageIndex(i);
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      await onExecuteSimulation(incident.id, action.id);
      setIsCompleted(true);
    } finally {
      setIsRunning(false);
    }
  };

  const beforeMetrics = action.simulatedMetricsBefore || {
    connections: `${incident.metrics.connectionSaturation}%`,
    latency: `${(incident.metrics.latencyP95 / 1000).toFixed(1)}s`,
    errors: `${incident.metrics.errorRate}%`
  };

  const afterMetrics = action.simulatedMetricsAfter || {
    connections: '61%',
    latency: '0.9s',
    errors: '0.2%'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 shadow-2xl shadow-cyan-950/40 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Safe Sandbox Simulation
                </h2>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                  SIMULATION ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verifying remediation impact without altering live production infrastructure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Details */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-cyan-400 font-bold">{incident.id} · {action.title}</span>
            <span className="font-mono text-emerald-400">{action.risk} RISK · {action.confidence}% CONFIDENCE</span>
          </div>
          <p className="text-slate-300">{action.description}</p>
        </div>

        {/* Execution Timeline */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
            <span>Simulation Execution Progression</span>
            {isRunning && <span className="text-cyan-400 animate-pulse">Running in sandbox...</span>}
            {isCompleted && <span className="text-emerald-400">Verified Success</span>}
          </div>

          <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            {stages.map((st, idx) => {
              const isDone = isCompleted || (isRunning && stageIndex > idx);
              const isCurrent = isRunning && stageIndex === idx;

              return (
                <div key={st.title} className="flex items-center gap-3 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isCurrent
                      ? 'bg-cyan-500 text-slate-950 animate-ping'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>

                  <div className="flex-1 flex items-center justify-between">
                    <span className={`font-mono font-semibold ${isDone ? 'text-white' : isCurrent ? 'text-cyan-300' : 'text-slate-500'}`}>
                      {st.title}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">{st.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Before vs After Simulated Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SIMULATED METRICS DELTA</span>
            <span className="text-[11px] text-amber-400/80">SANDBOX ENVIRONMENT</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-mono">CONNECTION POOL</div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                <span className="text-rose-400 line-through">{beforeMetrics.connections}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400 font-bold">{afterMetrics.connections}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-mono">P95 LATENCY</div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                <span className="text-amber-400 line-through">{beforeMetrics.latency}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400 font-bold">{afterMetrics.latency}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-mono">ERROR RATE</div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                <span className="text-rose-400 line-through">{beforeMetrics.errors}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400 font-bold">{afterMetrics.errors}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          {!isCompleted ? (
            <button
              onClick={handleStartSimulation}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Executing Simulation...' : 'Execute Simulation Sandbox'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToPostmortem(incident.id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Postmortem & Teach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
