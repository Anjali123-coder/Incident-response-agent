import React, { useState } from 'react';
import { OrganizationalMemory, MemoryCategory } from '../types.ts';
import { 
  BrainCircuit, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Tag, 
  Clock, 
  Sparkles,
  ArrowRight,
  Database,
  Info
} from 'lucide-react';

interface OrganizationalMemoryViewProps {
  memories: OrganizationalMemory[];
  onSearchRecall: (query: string) => Promise<any>;
}

export const OrganizationalMemoryView: React.FC<OrganizationalMemoryViewProps> = ({
  memories,
  onSearchRecall
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<OrganizationalMemory | null>(memories[0] || null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [customResults, setCustomResults] = useState<OrganizationalMemory[] | null>(null);

  const categories: Array<{ id: string; label: string; count: number }> = [
    { id: 'ALL', label: 'All Knowledge', count: memories.length },
    { id: 'LESSON', label: 'Lessons Learned', count: memories.filter(m => m.type === 'LESSON').length },
    { id: 'SUCCESSFUL_RESPONSE', label: 'Successful Responses', count: memories.filter(m => m.type === 'SUCCESSFUL_RESPONSE').length },
    { id: 'FAILED_RESPONSE', label: 'Failed Responses', count: memories.filter(m => m.type === 'FAILED_RESPONSE').length },
    { id: 'POSTMORTEM', label: 'Postmortems', count: memories.filter(m => m.type === 'POSTMORTEM').length },
    { id: 'RUNBOOK', label: 'Runbooks', count: memories.filter(m => m.type === 'RUNBOOK').length }
  ];

  const handleLiveQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setCustomResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const resp = await onSearchRecall(searchQuery);
      if (resp && Array.isArray(resp.memories)) {
        setCustomResults(resp.memories);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const displayedMemories = customResults !== null
    ? customResults
    : memories.filter(m => {
        if (selectedCategory !== 'ALL' && m.type !== selectedCategory) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.lesson.toLowerCase().includes(q) ||
          m.service.toLowerCase().includes(q) ||
          m.incidentId.toLowerCase().includes(q) ||
          m.outcome.toLowerCase().includes(q)
        );
      });

  const getCategoryBadge = (type: MemoryCategory) => {
    switch (type) {
      case 'SUCCESSFUL_RESPONSE':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'FAILED_RESPONSE':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      case 'LESSON':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40';
      case 'POSTMORTEM':
        return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40';
      case 'RUNBOOK':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Organizational Memory Bank
            </h1>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              HINDSIGHT CLOUD
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Persistent long-term agent memory: past outcomes, lessons learned, and failure anti-patterns
          </p>
        </div>

        {/* Live Search Form */}
        <form onSubmit={handleLiveQuery} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Query Hindsight memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64 md:w-80"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shrink-0 disabled:opacity-50"
          >
            {isSearching ? 'Recalling...' : 'Recall'}
          </button>
        </form>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCustomResults(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{cat.label}</span>
            <span className="text-[10px] font-mono opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Main Split: Memory List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Memories Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {displayedMemories.length === 0 ? (
            <div className="p-12 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-slate-400 text-xs">
              No matching memories found for this query in the memory bank.
            </div>
          ) : (
            <div className="space-y-3">
              {displayedMemories.map((mem) => {
                const isSelected = selectedMemory?.id === mem.id;
                return (
                  <div
                    key={mem.id}
                    onClick={() => setSelectedMemory(mem)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getCategoryBadge(mem.type)}`}>
                          {mem.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {mem.incidentId}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {mem.service}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {mem.relevance && (
                          <span className="text-[10px] font-mono text-cyan-400">
                            {mem.relevance}% RELEVANCE
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {mem.source === 'hindsight' ? 'HINDSIGHT CLOUD' : 'CACHED DEMO RESULT'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                      "{mem.lesson}"
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      <strong className="text-slate-300">Outcome: </strong>
                      {mem.outcome}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detail Inspector Panel (1 col) */}
        <div className="space-y-4">
          {selectedMemory ? (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Memory Document Inspection
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getCategoryBadge(selectedMemory.type)}`}>
                  {selectedMemory.type}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">INCIDENT & SERVICE</div>
                  <div className="font-mono font-bold text-white text-sm">
                    {selectedMemory.incidentId} · {selectedMemory.service}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-mono">EXTRACTED LESSON</div>
                  <p className="text-sm font-semibold text-cyan-200 mt-0.5">
                    "{selectedMemory.lesson}"
                  </p>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-mono">HISTORICAL OUTCOME</div>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {selectedMemory.outcome}
                  </p>
                </div>

                {selectedMemory.details && (
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono">CONTEXT & RUNBOOK TRACE</div>
                    <p className="text-slate-400 mt-0.5 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                      {selectedMemory.details}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-500">
                  <div className="flex justify-between">
                    <span>Memory ID:</span>
                    <span className="text-slate-300">{selectedMemory.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Engine:</span>
                    <span className="text-cyan-400">Hindsight Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deduplication Status:</span>
                    <span className="text-emerald-400">Verified Unique</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-slate-500 text-xs">
              Select a memory card to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
