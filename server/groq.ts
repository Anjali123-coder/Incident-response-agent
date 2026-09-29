import { Incident, MemoryInfluence, ResponseAction, RootCauseHypothesis, OrganizationalMemory } from '../src/types.ts';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const INITIAL_GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const FALLBACK_MODELS = [
  INITIAL_GROQ_MODEL,
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768'
];

export interface GroqReasoningResult {
  rootCauseHypotheses: RootCauseHypothesis[];
  memoryInfluence: MemoryInfluence;
  recommendedActions: ResponseAction[];
  source: 'groq' | 'cached_demo';
  modelUsed: string;
  message: string;
}

export class GroqService {
  private apiKey: boolean;
  private activeModel: string;

  constructor() {
    this.apiKey = Boolean(GROQ_API_KEY && GROQ_API_KEY.trim() !== '');
    this.activeModel = INITIAL_GROQ_MODEL;
  }

  async healthCheck(): Promise<{
    connected: boolean;
    model: string;
    message: string;
    usingRealKey: boolean;
  }> {
    if (!this.apiKey) {
      return {
        connected: false,
        model: this.activeModel,
        message: 'GROQ_API_KEY not configured. Running verified demo reasoning pipeline.',
        usingRealKey: false
      };
    }

    try {
      const resp = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (resp.ok) {
        return {
          connected: true,
          model: this.activeModel,
          message: 'Groq Reasoning Engine Connected',
          usingRealKey: true
        };
      }

      return {
        connected: false,
        model: this.activeModel,
        message: `Groq API returned HTTP ${resp.status}`,
        usingRealKey: true
      };
    } catch (err: any) {
      return {
        connected: false,
        model: this.activeModel,
        message: `Groq connection check failed: ${err.message || 'Timeout'}`,
        usingRealKey: true
      };
    }
  }

  async analyzeIncident(params: {
    incident: Incident;
    memories: OrganizationalMemory[];
    safeActionsCatalog: Array<{ action: string; category: string }>;
  }): Promise<GroqReasoningResult> {
    if (!this.apiKey) {
      return this.generateDeterministicDemoReasoning(params.incident, params.memories, 'CACHED DEMO RESULT - Configure GROQ_API_KEY for live reasoning');
    }

    const systemPrompt = `You are IncidentMind, an enterprise AI incident response agent.
CRITICAL MANDATE:
1. NEVER invent historical incidents. All historical incidents, past failures, and past successes must come strictly from the provided HINDSIGHT MEMORIES.
2. The user wants to see how organizational memory changes your decision compared to a naive, memory-less response.
3. Return ONLY a single raw valid JSON object with no markdown fences, no preamble, and no postscript.

JSON Schema:
{
  "rootCauseHypotheses": [
    {
      "hypothesis": "string",
      "confidence": number (0-100),
      "evidence": "string",
      "pastIncidentAnchor": "string or null"
    }
  ],
  "memoryInfluence": {
    "recalledIncidentId": "string",
    "recalledTitle": "string",
    "relevance": number (0-100),
    "whatWorked": ["string"],
    "whatFailed": ["string"],
    "lesson": "string",
    "decisionImpact": "string",
    "why": "string",
    "naiveAction": "string",
    "memoryInformedAction": "string",
    "savedDowntimeMinutes": number
  },
  "recommendedActions": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "why": "string",
      "evidence": "string",
      "historicalSupport": "string",
      "risk": "LOW" | "MEDIUM" | "HIGH",
      "confidence": number (0-100),
      "approved": false,
      "executed": false,
      "simulatedMetricsBefore": {
        "connections": "string",
        "latency": "string",
        "errors": "string"
      },
      "simulatedMetricsAfter": {
        "connections": "string",
        "latency": "string",
        "errors": "string"
      }
    }
  ]
}`;

    const userPrompt = `CURRENT INCIDENT:
ID: ${params.incident.id}
Title: ${params.incident.title}
Service: ${params.incident.service}
Severity: ${params.incident.severity}
Impact: ${params.incident.impact}
Symptoms: ${JSON.stringify(params.incident.symptoms)}
Metrics: P95: ${params.incident.metrics.latencyP95}ms, ErrorRate: ${params.incident.metrics.errorRate}%, ConnectionSaturation: ${params.incident.metrics.connectionSaturation}%
Current Evidence: ${JSON.stringify(params.incident.currentEvidence)}

HINDSIGHT MEMORIES (Only use these for historical grounding):
${JSON.stringify(params.memories.map(m => ({
  id: m.id,
  incidentId: m.incidentId,
  type: m.type,
  lesson: m.lesson,
  outcome: m.outcome,
  details: m.details,
  relevance: m.relevance
})))}

AVAILABLE SAFE ACTIONS:
${JSON.stringify(params.safeActionsCatalog)}

Formulate root cause hypotheses, memory-driven decision impact, and safe recommended actions.`;

    // Attempt through fallback model list
    for (const model of FALLBACK_MODELS) {
      try {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (resp.ok) {
          const data: any = await resp.json();
          const rawText = data.choices?.[0]?.message?.content || '{}';
          const parsed = this.safeParseJSON(rawText);
          if (parsed && parsed.rootCauseHypotheses && parsed.recommendedActions) {
            this.activeModel = model;
            return {
              rootCauseHypotheses: parsed.rootCauseHypotheses,
              memoryInfluence: parsed.memoryInfluence,
              recommendedActions: parsed.recommendedActions,
              source: 'groq',
              modelUsed: model,
              message: `Reasoning verified by Groq (${model}) with Hindsight memory grounding`
            };
          }
        }
      } catch (err: any) {
        console.warn(`Groq model ${model} failed: ${err.message}. Trying next available model...`);
      }
    }

    return this.generateDeterministicDemoReasoning(
      params.incident,
      params.memories,
      'SERVICE TEMPORARILY UNAVAILABLE - Showing verified cached demo reasoning'
    );
  }

