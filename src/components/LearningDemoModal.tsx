import React, { useState } from 'react';
import { Incident } from '../types.ts';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  BrainCircuit, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  Check, 
  X, 
  Layers, 
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';

interface LearningDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  onAnalyzeIncident: (id: string) => Promise<any>;
  onExecuteSimulation: (incidentId: string, actionId: string) => Promise<any>;
  onTeachIncidentMind: (incidentId: string) => Promise<any>;
}

export const LearningDemoModal: React.FC<LearningDemoModalProps> = ({
  isOpen,
  onClose,
  incidents,
  onAnalyzeIncident,
  onExecuteSimulation,
  onTeachIncidentMind
}) => {
  const [currentAct, setCurrentAct] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [act1Step, setAct1Step] = useState<'INITIAL' | 'ANALYZED' | 'SIMULATING' | 'VERIFIED' | 'LEARNED'>('INITIAL');
  const [act5Step, setAct5Step] = useState<'INITIAL' | 'SIMULATING' | 'VERIFIED'>('INITIAL');

  if (!isOpen) return null;

  // ACT 1: Incident INC-024
  const inc024 = incidents.find(i => i.id === 'INC-024') || incidents[0];
  // ACT 2: Incident INC-027
  const inc027 = incidents.find(i => i.id === 'INC-027') || incidents[1] || incidents[0];

  const handleAct1Investigate = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 600));
    setAct1Step('ANALYZED');
    setIsProcessing(false);
  };

  const handleAct1Simulate = async () => {
    setIsProcessing(true);
    setAct1Step('SIMULATING');
    await new Promise(r => setTimeout(r, 900));
    setAct1Step('VERIFIED');
    setIsProcessing(false);
  };

  const handleAct1Teach = async () => {
    setIsProcessing(true);
    try {
      await onTeachIncidentMind('INC-024');
      setAct1Step('LEARNED');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextAct = (targetAct: number) => {
    setCurrentAct(targetAct);
  };

  const handleAct5Simulate = async () => {
    setIsProcessing(true);
    setAct5Step('SIMULATING');
    await new Promise(r => setTimeout(r, 900));
    setAct5Step('VERIFIED');
    setIsProcessing(false);
  };

  const handleAct6Complete = async () => {
    setIsProcessing(true);
    try {
      await onTeachIncidentMind('INC-027');
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 md:p-8 shadow-2xl shadow-cyan-950/50 space-y-6 my-8 animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <Sparkles className="w-5 h-5 text-cyan-400 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  The Learning Journey
                </h2>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/50">
                  ACT {currentAct} OF 6
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Witness IncidentMind retain experience and adapt future decisions
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

        {/* Act Stepper Ribbon */}
        <div className="grid grid-cols-6 gap-2">
          {[
            { act: 1, title: 'First Incident (INC-024)' },
            { act: 2, title: 'New Incident (INC-027)' },
            { act: 3, title: 'Memory Recalled' },
            { act: 4, title: 'Memory → Decision' },
            { act: 5, title: 'Verified Simulation' },
            { act: 6, title: 'Organizational Memory' }
          ].map((item) => (
            <button
              key={item.act}
              onClick={() => handleNextAct(item.act)}
              className={`p-2 rounded-lg border text-left transition-all ${
                currentAct === item.act
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm'
                  : currentAct > item.act
                  ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              <div className="text-[10px] font-mono font-bold">ACT {item.act}</div>
              <div className="text-[11px] font-semibold truncate">{item.title}</div>
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* ACT 1: First Incident (INC-024 Database Latency Incident) */}
        {/* ======================================================== */}
        {currentAct === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 font-bold">INC-024 · Database Latency Incident</span>
                <span className="text-rose-400 font-mono font-semibold">CRITICAL · user-db-primary</span>
              </div>
              <p className="text-xs text-slate-300">
                P95 latency elevated to 2.8s; connection pool saturated at 96%. Checkout and user profiles stalling.
              </p>
            </div>

            {act1Step === 'INITIAL' && (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
                <BrainCircuit className="w-8 h-8 text-cyan-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Incident Detected</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  IncidentMind ingests telemetry, analyzes connection saturation, and recommends surgical PgBouncer connection tuning.
                </p>
                <button
                  onClick={handleAct1Investigate}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {isProcessing ? 'Analyzing...' : 'Investigate Incident & Recommend Action'}
                </button>
              </div>
            )}

            {act1Step === 'ANALYZED' && (
              <div className="p-5 rounded-xl border border-cyan-500/40 bg-slate-900/90 space-y-3">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  Agent Recommendation Formulated:
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white">Connection Pool Remediation & Read Traffic Shift</h4>
                  <p className="text-xs text-slate-300">
                    Shift 60% read queries to secondary replica and tune PgBouncer connection pool ceiling. Suppress naive service restart.
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAct1Simulate}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Approve & Simulate Action</span>
                  </button>
                </div>
              </div>
            )}

            {(act1Step === 'SIMULATING' || act1Step === 'VERIFIED' || act1Step === 'LEARNED') && (
              <div className="p-5 rounded-xl border border-emerald-500/40 bg-slate-900/90 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">SIMULATION VERIFIED IN SANDBOX</span>
                  <span className="text-slate-400">RESOLVED IN 28 MINS</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                    <span className="text-slate-500 block text-[10px]">CONNECTIONS</span>
                    <span className="text-rose-400 line-through">96%</span> → <span className="text-emerald-400 font-bold">61%</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                    <span className="text-slate-500 block text-[10px]">P95 LATENCY</span>
                    <span className="text-amber-400 line-through">2.8s</span> → <span className="text-emerald-400 font-bold">0.9s</span>
                  </div>
                </div>

                {act1Step !== 'LEARNED' ? (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleAct1Teach}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-bold text-xs"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>TEACH INCIDENTMIND (Retain to Hindsight)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span>MEMORY CREATED & RETAINED IN HINDSIGHT</span>
                    </div>
                    <button
                      onClick={() => handleNextAct(2)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      <span>Proceed to Act 2</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ACT 2: New Incident (INC-027 API Latency Regression) */}
        {/* ======================================================== */}
        {currentAct === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-slate-900 border border-rose-950 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-rose-400 font-bold">NEW INCIDENT TRIGGERED: INC-027</span>
                <span className="text-xs font-mono text-slate-400">payment-api-cluster</span>
              </div>
              <h3 className="text-sm font-bold text-white">API Latency Regression</h3>
              <p className="text-xs text-slate-300">
                Payment API latency spiked to 3.2s. Downstream database connection saturation climbing to 94%. Gateway throwing 504 errors.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-cyan-500/40 bg-slate-900/90 text-center space-y-3">
              <Activity className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Recalling Organizational Memory from Hindsight...
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                IncidentMind triggers TEMPR multi-strategy query against Hindsight Cloud bank to search for prior incidents with similar symptoms.
              </p>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-cyan-800/80 max-w-md mx-auto text-left space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">HINDSIGHT FOUND: INC-024</span>
                  <span className="text-cyan-300 font-bold">87% RELEVANCE</span>
                </div>
                <div className="text-xs text-white font-medium">Database Latency Incident (user-db-primary)</div>
                <div className="text-[11px] text-slate-400">Match signature: DB pool exhaustion + P95 latency spike</div>
              </div>

              <button
                onClick={() => handleNextAct(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs mx-auto"
              >
                <span>Continue to Act 3: Inspect Recalled Memory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ACT 3: "I REMEMBER THIS." Memory Card */}
        {/* ======================================================== */}
        {currentAct === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-6 rounded-2xl border-2 border-cyan-400 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BrainCircuit className="w-6 h-6 text-cyan-400 animate-pulse" />
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    "I REMEMBER THIS."
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/60 font-bold">
                  HINDSIGHT MATCH 87%
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                IncidentMind recognizes the symptom profile of <strong className="text-white">INC-027</strong> from prior experience in <strong className="text-cyan-300">INC-024</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-900/60 space-y-1">
                  <div className="font-mono font-bold text-emerald-400 text-[11px]">WHAT WORKED (INC-024)</div>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside text-[11px]">
                    <li>PgBouncer connection pool tuning</li>
                    <li>Read traffic shift to replica</li>
                    <li>Session idle transaction timeouts</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-900/60 space-y-1">
                  <div className="font-mono font-bold text-rose-400 text-[11px]">WHAT FAILED (INC-024)</div>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside text-[11px]">
                    <li>Restarting unrelated API services</li>
                    <li>Triggered connection thundering herd</li>
                    <li>Extended outage by 12 minutes</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-900/60 space-y-1">
                  <div className="font-mono font-bold text-cyan-400 text-[11px]">LEARNED INVARIANT</div>
                  <p className="text-white font-semibold text-[11px] leading-snug">
                    "Check connection saturation before broad service restart."
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleNextAct(4)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <span>See How Groq Uses This Memory (Act 4)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ACT 4: Groq Reasoning (Memory-Informed Decision) */}
        {/* ======================================================== */}
        {currentAct === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-xl border border-cyan-500/40 bg-slate-900/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Groq Memory-Informed Analysis
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/50">
                  REASONING ENGINE
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  "Recommendation changed because of historical experience."
                </div>
                <div className="text-sm font-semibold text-white">
                  "Prioritize connection saturation analysis before restarting services."
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-cyan-400 font-mono">GROQ REASONING: </strong>
                  Historical memory from INC-024 indicates that broad service restarts caused severe connection reconnection storms. Applying PgBouncer connection queue remediation and diverting 60% read traffic directly unblocks the payment workers without risking gateway outage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-rose-950/80 space-y-1">
                  <span className="text-rose-400 font-mono font-bold text-[10px]">NAIVE ACTION REJECTED</span>
                  <div className="text-slate-300 font-medium">Restart payment API and gateway pods</div>
                  <div className="text-slate-500 text-[11px]">Causes thundering herd cold-starts</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-emerald-950/80 space-y-1">
                  <span className="text-emerald-400 font-mono font-bold text-[10px]">RECOMMENDED ACTION APPROVED</span>
                  <div className="text-white font-medium">Remediate PgBouncer pool + shift read traffic</div>
                  <div className="text-emerald-400 text-[11px]">Proven resolution in INC-024</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleNextAct(5)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <span>Approve Response & Simulate (Act 5)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ACT 5: Simulation & Verification */}
        {/* ======================================================== */}
        {currentAct === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  Sandbox Execution & Metric Delta
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-700/50">
                  SIMULATION ONLY
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-slate-500 text-[10px]">CONNECTION POOL</div>
                  <div className="text-sm">
                    <span className="text-rose-400 line-through">94%</span> → <span className="text-emerald-400 font-bold">61%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-slate-500 text-[10px]">P95 LATENCY</div>
                  <div className="text-sm">
                    <span className="text-amber-400 line-through">3.2s</span> → <span className="text-emerald-400 font-bold">0.9s</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-slate-500 text-[10px]">504 ERROR RATE</div>
                  <div className="text-sm">
                    <span className="text-rose-400 line-through">14.8%</span> → <span className="text-emerald-400 font-bold">0.1%</span>
                  </div>
                </div>
              </div>

              {act5Step === 'INITIAL' && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAct5Simulate}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute Sandbox Simulation & Verify</span>
                  </button>
                </div>
              )}

              {act5Step === 'SIMULATING' && (
                <div className="p-4 rounded-lg bg-slate-950 border border-cyan-800 text-center space-y-2">
                  <Activity className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <div className="text-xs font-mono text-cyan-300">
                    Applying PgBouncer tuning parameters in sandbox...
                  </div>
                </div>
              )}

              {act5Step === 'VERIFIED' && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>VERIFICATION SUCCESSFUL · METRICS NOMINAL</span>
                  </div>
                  <button
                    onClick={() => handleNextAct(6)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs"
                  >
                    <span>Proceed to Act 6: Codify Learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ACT 6: Postmortem & Organizational Memory */}
        {/* ======================================================== */}
        {currentAct === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-6 rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-6 h-6 text-emerald-400 fill-current" />
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    INCIDENTMIND LEARNED.
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60 font-bold">
                  HINDSIGHT RETAINED
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <p className="text-sm font-semibold text-white">
                  "This incident is now part of organizational memory."
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The successful resolution of <strong className="text-white">INC-027</strong> and validation of the connection saturation invariant have been retained into Hindsight Cloud.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-700/60 text-center space-y-1">
                <div className="text-sm font-bold text-cyan-300 font-mono">
                  NEXT INCIDENT STARTS WITH THIS EXPERIENCE.
                </div>
                <p className="text-xs text-slate-400">
                  Every incident teaches the next response.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => handleNextAct(1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Demo</span>
                </button>

                <button
                  onClick={() => {
                    handleAct6Complete();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Finish & Explore IncidentMind</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
