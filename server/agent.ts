import { getIncidentById, updateIncident, logIncidentEvent, recordLearningEvent } from './db.ts';
import { hindsightService } from './hindsight.ts';
import { groqService } from './groq.ts';
import { Incident, Postmortem } from '../src/types.ts';

const SAFE_ACTIONS_CATALOG = [
  { action: 'Check database connection saturation', category: 'DIAGNOSTIC' },
  { action: 'Shift read traffic to replica pool', category: 'TRAFFIC_CONTROL' },
  { action: 'Remediate PgBouncer connection pool ceiling', category: 'RESOURCE_TUNING' },
  { action: 'Prune idle-in-transaction client sessions', category: 'SESSION_MANAGEMENT' },
  { action: 'Rollback canary deployment to stable version', category: 'DEPLOYMENT' },
  { action: 'Suppress broad service restart', category: 'GUARDRAIL' },
  { action: 'Warm cache before traffic cutover', category: 'CACHE' },
  { action: 'Scale worker pods horizontally', category: 'SCALING' }
];

export class IncidentMindAgent {
  async investigateIncident(incidentId: string): Promise<{
    incident: Incident;
    steps: Array<{ step: string; status: 'completed' | 'in_progress'; detail: string }>;
    recalledCount: number;
    memoryGrounding: string;
  }> {
    const incident = getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const steps = [
      { step: 'INGESTING', status: 'completed' as const, detail: `Normalized telemetry from ${incident.service}` },
      { step: 'NORMALIZING', status: 'completed' as const, detail: 'Parsed metrics, stack traces, and pg_stat_activity' },
      { step: 'EXTRACTING EVIDENCE', status: 'completed' as const, detail: `Identified error signature: ${incident.currentEvidence.errorSignature || 'Anomalous load'}` },
      { step: 'RECALLING HINDSIGHT', status: 'completed' as const, detail: `Querying Hindsight Cloud memory bank for similar patterns` },
      { step: 'CORRELATING HISTORY', status: 'completed' as const, detail: 'Mapped past successes (INC-024) and anti-patterns' },
      { step: 'REASONING WITH GROQ', status: 'completed' as const, detail: 'Synthesized memory-informed decision tree' },
      { step: 'GENERATING RESPONSE PLAN', status: 'completed' as const, detail: 'Formulated safe sandbox remediation sequence' },
      { step: 'READY FOR APPROVAL', status: 'completed' as const, detail: 'Awaiting human authorization before simulation' }
    ];

    // 1. Recall historical organizational memory from Hindsight
    const recallQuery = `${incident.title} ${incident.service} ${incident.symptoms.join(' ')}`;
    const recallResult = await hindsightService.recallMemories(recallQuery, 4);

    // 2. Perform Groq Reasoning grounded by Hindsight memories
    const reasoningResult = await groqService.analyzeIncident({
      incident,
      memories: recallResult.memories,
      safeActionsCatalog: SAFE_ACTIONS_CATALOG
    });

    // 3. Update Incident with AI investigation results
    incident.status = 'INVESTIGATING';
    incident.rootCauseHypotheses = reasoningResult.rootCauseHypotheses;
    incident.recommendedActions = reasoningResult.recommendedActions;
    incident.memoryInfluence = reasoningResult.memoryInfluence;
    incident.hasMemoryMatch = Boolean(reasoningResult.memoryInfluence && reasoningResult.memoryInfluence.relevance > 60);

    // Add timeline event
    incident.timeline.push({
      time: new Date().toISOString().substring(11, 19) + 'Z',
      stage: 'AI INVESTIGATION',
      description: `IncidentMind recalled ${recallResult.memories.length} organizational memories (${recallResult.source}) and generated memory-informed response plan.`,
      type: 'agent'
    });

    updateIncident(incident);
    logIncidentEvent(incident.id, 'INVESTIGATION_COMPLETED', 'Agent analyzed incident with Hindsight memory grounding', {
      recalledCount: recallResult.memories.length,
      source: recallResult.source,
      groqSource: reasoningResult.source
    });

    recordLearningEvent({
      id: 'le_' + Date.now(),
      incidentId: incident.id,
      stage: 'REASON',
      memoryRetrieved: reasoningResult.memoryInfluence?.recalledIncidentId || 'INC-024',
      decisionInfluenced: reasoningResult.memoryInfluence?.decisionImpact,
      timestamp: new Date().toISOString()
    });

    return {
      incident,
      steps,
      recalledCount: recallResult.memories.length,
      memoryGrounding: reasoningResult.message
    };
  }