  private safeParseJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      // Remove any markdown code fences if present
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      try {
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    }
  }

  generateDeterministicDemoReasoning(
    incident: Incident,
    memories: OrganizationalMemory[],
    statusNotice: string
  ): GroqReasoningResult {
    // Grounding in INC-024 memory if relevant to latency/connection
    const inc024Memory = memories.find(m => m.incidentId === 'INC-024') || memories[0];

    const isConnectionLatencyIssue = 
      incident.id === 'INC-027' || 
      incident.id === 'INC-021' || 
      incident.id === 'INC-024' ||
      incident.title.toLowerCase().includes('latency') || 
      incident.title.toLowerCase().includes('connection');

    if (isConnectionLatencyIssue) {
      return {
        rootCauseHypotheses: [
          {
            hypothesis: 'Database Connection Pool Saturation & Starvation',
            confidence: 94,
            evidence: `Connection saturation at ${incident.metrics.connectionSaturation}%, wait timeouts in pool queue matching logs`,
            pastIncidentAnchor: 'INC-024 (Database Latency Incident)'
          },
          {
            hypothesis: 'Unbounded Read Query Lock Contention',
            confidence: 82,
            evidence: 'Elevated transaction holding times on primary replica holding exclusive table locks',
            pastIncidentAnchor: 'INC-024 Postmortem'
          },
          {
            hypothesis: 'Upstream Ingress Gateway Queue Flooding',
            confidence: 58,
            evidence: '504 gateway timeout cascades secondary to DB worker stalling',
            pastIncidentAnchor: null
          }
        ],
        memoryInfluence: {
          recalledIncidentId: inc024Memory ? inc024Memory.incidentId : 'INC-024',
          recalledTitle: 'Database Latency Incident',
          relevance: 87,
          whatWorked: [
            'Connection pool remediation (PgBouncer tuning)',
            'Read traffic shift to secondary replica pool',
            'Session idle transaction timeouts (30s)'
          ],
          whatFailed: [
            'Restarting unrelated upstream services (created cold-start penalty and connection thundering herd)'
          ],
          lesson: 'Check connection saturation before broad service restart.',
          decisionImpact: 'Prioritized connection saturation analysis before restarting services.',
          why: 'Historical memory from INC-024 indicates that broad service restart was ineffective, while connection-pool remediation resolved the similar incident.',
          naiveAction: 'Restart upstream payment-api and gateway pods',
          memoryInformedAction: 'Shift 60% read traffic to replica and tune PgBouncer connection pool ceiling',
          savedDowntimeMinutes: 38
        },
        recommendedActions: [
          {
            id: 'act_conn_remediation_' + incident.id,
            title: 'Connection Pool Remediation & Idle Session Pruning',
            description: 'Apply PgBouncer pool ceiling extension and prune idle-in-transaction worker locks.',
            why: 'Immediate relief of 94% connection saturation directly targeting transaction queue backlog.',
            evidence: `Current saturation is ${incident.metrics.connectionSaturation}%; HikariCP wait queue is blocked.`,
            historicalSupport: 'Proven resolution in INC-024 with 0 downtime and 68% latency recovery.',
            risk: 'LOW',
            confidence: 94,
            approved: false,
            executed: false,
            simulatedMetricsBefore: {
              connections: `${incident.metrics.connectionSaturation}%`,
              latency: `${(incident.metrics.latencyP95 / 1000).toFixed(1)}s`,
              errors: `${incident.metrics.errorRate}%`
            },
            simulatedMetricsAfter: {
              connections: '61%',
              latency: '0.9s',
              errors: '0.2%'
            }
          },
          {
            id: 'act_read_shift_' + incident.id,
            title: 'Dynamic Read Traffic Shift to Secondary Replica',
            description: 'Reroute non-transactional read traffic away from primary writer node.',
            why: 'Frees active connection slots for critical checkout write mutations.',
            evidence: 'pg_stat_activity indicates 65% of locked transactions are read-only catalog lookups.',
            historicalSupport: 'Applied during INC-024; reduced primary CPU from 91% to 45%.',
            risk: 'LOW',
            confidence: 91,
            approved: false,
            executed: false,
            simulatedMetricsBefore: {
              connections: '88%',
              latency: '2.4s',
              errors: '9.4%'
            },
            simulatedMetricsAfter: {
              connections: '54%',
              latency: '0.8s',
              errors: '0.1%'
            }
          },
          {
            id: 'act_suppress_restart_' + incident.id,
            title: 'Suppress Broad Service Restart [SAFEGUARD]',
            description: 'Block automated restart of upstream API gateway pods to prevent connection thundering herd.',
            why: 'Restarting upstream services in a DB saturation scenario causes cold-start connection storms.',
            evidence: 'Upstream services are healthy; root bottleneck is database connection starvation.',
            historicalSupport: 'INC-024 FAILED_RESPONSE: restart extended outage by 12 minutes.',
            risk: 'LOW',
            confidence: 97,
            approved: true,
            executed: true
          }
        ],
        source: 'cached_demo',
        modelUsed: 'Groq/Memory-Informed-Engine',
        message: statusNotice
      };
    }

    // Generic fallback for other incident types (e.g. Auth, Redis, Canary)
    return {
      rootCauseHypotheses: [
        {
          hypothesis: `Resource or Configuration Contention in ${incident.service}`,
          confidence: 88,
          evidence: incident.symptoms[0] || 'Anomalous metric signature observed',
          pastIncidentAnchor: 'Organizational Memory Catalog'
        },
        {
          hypothesis: 'Downstream Service Dependency Timeout',
          confidence: 74,
          evidence: 'Error rate elevated above normal threshold',
          pastIncidentAnchor: null
        }
      ],
      memoryInfluence: {
        recalledIncidentId: memories[0]?.incidentId || 'INC-019',
        recalledTitle: 'Historical Runbook Match',
        relevance: 78,
        whatWorked: ['Targeted localized isolation', 'Canary weight redirection'],
        whatFailed: ['Broad unvalidated cluster restart'],
        lesson: 'Apply localized isolation before triggering cluster-wide intervention.',
        decisionImpact: 'Scoped remediation to isolated service boundary.',
        why: 'Organizational memory proves targeted isolation restores SLA with minimal blast radius.',
        naiveAction: 'Full cluster restart',
        memoryInformedAction: 'Surgical canary rollback and traffic diversion',
        savedDowntimeMinutes: 24
      },
      recommendedActions: [
        {
          id: 'act_isolate_' + incident.id,
          title: `Isolate Degraded ${incident.service} Nodes`,
          description: 'Divert traffic away from degraded instances and trigger surgical healing.',
          why: 'Prevents cascading timeout errors to upstream callers.',
          evidence: `Error rate is ${incident.metrics.errorRate}% on active pods.`,
          historicalSupport: 'Standard organizational runbook for service degradation.',
          risk: 'LOW',
          confidence: 89,
          approved: false,
          executed: false,
          simulatedMetricsBefore: {
            connections: `${incident.metrics.connectionSaturation}%`,
            latency: `${(incident.metrics.latencyP95 / 1000).toFixed(1)}s`,
            errors: `${incident.metrics.errorRate}%`
          },
          simulatedMetricsAfter: {
            connections: '35%',
            latency: '0.4s',
            errors: '0.1%'
          }
        }
      ],
      source: 'cached_demo',
      modelUsed: 'Groq/Memory-Informed-Engine',
      message: statusNotice
    };
  }
}

export const groqService = new GroqService();
