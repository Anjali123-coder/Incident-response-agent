import React, { useState } from 'react';
import { Incident, Postmortem } from '../types.ts';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  Check, 
  Clock, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Database
} from 'lucide-react';

interface PostmortemsViewProps {
  incidents: Incident[];
  onTeachIncidentMind: (incidentId: string) => Promise<any>;
  isTeaching: boolean;
  onNavigateToTab: (tab: any) => void;
}

export const PostmortemsView: React.FC<PostmortemsViewProps> = ({
  incidents,
  onTeachIncidentMind,
  isTeaching,
  onNavigateToTab
}) => {
  const eligibleIncidents = incidents.filter(i => i.postmortem || i.status === 'RESOLVED' || i.status === 'SIMULATING');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    eligibleIncidents[0]?.id || incidents[0]?.id || 'INC-024'
  );
  const [createdMemoryNotification, setCreatedMemoryNotification] = useState<{
    memoryId: string;
    lesson: string;
    source: string;
  } | null>(null);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const postmortem = selectedIncident?.postmortem;

  const handleTeach = async () => {
    if (!selectedIncident) return;
    try {
      const res = await onTeachIncidentMind(selectedIncident.id);
      setCreatedMemoryNotification({
        memoryId: res.memoryId || `hs_mem_${selectedIncident.id.toLowerCase()}`,
        lesson: res.lesson || selectedIncident.memoryInfluence?.lesson || 'Check connection saturation before broad service restart.',
        source: res.source
      });

      // Celebratory confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e: any) {
      console.error('Teach failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Postmortem & Learning Loop</h1>
          <p className="text-xs text-slate-400">
            Automated blameless postmortems grounded in simulated resolution and stored into Hindsight
          </p>
        </div>

        {/* Incident Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {incidents.slice(0, 5).map((inc) => (
            <button
              key={inc.id}
              onClick={() => {
                setSelectedIncidentId(inc.id);
                setCreatedMemoryNotification(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                inc.id === selectedIncidentId
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950/40'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850'
              }`}
            >
              <span>{inc.id}</span>
              {inc.postmortem?.retainedToMemory && (
                <span className="ml-1 text-[10px] text-emerald-300">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* "NEW ORGANIZATIONAL MEMORY CREATED" Banner */}
      {createdMemoryNotification && (
        <div className="p-4 rounded-xl border border-cyan-500/60 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/40 shadow-xl shadow-cyan-950/30 space-y-2 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase">
              <Sparkles className="w-4 h-4 text-cyan-400 fill-current animate-bounce" />
              <span>NEW ORGANIZATIONAL MEMORY CREATED & STORED</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/50">
              {createdMemoryNotification.source.toUpperCase()}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-xs font-mono text-slate-400">
              Memory ID: <strong className="text-white">{createdMemoryNotification.memoryId}</strong>
            </div>
            <p className="text-sm font-semibold text-cyan-200">
              "{createdMemoryNotification.lesson}"
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400">
              Next incident resembling {selectedIncident.id} will automatically recall this lesson.
            </span>
            <button
              onClick={() => onNavigateToTab('memory')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>View in Memory Bank</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Postmortem Document */}
      {postmortem ? (
        <div className="p-6 rounded-2xl border border-slate-800/90 bg-slate-900/70 space-y-6">
          {/* Postmortem Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs text-slate-400">{postmortem.id}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-mono text-slate-400">{new Date(postmortem.createdAt).toLocaleDateString()}</span>
                {postmortem.retainedToMemory && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>RETAINED TO HINDSIGHT</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {postmortem.title}
              </h2>
            </div>

            {/* TEACH INCIDENTMIND BUTTON */}
            <button
              onClick={handleTeach}
              disabled={isTeaching || postmortem.retainedToMemory}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 whitespace-nowrap ${
                postmortem.retainedToMemory
                  ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-cyan-950/50'
              }`}
            >
              <BrainCircuit className={`w-4 h-4 ${isTeaching ? 'animate-spin' : ''}`} />
              <span>
                {isTeaching
                  ? 'Extracting & Retaining...'
                  : postmortem.retainedToMemory
                  ? 'Retained in Organizational Memory'
                  : 'TEACH INCIDENTMIND'}
              </span>
            </button>
          </div>

          {/* Section: Impact & Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <h3 className="text-xs font-mono uppercase font-bold text-rose-400">Impact Assessment</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{postmortem.impact}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <h3 className="text-xs font-mono uppercase font-bold text-amber-400">Root Cause</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{postmortem.rootCause}</p>
            </div>
          </div>

          {/* Section: What Worked vs What Failed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-950/80 space-y-2">
              <h3 className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>What Worked (Verified in Sandbox)</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {postmortem.whatWorked.map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-950/80 space-y-2">
              <h3 className="text-xs font-mono uppercase font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>What Failed / Anti-Patterns Avoided</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {postmortem.whatFailed.map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section: Lessons Learned (The Hindsight Core) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-blue-950/20 border border-cyan-800/40 space-y-2">
            <h3 className="text-xs font-mono uppercase font-bold text-cyan-300 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lessons Learned (Retained into Hindsight)</span>
            </h3>
            <div className="space-y-1.5">
              {postmortem.lessonsLearned.map((lesson, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-white font-medium">
                  "{lesson}"
                </div>
              ))}
            </div>
          </div>

          {/* Section: Future Recommendations */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-400">Future Preventive Actions</h3>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              {postmortem.futureRecommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            Postmortem not yet generated for {selectedIncident.id}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Simulate and verify the incident response first, or trigger automated postmortem synthesis.
          </p>
          <button
            onClick={() => onTeachIncidentMind(selectedIncident.id)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Generate Postmortem & Learn
          </button>
        </div>
      )}
    </div>
  );
};
