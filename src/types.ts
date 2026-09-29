export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'TRIGGERED' | 'INVESTIGATING' | 'REASONING' | 'REMEDIATING' | 'SIMULATING' | 'RESOLVED';

export type MemoryCategory = 
  | 'INCIDENT'
  | 'SUCCESSFUL_RESPONSE'
  | 'FAILED_RESPONSE'
  | 'POSTMORTEM'
  | 'LESSON'
  | 'RUNBOOK'
  | 'ANALYST_FEEDBACK';

export interface IncidentMetricSnapshot {
  latencyP95: number;
  latencyP99: number;
  errorRate: number;
  connectionSaturation: number;
  throughputRps: number;
  cpuUtilization: number;
}

export interface IncidentLogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  source: string;
}

export interface CurrentEvidence {
  recentDeployment?: string;
  trafficAnomaly?: string;
  dbSaturation?: string;
  errorSignature?: string;
  blastRadius?: string;
}

export interface TimelineEntry {
  time: string;
  stage: string;
  description: string;
  type: 'system' | 'agent' | 'human' | 'simulation';
}

export interface RootCauseHypothesis {
  hypothesis: string;
  confidence: number;
  evidence: string;
  pastIncidentAnchor?: string | null;
}

export interface ResponseAction {
  id: string;
  title: string;
  description: string;
  why: string;
  evidence: string;
  historicalSupport: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  approved: boolean;
  executed: boolean;
  simulatedMetricsBefore?: {
    connections: string;
    latency: string;
    errors: string;
  };
  simulatedMetricsAfter?: {
    connections: string;
    latency: string;
    errors: string;
  };
}

export interface MemoryInfluence {
  recalledIncidentId: string;
  recalledTitle: string;
  relevance: number;
  whatWorked: string[];
  whatFailed: string[];
  lesson: string;
  decisionImpact: string;
  why: string;
  naiveAction: string;
  memoryInformedAction: string;
  savedDowntimeMinutes?: number;
}

export interface Postmortem {
  id: string;
  incidentId: string;
  title: string;
  impact: string;
  rootCause: string;
  timeline: string[];
  actionsTaken: string[];
  whatWorked: string[];
  whatFailed: string[];
  lessonsLearned: string[];
  futureRecommendations: string[];
  hindsightMemoryId?: string;
  retainedToMemory: boolean;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  detectedAt: string;
  resolvedAt?: string;
  impact: string;
  symptoms: string[];
  metrics: IncidentMetricSnapshot;
  logs: IncidentLogEntry[];
  currentEvidence: CurrentEvidence;
  timeline: TimelineEntry[];
  rootCauseHypotheses?: RootCauseHypothesis[];
  recommendedActions?: ResponseAction[];
  memoryInfluence?: MemoryInfluence;
  postmortem?: Postmortem;
  hasMemoryMatch?: boolean;
}

export interface OrganizationalMemory {
  id: string;
  type: MemoryCategory;
  incidentId: string;
  service: string;
  lesson: string;
  outcome: string;
  timestamp: string;
  relevance?: number;
  details: string;
  bankId?: string;
  source: 'hindsight' | 'cached_demo';
  tags?: string[];
}

export interface LearningEvent {
  id: string;
  incidentId: string;
  stage: string;
  memoryRetrieved?: string;
  decisionInfluenced?: string;
  lessonCreated?: string;
  memoryRetained?: string;
  timestamp: string;
}

export interface SystemHealth {
  status: 'OPERATIONAL' | 'DEGRADED' | 'DISCONNECTED';
  database: {
    connected: boolean;
    engine: string;
    error?: string;
  };
  hindsight: {
    connected: boolean;
    bankId: string;
    message: string;
    usingRealKey: boolean;
  };
  groq: {
    connected: boolean;
    model: string;
    message: string;
    usingRealKey: boolean;
  };
  simulationMode: boolean;
}

export interface LearningDemoState {
  active: boolean;
  currentAct: number;
  totalActs: number;
  incidentId: string;
  completedActs: number[];
  retainedMemoryId?: string;
  isProcessing: boolean;
  statusText: string;
}
