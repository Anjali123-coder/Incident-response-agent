import React from 'react';
import { 
  LayoutDashboard, 
  SearchCode, 
  BrainCircuit, 
  GitCommitHorizontal, 
  ShieldAlert, 
  FileText, 
  BarChart3,
  Layers,
  ChevronRight
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'investigations' 
  | 'memory' 
  | 'learning-loop' 
  | 'response-center' 
  | 'postmortems' 
  | 'analytics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeIncidentsCount: number;
  memoryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeIncidentsCount,
  memoryCount
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'investigations', 
      label: 'Investigations', 
      icon: SearchCode, 
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    { 
      id: 'memory', 
      label: 'Organizational Memory', 
      icon: BrainCircuit,
      badge: memoryCount > 0 ? memoryCount : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
    },
    { id: 'learning-loop', label: 'Learning Loop', icon: GitCommitHorizontal },
    { id: 'response-center', label: 'Response Center', icon: ShieldAlert },
    { id: 'postmortems', label: 'Postmortems', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/70 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3.5 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
          Platform Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-slate-900 border border-slate-700/80 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Architectural Info */}
      <div className="p-4 border-t border-slate-900 space-y-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Hindsight + Groq</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Long-term organizational memory with fast multi-strategy recall and reasoning.
          </p>
        </div>

        <div className="px-1 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>v3.0.0-hackhyd</span>
          <span>SQLite Store</span>
        </div>
      </div>
    </aside>
  );
};
