import React, { useState } from 'react';
import { LearningEvent } from '../types.ts';
import { 
  GitCommitHorizontal, 
  BrainCircuit, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ArrowRight,
  Layers,
  Activity,
  Repeat
} from 'lucide-react';

interface LearningLoopViewProps {
  learningEvents: LearningEvent[];
  onLaunchDemo: () => void;
}

export const LearningLoopView: React.FC<LearningLoopViewProps> = ({
  learningEvents,
  onLaunchDemo
}) => {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(2);

  const stages = [
    {
      id: 'INCIDENT',
      name: '01. New Incident',
      desc: 'Telemetry anomalies detect threshold breaches (e.g. latency spike, connection pool saturation).',
      highlight: 'Symptom Ingestion'
    },
    {
      id: 'INVESTIGATE',
      name: '02. Evidence Normalization',
      desc: 'Extract stack traces, pg_stat_activity session logs, error codes, and deployment diffs.',
      highlight: 'Context Extraction'
    },
    {
      id: 'RECALL',
      name: '03. Hindsight Memory Recall',
      desc: 'TEMPR multi-strategy query against Hindsight Cloud bank to retrieve historical incidents & anti-patterns.',
      highlight: 'Found INC-024 (87% Match)'
    },
    {
      id: 'REASON',
      name: '04. Groq Reasoning Engine',
      desc: 'Synthesizes current evidence with past outcomes. Memory transforms naive instinct into surgical response.',
      highlight: 'Suppresses Naive Restarts'
    },
    {
      id: 'RESPOND',
      name: '05. Recommended Plan',
      desc: 'Generates structured response actions with historical backing, risk rating, and confidence score.',
      highlight: 'Connection Pool Tuning'
    },
    {
      id: 'VERIFY',
      name: '06. Sandbox Simulation',
      desc: 'Executes approved remediation in isolated sandbox. Verifies metric recovery before declaring success.',
      highlight: 'Latency 2.8s → 0.9s'
    },
    {
      id: 'POSTMORTEM',
      name: '07. Automated Postmortem',
      desc: 'Synthesizes blameless timeline, root-cause analysis, what worked, and what failed.',
      highlight: 'Blameless Synthesis'
    },
    {
      id: 'LEARN',
      name: '08. Lesson Distillation',
      desc: 'Extracts clear operational rules (e.g. "Check connection saturation before broad service restart").',
      highlight: 'Actionable Invariants'
    },
    {
      id: 'REMEMBER',
      name: '09. Hindsight Retain',
      desc: 'Stores the new lesson into persistent organizational memory bank for future incidents.',
      highlight: 'Next Incident Starts Smarter'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              The Cognitive Learning Loop
            </h1>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              CLOSED-LOOP AGENT
            </span>
          </div>
          <p className="text-xs text-slate-400">
            How IncidentMind turns every resolved production incident into permanent organizational intelligence
          </p>
        </div>

        <button
          onClick={onLaunchDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/40 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Launch Interactive Demo</span>
        </button>
      </div>

      {/* Visual Pipeline Progression Ribbon */}
      <div className="p-5 rounded-2xl border border-slate-800/90 bg-slate-900/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-2">
            <Repeat className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Autonomous Learning Pipeline</span>
          </span>
          <span>Click any stage to inspect cognitive transition</span>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {stages.map((stage, idx) => {
            const isSelected = activeStageIndex === idx;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageIndex(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-500 shadow-md shadow-cyan-950/60 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-cyan-400">
                  0{idx + 1}
                </div>
                <div className="text-xs font-bold text-white tracking-tight truncate">
                  {stage.id}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-1">
                  {stage.highlight}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Card */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              Cognitive Stage Details
            </span>
            <h2 className="text-base font-bold text-white">
              {stages[activeStageIndex].name}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            Stage {activeStageIndex + 1} of 9
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {stages[activeStageIndex].desc}
        </p>

        {/* Live Stage Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">MEMORY RETRIEVED</div>
            <div className="text-xs font-bold text-cyan-300 font-mono">INC-024 (Database Latency)</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">DECISION INFLUENCED</div>
            <div className="text-xs font-bold text-emerald-400 font-mono">Prioritize Pool Saturation</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">LESSON CREATED</div>
            <div className="text-xs font-bold text-white truncate font-mono">Check conn before restart</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500">MEMORY RETAINED</div>
            <div className="text-xs font-bold text-indigo-400 font-mono">Hindsight Bank Sync</div>
          </div>
        </div>
      </div>

      {/* Learning Events Telemetry Feed */}
      <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-slate-300">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Learning Loop Telemetry Events</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Persistent log stream</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {learningEvents.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No learning events recorded yet. Run an investigation or launch the learning demo to generate telemetry.
            </div>
          ) : (
            learningEvents.map((evt) => (
              <div key={evt.id} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-bold">{evt.incidentId}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                    {evt.stage}
                  </span>
                  <span className="text-slate-300 text-[11px] truncate max-w-md">
                    {evt.decisionInfluenced || evt.lessonCreated || 'Telemetry loop registered'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