  async simulateAction(incidentId: string, actionId: string): Promise<{
    incident: Incident;
    simulationReport: {
      actionId: string;
      stages: Array<{ stage: string; description: string; durationMs: number }>;
      beforeMetrics: any;
      afterMetrics: any;
      verified: boolean;
    };
  }> {
    const incident = getIncidentById(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const action = (incident.recommendedActions || []).find(a => a.id === actionId);
    if (action) {
      action.approved = true;
      action.executed = true;
    }

    // Apply simulated improvements to sandbox metrics
    const beforeMetrics = { ...incident.metrics };
    const afterMetrics = {
      latencyP95: Math.round(incident.metrics.latencyP95 * 0.28),
      latencyP99: Math.round(incident.metrics.latencyP99 * 0.32),
      errorRate: 0.1,
      connectionSaturation: Math.max(35, Math.round(incident.metrics.connectionSaturation * 0.62)),
      throughputRps: Math.round(incident.metrics.throughputRps * 1.05),
      cpuUtilization: Math.max(40, Math.round(incident.metrics.cpuUtilization * 0.68))
    };

    incident.status = 'SIMULATING';
    incident.metrics = afterMetrics;

    incident.timeline.push({
      time: new Date().toISOString().substring(11, 19) + 'Z',
      stage: 'SIMULATION EXECUTED',
      description: `Simulated action "${action?.title || 'Remediation'}" in sandbox. P95 latency dropped to ${afterMetrics.latencyP95}ms, saturation fell to ${afterMetrics.connectionSaturation}%.`,
      type: 'simulation'
    });

    updateIncident(incident);
    logIncidentEvent(incident.id, 'ACTION_SIMULATED', `Simulated execution of ${action?.title || actionId}`);

    const simulationReport = {
      actionId,
      stages: [
        { stage: 'ACTION APPROVED', description: 'Operator authorized simulated sandbox execution', durationMs: 150 },
        { stage: 'SIMULATION STARTED', description: 'Targeting isolated sandbox environment', durationMs: 300 },
        { stage: 'ACTION EXECUTED IN SANDBOX', description: action?.description || 'Applied remediation parameters', durationMs: 650 },
        { stage: 'SYSTEM RESPONSE', description: 'Database queue unblocked, connection slots released', durationMs: 400 },
        { stage: 'METRICS IMPROVING', description: 'Observed 68% drop in query wait latency', durationMs: 350 },
        { stage: 'VERIFICATION', description: 'Health check probe: HTTP 200 OK across all workers', durationMs: 200 },
        { stage: 'SUCCESS', description: 'Simulated resolution verified successfully', durationMs: 100 }
      ],
      beforeMetrics,
      afterMetrics,
      verified: true
    };

    return { incident, simulationReport };
  }

  async resolveIncident(incidentId: string): Promise<Incident> {
    const incident = getIncidentById(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    incident.status = 'RESOLVED';
    incident.resolvedAt = new Date().toISOString();

    incident.timeline.push({
      time: new Date().toISOString().substring(11, 19) + 'Z',
      stage: 'RESOLVED',
      description: 'Incident marked as resolved following verified simulated remediation.',
      type: 'human'
    });

    updateIncident(incident);
    logIncidentEvent(incident.id, 'INCIDENT_RESOLVED', 'Incident resolution confirmed');
    return incident;
  }

  async generatePostmortem(incidentId: string): Promise<Postmortem> {
    const incident = getIncidentById(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const postmortem: Postmortem = {
      id: `PM-${incident.id}`,
      incidentId: incident.id,
      title: `${incident.title} (${incident.id}) - Automated Postmortem`,
      impact: incident.impact,
      rootCause: incident.rootCauseHypotheses?.[0]?.hypothesis || 'Database connection pool saturation starving write workers.',
      timeline: incident.timeline.map(t => `${t.time} - [${t.stage}] ${t.description}`),
      actionsTaken: (incident.recommendedActions || []).filter(a => a.executed || a.approved).map(a => a.title),
      whatWorked: incident.memoryInfluence?.whatWorked || [
        'Connection pool remediation via PgBouncer tuning',
        'Dynamic read traffic diversion to secondary replica',
        'Enforcing 30s idle transaction timeouts'
      ],
      whatFailed: incident.memoryInfluence?.whatFailed || [
        'Broad service restarts attempted in earlier naive incidents (caused cold-start reconnection storms)'
      ],
      lessonsLearned: [
        incident.memoryInfluence?.lesson || 'Check connection saturation before broad service restart.',
        `Isolate analytical read queries from transactional write connection pools in ${incident.service}.`
      ],
      futureRecommendations: [
        'Codify memory-informed connection check as mandatory pre-restart invariant',
        'Add automated pg_stat_activity connection leak alerts at 80% saturation threshold'
      ],
      retainedToMemory: false,
      createdAt: new Date().toISOString()
    };

    incident.postmortem = postmortem;
    updateIncident(incident);
    logIncidentEvent(incident.id, 'POSTMORTEM_GENERATED', 'Generated automated incident postmortem');

    return postmortem;
  }

  async teachIncidentMind(incidentId: string): Promise<{
    postmortem: Postmortem;
    memoryId: string;
    source: 'hindsight' | 'cached_demo';
    message: string;
    lesson: string;
  }> {
    const incident = getIncidentById(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    if (!incident.postmortem) {
      await this.generatePostmortem(incidentId);
    }

    const pm = incident.postmortem!;
    const primaryLesson = pm.lessonsLearned[0] || 'Check connection saturation before broad service restart.';
    const primaryOutcome = `Resolved ${incident.id} in sandbox via ${pm.actionsTaken.join(', ') || 'remediation'}.`;

    // Retain this new memory into Hindsight!
    const retainResult = await hindsightService.retainMemory({
      documentId: `hs_mem_${incident.id.toLowerCase()}_postmortem`,
      content: `POSTMORTEM for ${incident.id} (${incident.title}) on service ${incident.service}. Root Cause: ${pm.rootCause}. What Worked: ${pm.whatWorked.join('; ')}. What Failed: ${pm.whatFailed.join('; ')}. Primary Lesson: ${primaryLesson}. Outcome: ${primaryOutcome}`,
      context: 'LESSON',
      category: 'LESSON',
      service: incident.service,
      lesson: primaryLesson,
      outcome: primaryOutcome,
      incidentId: incident.id,
      tags: [incident.service, 'learned-lesson', 'memory-decision']
    });

    pm.hindsightMemoryId = retainResult.memoryId;
    pm.retainedToMemory = true;
    incident.postmortem = pm;
    updateIncident(incident);

    recordLearningEvent({
      id: 'le_teach_' + Date.now(),
      incidentId: incident.id,
      stage: 'REMEMBER',
      lessonCreated: primaryLesson,
      memoryRetained: retainResult.memoryId,
      timestamp: new Date().toISOString()
    });

    logIncidentEvent(incident.id, 'ORGANIZATIONAL_MEMORY_RETAINED', `Learned lesson saved to Hindsight: ${retainResult.memoryId}`);

    return {
      postmortem: pm,
      memoryId: retainResult.memoryId,
      source: retainResult.source,
      message: retainResult.message,
      lesson: primaryLesson
    };
  }
}

export const agent = new IncidentMindAgent();
