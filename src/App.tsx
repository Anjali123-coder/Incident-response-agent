/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Incident, 
  SystemHealth, 
  OrganizationalMemory, 
  LearningEvent, 
  ResponseAction 
} from './types.ts';
import { TopBar } from './components/TopBar.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { OverviewView } from './components/OverviewView.tsx';
import { InvestigationView } from './components/InvestigationView.tsx';
import { OrganizationalMemoryView } from './components/OrganizationalMemoryView.tsx';
import { LearningLoopView } from './components/LearningLoopView.tsx';
import { ResponseCenterView } from './components/ResponseCenterView.tsx';
import { PostmortemsView } from './components/PostmortemsView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { SimulationModal } from './components/SimulationModal.tsx';
import { LearningDemoModal } from './components/LearningDemoModal.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-021');
  const [memories, setMemories] = useState<OrganizationalMemory[]>([]);
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isTeaching, setIsTeaching] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Modals state
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [simulatingIncident, setSimulatingIncident] = useState<Incident | null>(null);
  const [simulatingAction, setSimulatingAction] = useState<ResponseAction | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Fetch initial applet data
  const fetchData = async () => {
    try {
      const [healthRes, incRes, memRes, learnRes] = await Promise.all([
        fetch('/api/health').then(r => r.json()),
        fetch('/api/incidents').then(r => r.json()),
        fetch('/api/memory').then(r => r.json()),
        fetch('/api/learning').then(r => r.json())
      ]);

      setHealth(healthRes);
      if (Array.isArray(incRes)) {
        setIncidents(incRes);
        if (!selectedIncidentId && incRes.length > 0) {
          setSelectedIncidentId(incRes[0].id);
        }
      }
      if (Array.isArray(memRes)) setMemories(memRes);
      if (Array.isArray(learnRes)) setLearningEvents(learnRes);
    } catch (err) {
      console.error('Data sync error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnalyzeIncident = async (incidentId: string) => {
    setIsAnalyzing(true);
    try {
      const resp = await fetch(`/api/incidents/${incidentId}/analyze`, {
        method: 'POST'
      });
      const data = await resp.json();
      if (data && data.incident) {
        setIncidents(prev => prev.map(inc => inc.id === incidentId ? data.incident : inc));
        // Refresh learning events
        fetch('/api/learning').then(r => r.json()).then(l => {
          if (Array.isArray(l)) setLearningEvents(l);
        });
      }
    } catch (e) {
      console.error('Analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecuteSimulation = async (incidentId: string, actionId: string) => {
    try {
      const resp = await fetch(`/api/incidents/${incidentId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId })
      });
      const data = await resp.json();
      if (data && data.incident) {
        setIncidents(prev => prev.map(inc => inc.id === incidentId ? data.incident : inc));
      }
      return data;
    } catch (e) {
      console.error('Simulation error:', e);
      throw e;
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const resp = await fetch(`/api/incidents/${incidentId}/resolve`, {
        method: 'POST'
      });
      const updated = await resp.json();
      if (updated && updated.id) {
        setIncidents(prev => prev.map(inc => inc.id === incidentId ? updated : inc));
      }
    } catch (e) {
      console.error('Resolve error:', e);
    }
  };

  const handleTeachIncidentMind = async (incidentId: string) => {
    setIsTeaching(true);
    try {
      const resp = await fetch(`/api/incidents/${incidentId}/learn`, {
        method: 'POST'
      });
      const result = await resp.json();

      // Refresh memory list and incidents
      const [mems, incs, learns] = await Promise.all([
        fetch('/api/memory').then(r => r.json()),
        fetch('/api/incidents').then(r => r.json()),
        fetch('/api/learning').then(r => r.json())
      ]);

      if (Array.isArray(mems)) setMemories(mems);
      if (Array.isArray(incs)) setIncidents(incs);
      if (Array.isArray(learns)) setLearningEvents(learns);

      return result;
    } catch (e) {
      console.error('Teach error:', e);
      throw e;
    } finally {
      setIsTeaching(false);
    }
  };

  const handleSearchRecall = async (query: string) => {
    try {
      const resp = await fetch('/api/memory/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      return await resp.json();
    } catch (e) {
      console.error('Recall error:', e);
      return null;
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      await fetchData();
    } catch (e) {
      console.error('Reset error:', e);
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenSimulation = (incident: Incident, action: ResponseAction) => {
    setSimulatingIncident(incident);
    setSimulatingAction(action);
    setIsSimulationOpen(true);
  };

  const handleNavigateToPostmortem = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setCurrentTab('postmortems');
  };

  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Header */}
      <TopBar
        health={health}
        onLaunchDemo={() => setIsDemoModalOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeIncidentsCount={activeIncidentsCount}
          memoryCount={memories.length}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#040814]/70">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Loading IncidentMind command center...</p>
              </div>
            ) : (
              <>
                {currentTab === 'overview' && (
                  <OverviewView
                    incidents={incidents}
                    memories={memories}
                    learningEvents={learningEvents}
                    health={health}
                    onSelectIncident={(id) => {
                      setSelectedIncidentId(id);
                      setCurrentTab('investigations');
                    }}
                    onLaunchDemo={() => setIsDemoModalOpen(true)}
                    onNavigateToTab={setCurrentTab}
                  />
                )}

                {currentTab === 'investigations' && (
                  <InvestigationView
                    incidents={incidents}
                    selectedIncidentId={selectedIncidentId}
                    onSelectIncident={setSelectedIncidentId}
                    onAnalyzeIncident={handleAnalyzeIncident}
                    isAnalyzing={isAnalyzing}
                    onOpenSimulation={handleOpenSimulation}
                    onResolveIncident={handleResolveIncident}
                    onNavigateToTab={setCurrentTab}
                  />
                )}

                {currentTab === 'memory' && (
                  <OrganizationalMemoryView
                    memories={memories}
                    onSearchRecall={handleSearchRecall}
                  />
                )}

                {currentTab === 'learning-loop' && (
                  <LearningLoopView
                    learningEvents={learningEvents}
                    onLaunchDemo={() => setIsDemoModalOpen(true)}
                  />
                )}

                {currentTab === 'response-center' && (
                  <ResponseCenterView
                    incidents={incidents}
                    onOpenSimulation={handleOpenSimulation}
                    onSelectIncident={(id) => {
                      setSelectedIncidentId(id);
                      setCurrentTab('investigations');
                    }}
                    onNavigateToTab={setCurrentTab}
                  />
                )}

                {currentTab === 'postmortems' && (
                  <PostmortemsView
                    incidents={incidents}
                    onTeachIncidentMind={handleTeachIncidentMind}
                    isTeaching={isTeaching}
                    onNavigateToTab={setCurrentTab}
                  />
                )}

                {currentTab === 'analytics' && (
                  <AnalyticsView
                    incidents={incidents}
                    memories={memories}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        incident={simulatingIncident}
        action={simulatingAction}
        onClose={() => setIsSimulationOpen(false)}
        onExecuteSimulation={handleExecuteSimulation}
        onNavigateToPostmortem={handleNavigateToPostmortem}
      />

      {/* Hero Learning Demo Modal */}
      <LearningDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        incidents={incidents}
        onAnalyzeIncident={handleAnalyzeIncident}
        onExecuteSimulation={handleExecuteSimulation}
        onTeachIncidentMind={handleTeachIncidentMind}
      />
    </div>
  );
}
