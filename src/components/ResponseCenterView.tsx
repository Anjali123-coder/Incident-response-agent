import React from 'react';
import { Incident, ResponseAction } from '../types.ts';
import { 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  BrainCircuit, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ResponseCenterViewProps {
  incidents: Incident[];
  onOpenSimulation: (incident: Incident, action: ResponseAction) => void;
  onSelectIncident: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const ResponseCenterView: React.FC<ResponseCenterViewProps> = ({
  incidents,
  onOpenSimulation,
  onSelectIncident,
  onNavigateToTab
}) => {
  // Gather all recommended actions across active incidents
  const actionsList: Array<{ incident: Incident; action: ResponseAction }> = [];
  incidents.forEach(inc => {
    (inc.recommendedActions || []).forEach(act => {
      actionsList.push({ incident: inc, action: act });
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Incident Response Command Center
            </h1>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              SIMULATION SANDBOX
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Memory-vetted operational actions ready for operator approval and safe simulation
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Total Safe Actions: <strong className="text-cyan-400">{actionsList.length}</strong>
        </div>
      </div>

      {/* Action Catalog Table / Cards */}
      <div className="space-y-3.5">
        {actionsList.length === 0 ? (
          <div className="p-12 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-slate-500 text-xs">
            No recommended actions generated yet. Open an incident in Investigations and run "Analyze Incident" to generate a response plan.
          </div>
        ) : (
          actionsList.map(({ incident, action }) => (
            <div
              key={action.id}
              className="p-5 rounded-xl border border-slate-800/90 bg-slate-900/70 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {incident.id}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="font-mono text-xs text-slate-300">
                    {incident.service}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    action.risk === 'LOW'
                      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                      : 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                  }`}>
                    {action.risk} RISK
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                    {action.confidence}% CONFIDENCE
                  </span>
                  {action.executed && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>SIMULATED</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectIncident(incident.id);
                      onNavigateToTab('investigations');
                    }}
                    className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    View Incident
                  </button>

                  <button
                    onClick={() => onOpenSimulation(incident, action)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/40 transition-colors active:scale-95 whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>SIMULATE ACTION</span>
                  </button>
                </div>
              </div>

              {/* Action Title & Rationale */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-300">
                  {action.description}
                </p>
              </div>

              {/* Grid of Why, Evidence, Historical Support */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">WHY THIS ACTION</div>
                  <p className="text-slate-300 leading-snug">{action.why}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">CURRENT EVIDENCE</div>
                  <p className="text-slate-300 leading-snug">{action.evidence}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">HISTORICAL SUPPORT (HINDSIGHT)</div>
                  <p className="text-slate-300 leading-snug">{action.historicalSupport}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
