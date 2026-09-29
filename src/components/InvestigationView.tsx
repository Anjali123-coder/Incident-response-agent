import React, { useState } from 'react';
import { Incident, ResponseAction } from '../types.ts';
import { 
  AlertTriangle, 
  BrainCircuit, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  RotateCcw,
  Check,
  Cpu,
  Info,
  ChevronDown,
  Terminal,
  FileText
} from 'lucide-react';

interface InvestigationViewProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
  onAnalyzeIncident: (id: string) => Promise<void>;
  isAnalyzing: boolean;
  onOpenSimulation: (incident: Incident, action: ResponseAction) => void;
  onResolveIncident: (id: string) => Promise<void>;
  onNavigateToTab: (tab: any) => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onAnalyzeIncident,
  isAnalyzing,
  onOpenSimulation,
  onResolveIncident,
  onNavigateToTab
}) => {
  const [analysisStepIndex, setAnalysisStepIndex] = useState<number>(8);
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'logs'>('evidence');
  const [logFilter, setLogFilter] = useState<'ALL' | 'ERROR' | 'WARN'>('ALL');
  const [showMemoryComparison, setShowMemoryComparison] = useState<boolean>(true);

  const incident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  if (!incident) {
    return (
      <div className="p-8 text-center text-slate-400">
        No incident selected.
      </div>
    );
  }

  const handleRunAnalysis = async () => {
    // Animate through agent steps smoothly
    setAnalysisStepIndex(0);
    const interval = setInterval(() => {
      setAnalysisStepIndex((prev) => {
        if (prev >= 7) {
          clearInterval(interval);
          return 8;
        }
        return prev + 1;
      });
    }, 450);

    try {
      await onAnalyzeIncident(incident.id);
    } finally {
      clearInterval(interval);
      setAnalysisStepIndex(8);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/50 border-rose-800/60';
      case 'HIGH':
        return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
      case 'MEDIUM':
        return 'text-blue-400 bg-blue-950/50 border-blue-800/60';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const agentSteps = [
    'INGESTING',
    'NORMALIZING',
    'EXTRACTING EVIDENCE',
    'RECALLING HINDSIGHT',
    'CORRELATING HISTORY',
    'REASONING WITH GROQ',
    'GENERATING RESPONSE PLAN',
    'READY FOR APPROVAL'
  ];

  const filteredLogs = incident.logs.filter(l => {
    if (logFilter === 'ALL') return true;
    return l.level === logFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0 pl-1">
            Incidents:
          </span>
          {incidents.map((inc) => (
            <button
              key={inc.id}
              onClick={() => onSelectIncident(inc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                inc.id === incident.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{inc.id}</span>
              {inc.hasMemoryMatch && (
                <BrainCircuit className={`w-3 h-3 ${inc.id === incident.id ? 'text-slate-950' : 'text-cyan-400'}`} />
              )}
            </button>
          ))}
        </div>

        {incident.status !== 'RESOLVED' && (
          <button
            onClick={() => onResolveIncident(incident.id)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Resolved</span>
          </button>
        )}
      </div>

      {/* 1. Incident Header */}
      <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-base font-bold text-white tracking-tight">
                {incident.id}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getSeverityBadge(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                {incident.service}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Detected: {new Date(incident.detectedAt).toLocaleTimeString()}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                incident.status === 'RESOLVED'
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                  : 'text-amber-400 bg-amber-950/40 border-amber-800/40'
              }`}>
                {incident.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {incident.title}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/50 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              <Cpu className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Incident...' : 'Analyze Incident'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
          <strong className="text-slate-400 font-medium">Impact Assessment: </strong>
          {incident.impact}
        </p>
      </div>

      {/* Agent Progress Timeline (Shows when analyzing or already investigated) */}
      {(isAnalyzing || incident.rootCauseHypotheses) && (
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-slate-900/90 shadow-lg shadow-cyan-950/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>IncidentMind Agent Pipeline</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {isAnalyzing ? 'Synthesizing Hindsight + Groq...' : 'Analysis Complete'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {agentSteps.map((step, idx) => {
              const isPast = analysisStepIndex > idx;
              const isCurrent = analysisStepIndex === idx;

              return (
                <div
                  key={step}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isPast
                      ? 'bg-cyan-950/40 border-cyan-700/60 text-cyan-300'
                      : isCurrent
                      ? 'bg-blue-950/60 border-blue-500 text-white animate-pulse'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isPast ? (
                      <Check className="w-3 h-3 text-cyan-400" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <div className="text-[10px] font-mono font-semibold tracking-tighter truncate">
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. THE MAIN DIFFERENTIATOR: "MEMORY → DECISION" HERO COMPONENT */}
      {incident.memoryInfluence && (
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    MEMORY → DECISION
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                    KEY DIFFERENTIATOR
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  How Hindsight long-term experience transformed the agent's action
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMemoryComparison(!showMemoryComparison)}
                className="px-2.5 py-1 rounded text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 hover:bg-cyan-900/60 transition-colors"
              >
                {showMemoryComparison ? 'Hide Side-by-Side' : 'Show Comparison'}
              </button>
            </div>
          </div>

          {/* Recalled Memory Match Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-cyan-900/50 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>HINDSIGHT MEMORY FOUND</span>
                <span className="text-cyan-400 font-bold">{incident.memoryInfluence.relevance}% RELEVANCE</span>
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{incident.memoryInfluence.recalledIncidentId}</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-slate-300 font-normal text-xs truncate">
                  {incident.memoryInfluence.recalledTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                "{incident.memoryInfluence.lesson}"
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-emerald-900/40 space-y-1.5">
              <div className="text-[11px] font-mono font-bold text-emerald-400">WHAT WORKED</div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {incident.memoryInfluence.whatWorked.map((w, idx) => (
                  <li key={idx} className="leading-snug">{w}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-rose-900/40 space-y-1.5">
              <div className="text-[11px] font-mono font-bold text-rose-400">WHAT FAILED</div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {incident.memoryInfluence.whatFailed.map((f, idx) => (
                  <li key={idx} className="leading-snug">{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Decision & Explanation */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/40 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>IncidentMind Decision:</span>
            </div>
            <div className="text-sm md:text-base font-semibold text-white">
              "{incident.memoryInfluence.decisionImpact}"
            </div>
            <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
              <strong className="text-cyan-400 font-mono">WHY: </strong>
              {incident.memoryInfluence.why}
            </div>
          </div>

          {/* Side by side comparison: WITHOUT ORGANIZATIONAL MEMORY vs WITH HINDSIGHT */}
          {showMemoryComparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {/* Naive / Without Memory */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-rose-950 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-rose-400">WITHOUT MEMORY</span>
                  <span className="text-[10px] text-slate-500 font-mono">Naive Baseline</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  {incident.memoryInfluence.naiveAction}
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  High risk of cold-start reconnection storms, exacerbated DB queue lockup, and extended downtime.
                </div>
              </div>

              {/* With Hindsight */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-cyan-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-cyan-400">WITH HINDSIGHT</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Experience-Informed</span>
                </div>
                <div className="text-xs font-semibold text-white">
                  {incident.memoryInfluence.memoryInformedAction}
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">
                  Targets root connection pool saturation directly. Preserves uptime and avoids restart storm.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Evidence & Telemetry Tabs */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
        <div className="flex border-b border-slate-800 px-4 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'evidence'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Current Evidence & Metrics
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            System Logs ({incident.logs.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Timeline ({incident.timeline.length})
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">P95 LATENCY</div>
                  <div className="text-lg font-bold font-mono text-amber-300 tabular-nums">
                    {incident.metrics.latencyP95}ms
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">P99 LATENCY</div>
                  <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                    {incident.metrics.latencyP99}ms
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">ERROR RATE</div>
                  <div className="text-lg font-bold font-mono text-rose-400 tabular-nums">
                    {incident.metrics.errorRate}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">CONN SATURATION</div>
                  <div className={`text-lg font-bold font-mono tabular-nums ${
                    incident.metrics.connectionSaturation > 80 ? 'text-rose-400' : 'text-slate-200'
                  }`}>
                    {incident.metrics.connectionSaturation}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">THROUGHPUT</div>
                  <div className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                    {incident.metrics.throughputRps} RPS
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">CPU UTILIZATION</div>
                  <div className="text-lg font-bold font-mono text-slate-200 tabular-nums">
                    {incident.metrics.cpuUtilization}%
                  </div>
                </div>
              </div>

              {/* Evidence Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="font-mono text-cyan-400 font-bold uppercase text-[11px]">
                    Identified Signals
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div>
                      <span className="text-slate-500 font-mono">Recent Deployment: </span>
                      {incident.currentEvidence.recentDeployment || 'None in last 6h'}
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono">Traffic Anomaly: </span>
                      {incident.currentEvidence.trafficAnomaly || 'Nominal traffic volume'}
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono">Blast Radius: </span>
                      {incident.currentEvidence.blastRadius || 'Isolated to service domain'}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="font-mono text-amber-400 font-bold uppercase text-[11px]">
                    Database & Queue Telemetry
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div>
                      <span className="text-slate-500 font-mono">State: </span>
                      {incident.currentEvidence.dbSaturation || 'Normal pool usage'}
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono">Signature: </span>
                      <code className="text-rose-300 font-mono text-[11px] block mt-0.5">
                        {incident.currentEvidence.errorSignature || 'None detected'}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {(['ALL', 'ERROR', 'WARN'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      logFilter === lvl
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs space-y-1.5 max-h-72 overflow-y-auto">
                {filteredLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                    <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                    <span className={`font-bold shrink-0 ${
                      log.level === 'ERROR' ? 'text-rose-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-slate-400 shrink-0">[{log.source}]</span>
                    <span className="text-slate-200 break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="relative pl-6 space-y-4 border-l border-slate-800 py-1">
              {incident.timeline.map((entry, idx) => (
                <div key={idx} className="relative group">
                  <span className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                    entry.type === 'agent'
                      ? 'bg-cyan-500 border-cyan-950'
                      : entry.type === 'simulation'
                      ? 'bg-indigo-500 border-indigo-950'
                      : entry.type === 'human'
                      ? 'bg-emerald-500 border-emerald-950'
                      : 'bg-slate-600 border-slate-950'
                  }`} />
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[11px]">{entry.time}</span>
                      <span className="font-mono font-bold text-white text-[11px]">{entry.stage}</span>
                    </div>
                    <p className="text-slate-300 text-xs">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. AI Investigation & Root Cause Hypotheses */}
      {incident.rootCauseHypotheses && incident.rootCauseHypotheses.length > 0 && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Root-Cause Hypotheses & Confidence
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Grounded in Hindsight historical memories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {incident.rootCauseHypotheses.map((h, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">#{idx + 1}</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {h.confidence}% CONFIDENCE
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-white">
                  {h.hypothesis}
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {h.evidence}
                </p>
                {h.pastIncidentAnchor && (
                  <div className="pt-1 text-[10px] font-mono text-indigo-400 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>Anchor: {h.pastIncidentAnchor}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Response Plan & Recommended Actions */}
      {incident.recommendedActions && incident.recommendedActions.length > 0 && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Response Plan & Safe Sandbox Execution
              </h2>
            </div>
            <span className="text-xs text-amber-400 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              SIMULATION ONLY
            </span>
          </div>

          <div className="space-y-3">
            {incident.recommendedActions.map((action) => (
              <div
                key={action.id}
                className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white font-mono">
                      {action.title}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      action.risk === 'LOW'
                        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                        : 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                    }`}>
                      {action.risk} RISK
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.2 rounded">
                      {action.confidence}% CONFIDENCE
                    </span>
                    {action.executed && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>SIMULATED</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">
                    {action.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    <div>
                      <strong className="text-slate-300">Why: </strong>{action.why}
                    </div>
                    <div>
                      <strong className="text-slate-300">Historical Support: </strong>{action.historicalSupport}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onOpenSimulation(incident, action)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-950/40 active:scale-95 whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>SIMULATE ACTION</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
