import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { Incident, LearningEvent, Postmortem, ResponseAction } from '../src/types.ts';

const DB_PATH = path.resolve(process.cwd(), 'incidentmind.sqlite');

let db: DatabaseSync;

export function initDatabase() {
  db = new DatabaseSync(DB_PATH);

  // Enable WAL mode if supported, create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      service TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      detected_at TEXT NOT NULL,
      resolved_at TEXT,
      impact TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      metrics TEXT NOT NULL,
      logs TEXT NOT NULL,
      current_evidence TEXT NOT NULL,
      timeline TEXT NOT NULL,
      root_cause_hypotheses TEXT,
      recommended_actions TEXT,
      memory_influence TEXT,
      postmortem TEXT,
      has_memory_match INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incident_events (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      payload TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS response_actions (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      action_name TEXT NOT NULL,
      reason TEXT NOT NULL,
      evidence TEXT,
      historical_support TEXT,
      risk TEXT NOT NULL,
      confidence REAL NOT NULL,
      status TEXT NOT NULL,
      simulated_metrics_before TEXT,
      simulated_metrics_after TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS postmortems (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      impact TEXT NOT NULL,
      root_cause TEXT NOT NULL,
      timeline TEXT NOT NULL,
      actions_taken TEXT NOT NULL,
      what_worked TEXT NOT NULL,
      what_failed TEXT NOT NULL,
      lessons_learned TEXT NOT NULL,
      future_recommendations TEXT NOT NULL,
      hindsight_memory_id TEXT,
      retained_to_memory INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS learning_events (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      memory_retrieved TEXT,
      decision_influenced TEXT,
      lesson_created TEXT,
      memory_retained TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS demo_runs (
      id TEXT PRIMARY KEY,
      current_act INTEGER NOT NULL,
      state TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialIncidents();
  return db;
}

export function getDb(): DatabaseSync {
  if (!db) {
    initDatabase();
  }
  return db;
}

export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'INC-021',
    title: 'Database Connection Saturation',
    service: 'order-db-cluster',
    severity: 'CRITICAL',
    status: 'TRIGGERED',
    detectedAt: '2026-09-29T11:42:00Z',
    impact: 'Checkout transactions failing; 98% connections occupied, write queue blocked.',
    symptoms: [
      'Connection pool exhaustion: 492/500 client connections allocated',
      'P99 query latency spiked from 42ms to 4,200ms',
      'Transaction timeout errors in checkout microservice'
    ],
    metrics: {
      latencyP95: 3400,
      latencyP99: 4200,
      errorRate: 18.4,
      connectionSaturation: 98,
      throughputRps: 1120,
      cpuUtilization: 89
    },
    logs: [
      { timestamp: '11:41:40Z', level: 'WARN', source: 'order-db-pool', message: 'Active connections exceeded 90% threshold (451/500)' },
      { timestamp: '11:42:01Z', level: 'ERROR', source: 'checkout-service', message: 'org.postgresql.util.PSQLException: FATAL: remaining connection slots are reserved' },
      { timestamp: '11:42:15Z', level: 'ERROR', source: 'order-db-primary', message: 'Transaction pool queue overflow: 142 waiting threads' }
    ],
    currentEvidence: {
      recentDeployment: 'No deployments in last 6 hours',
      trafficAnomaly: '+35% sudden traffic burst to flash sales promotion',
      dbSaturation: 'Postgres pg_stat_activity shows 380 idle in transaction sessions holding locks',
      errorSignature: 'PSQLException: FATAL: remaining connection slots are reserved for non-replication superuser connections',
      blastRadius: 'Order placement and payment authorization flows'
    },
    timeline: [
      { time: '11:40:00Z', stage: 'TRAFFIC BURST', description: 'Promotional campaign broadcast triggered 35% traffic surge', type: 'system' },
      { time: '11:41:40Z', stage: 'THRESHOLD ALERT', description: 'Postgres connection pool reached 90% allocation', type: 'system' },
      { time: '11:42:00Z', stage: 'INCIDENT TRIGGERED', description: 'Automated Pager alert: DB Connection Saturation on order-db-cluster', type: 'system' }
    ]
  },
  {
    id: 'INC-022',
    title: 'API Latency Spike',
    service: 'ingress-gateway',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    detectedAt: '2026-09-29T10:15:00Z',
    impact: 'Customer portal experiencing 3.5s page load times across Asia-Pacific region.',
    symptoms: [
      'Edge envoy gateway queue latency elevated to 3,500ms',
      '504 Gateway Timeout errors reaching 8.2% on /v2/catalog route',
      'Upstream circuit breaker tripped on product-catalog replica 3'
    ],
    metrics: {
      latencyP95: 2800,
      latencyP99: 3500,
      errorRate: 8.2,
      connectionSaturation: 74,
      throughputRps: 4500,
      cpuUtilization: 68
    },
    logs: [
      { timestamp: '10:14:22Z', level: 'WARN', source: 'envoy-gateway-01', message: 'Upstream cluster product-catalog response timeout > 3000ms' },
      { timestamp: '10:15:02Z', level: 'ERROR', source: 'envoy-gateway-01', message: 'HTTP 504 generated for client downstream /v2/catalog/items' },
      { timestamp: '10:15:30Z', level: 'WARN', source: 'circuit-breaker', message: 'Tripped circuit breaker on catalog-pod-03 after 25 consecutive timeouts' }
    ],
    currentEvidence: {
      recentDeployment: 'Catalog service patch v2.8.2 deployed 45 mins ago',
      trafficAnomaly: 'Steady traffic volume; 4,500 RPS nominal',
      errorSignature: '504 GATEWAY_TIMEOUT from upstream envoy cluster',
      blastRadius: 'Product listings and catalog browse endpoints'
    },
    timeline: [
      { time: '09:30:00Z', stage: 'DEPLOYMENT', description: 'Catalog service v2.8.2 rolling deployment completed', type: 'system' },
      { time: '10:14:00Z', stage: 'LATENCY DEGRADATION', description: 'P95 latency crossed 2000ms SLA', type: 'system' },
      { time: '10:15:00Z', stage: 'PAGE FIRED', description: 'On-call dispatched for Ingress Gateway Latency', type: 'system' }
    ]
  },
  {
    id: 'INC-023',
    title: 'Authentication Service Failure',
    service: 'auth-service',
    severity: 'CRITICAL',
    status: 'TRIGGERED',
    detectedAt: '2026-09-29T09:05:00Z',
    impact: 'Users unable to login or refresh OAuth tokens; 401 error rate 24.5%.',
    symptoms: [
      'Auth token verification failure rate 24.5%',
      'JWKS cache invalidation loop causing public key endpoint thrashing',
      'Redis session lookup latency spiked to 920ms'
    ],
    metrics: {
      latencyP95: 1950,
      latencyP99: 2800,
      errorRate: 24.5,
      connectionSaturation: 82,
      throughputRps: 2100,
      cpuUtilization: 94
    },
    logs: [
      { timestamp: '09:04:12Z', level: 'ERROR', source: 'auth-service', message: 'JWKS key refresh failed: socket timeout while contacting idp.internal' },
      { timestamp: '09:04:45Z', level: 'ERROR', source: 'auth-validator', message: 'Signature verification failed: key ID ed25519-2026-09 not found in local cache' },
      { timestamp: '09:05:01Z', level: 'ERROR', source: 'token-refresher', message: 'Failed to issue refresh grant: Redis cache pool exhausted' }
    ],
    currentEvidence: {
      recentDeployment: 'No recent code release',
      trafficAnomaly: 'Normal login distribution',
      errorSignature: 'JWT_SIGNATURE_EXPIRED / JWKS_FETCH_TIMEOUT',
      blastRadius: 'Global user authentication across web and mobile'
    },
    timeline: [
      { time: '09:03:00Z', stage: 'KEY ROTATION', description: 'Scheduled IDP internal public key rollover initiated', type: 'system' },
      { time: '09:04:12Z', stage: 'CACHE MISS FLOOD', description: 'Auth pods attempted concurrent JWKS refreshes', type: 'system' },
      { time: '09:05:00Z', stage: 'INCIDENT TRIGGERED', description: 'Critical alert: Auth token verification failure > 10%', type: 'system' }
    ]
  },
  {
    id: 'INC-024',
    title: 'Database Latency Incident',
    service: 'user-db-primary',
    severity: 'HIGH',
    status: 'RESOLVED',
    detectedAt: '2026-09-15T14:20:00Z',
    resolvedAt: '2026-09-15T14:48:00Z',
    impact: 'P95 latency elevated to 2.8s; connection pool reached 96%. Resolved via connection pool tuning and read traffic shift.',
    symptoms: [
      'Connection pool saturated at 96% (480/500)',
      'P95 latency escalated to 2,800ms',
      'Unchecked read query volume saturating master replica'
    ],
    metrics: {
      latencyP95: 900,
      latencyP99: 1200,
      errorRate: 0.1,
      connectionSaturation: 61,
      throughputRps: 3400,
      cpuUtilization: 45
    },
    logs: [
      { timestamp: '14:20:10Z', level: 'WARN', source: 'user-db', message: 'Connection pool saturation: 480/500 allocated' },
      { timestamp: '14:22:15Z', level: 'INFO', source: 'incidentmind-agent', message: 'Historical correlation: connection pool exhaustion pattern matched' },
      { timestamp: '14:28:00Z', level: 'INFO', source: 'simulated-sandbox', message: 'Shifted read traffic to read-replica pool. Scaled PgBouncer pool ceiling to 750.' },
      { timestamp: '14:48:00Z', level: 'INFO', source: 'incidentmind-agent', message: 'Incident resolved. P95 latency dropped from 2.8s to 0.9s.' }
    ],
    currentEvidence: {
      recentDeployment: 'None',
      trafficAnomaly: 'Heavy report generation jobs',
      dbSaturation: 'Master node CPU at 91%; connection pool 96%',
      errorSignature: 'Query lock wait timeout on user_profiles table',
      blastRadius: 'Profile updates and session validation'
    },
    timeline: [
      { time: '14:20:00Z', stage: 'DETECTION', description: 'Latency threshold breached on user-db-primary', type: 'system' },
      { time: '14:24:00Z', stage: 'INVESTIGATION', description: 'IncidentMind analyzed symptoms and rejected naive service restart', type: 'agent' },
      { time: '14:28:00Z', stage: 'REMEDIATION', description: 'Simulated connection pool resize + shifted 60% read traffic to replica', type: 'simulation' },
      { time: '14:48:00Z', stage: 'VERIFICATION', description: 'Saturation dropped to 61%, P95 latency settled at 0.9s', type: 'human' }
    ],
    memoryInfluence: {
      recalledIncidentId: 'INC-011',
      recalledTitle: 'Legacy DB Connection Leak',
      relevance: 91,
      whatWorked: ['Connection pool remediation via PgBouncer', 'Read traffic shift to replica', 'Cache warm-up'],
      whatFailed: ['Restarting unrelated frontend services caused 12m cold-start degradation'],
      lesson: 'Check connection saturation and shift read traffic before broad service restart.',
      decisionImpact: 'Prioritized connection saturation analysis over restarting services.',
      why: 'Historical memory showed broad service restarts did not resolve underlying DB connection leaks and added cold-start downtime.',
      naiveAction: 'Restart frontend web cluster and API gateway',
      memoryInformedAction: 'PgBouncer connection pool remediation + dynamic read-traffic shift to secondary replica',
      savedDowntimeMinutes: 34
    },
    postmortem: {
      id: 'PM-INC-024',
      incidentId: 'INC-024',
      title: 'Database Latency & Connection Saturation Postmortem',
      impact: 'P95 latency elevated to 2.8s for 28 minutes. 0 customer data loss.',
      rootCause: 'Unbounded analytics queries held open connections on master instance, starving API transaction workers.',
      timeline: [
        '14:20Z - Detected connection spike to 96%',
        '14:24Z - IncidentMind identified connection pool exhaustion',
        '14:28Z - Executed simulated connection pool remediation and shifted read queries',
        '14:48Z - Latency normalized to 0.9s; incident resolved'
      ],
      actionsTaken: [
        'Isolated analytics read traffic to dedicated read-replica',
        'Adjusted PgBouncer max pool size from 500 to 750',
        'Enabled aggressive idle transaction timeout (30s)'
      ],
      whatWorked: [
        'Connection pool remediation',
        'Read traffic shift to secondary replica',
        'PgBouncer connection recycling'
      ],
      whatFailed: [
        'Restarting upstream services in previous incidents was counter-productive'
      ],
      lessonsLearned: [
        'Check connection saturation before broad service restart.',
        'Isolate reporting workload connection pools from customer transaction pools.'
      ],
      futureRecommendations: [
        'Enforce read-only replica routing at ORM level',
        'Add automated pg_stat_activity connection leak circuit breaker'
      ],
      hindsightMemoryId: 'hs_mem_inc024_master_postmortem',
      retainedToMemory: true,
      createdAt: '2026-09-15T15:00:00Z'
    },
    hasMemoryMatch: true
  },
  {
    id: 'INC-025',
    title: 'Deployment Error Spike',
    service: 'billing-engine',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    detectedAt: '2026-09-20T16:10:00Z',
    resolvedAt: '2026-09-20T16:25:00Z',
    impact: 'Canary release v3.4.1 threw 500 errors on invoice calculation; 12% error rate.',
    symptoms: [
      'Invoice calculation endpoint returning HTTP 500',
      'NullPointerException on tax calculation helper class'
    ],
    metrics: {
      latencyP95: 310,
      latencyP99: 450,
      errorRate: 0.05,
      connectionSaturation: 35,
      throughputRps: 850,
      cpuUtilization: 32
    },
    logs: [
      { timestamp: '16:09:50Z', level: 'WARN', source: 'k8s-rollout', message: 'Canary pod billing-engine-v341-78c ready' },
      { timestamp: '16:10:15Z', level: 'ERROR', source: 'billing-engine', message: 'NullPointerException at TaxRegionResolver.resolveJurisdiction(TaxRegionResolver.java:84)' },
      { timestamp: '16:12:00Z', level: 'INFO', source: 'incidentmind-agent', message: 'Hindsight match INC-019: Automated canary rollback recommended' }
    ],
    currentEvidence: {
      recentDeployment: 'v3.4.1 canary deployed at 16:09Z',
      trafficAnomaly: '10% canary traffic cohort',
      errorSignature: 'NullPointerException in TaxRegionResolver',
      blastRadius: 'Invoicing calculations in canary pod'
    },
    timeline: [
      { time: '16:09Z', stage: 'DEPLOYMENT', description: 'Canary v3.4.1 deployed to 10% traffic', type: 'system' },
      { time: '16:10Z', stage: 'ERROR SPIKE', description: 'Error rate jumped to 12% on canary target', type: 'system' },
      { time: '16:12Z', stage: 'ROLLBACK APPLIED', description: 'Instant traffic diversion back to stable v3.4.0', type: 'agent' }
    ]
  },
  {
    id: 'INC-026',
    title: 'Cache Failure',
    service: 'redis-session-store',
    severity: 'HIGH',
    status: 'RESOLVED',
    detectedAt: '2026-09-22T08:30:00Z',
    resolvedAt: '2026-09-22T08:52:00Z',
    impact: 'Redis cluster memory eviction cascade; cache hit ratio dropped from 94% to 12%.',
    symptoms: [
      'Cache hit ratio plummeted to 12%',
      'Redis evicted keys rate: 14,000 keys/sec',
      'Database read volume spiked 400%'
    ],
    metrics: {
      latencyP95: 180,
      latencyP99: 320,
      errorRate: 0.2,
      connectionSaturation: 42,
      throughputRps: 5200,
      cpuUtilization: 38
    },
    logs: [
      { timestamp: '08:29:45Z', level: 'WARN', source: 'redis-node-02', message: 'maxmemory threshold reached: volatile-lru eviction initiated' },
      { timestamp: '08:30:12Z', level: 'ERROR', source: 'session-client', message: 'Cache miss rate spiked above 80%; falling back to PostgreSQL session table' },
      { timestamp: '08:35:00Z', level: 'INFO', source: 'incidentmind-agent', message: 'Identified unbounded key TTL in recent session token generator' }
    ],
    currentEvidence: {
      recentDeployment: 'Session token middleware update 2 days prior',
      trafficAnomaly: 'Accumulated 12M orphaned session tokens without TTL',
      errorSignature: 'OOM command not allowed when used memory > maxmemory',
      blastRadius: 'User session verification and shopping cart cache'
    },
    timeline: [
      { time: '08:29Z', stage: 'MEMORY BREACH', description: 'Redis memory reached 99.8% allocation', type: 'system' },
      { time: '08:32Z', stage: 'ANALYSIS', description: 'Hindsight recalled INC-014 cache stampede lessons', type: 'agent' },
      { time: '08:40Z', stage: 'FLUSH ORPHANS', description: 'Executed surgical scan & eviction of expired token namespace', type: 'simulation' }
    ]
  },
  {
    id: 'INC-027',
    title: 'API Latency Regression',
    service: 'payment-api-cluster',
    severity: 'CRITICAL',
    status: 'TRIGGERED',
    detectedAt: '2026-09-29T12:10:00Z',
    impact: 'Payment checkout endpoints taking 3.2s; database connection saturation climbing rapidly to 94%.',
    symptoms: [
      'Payment API P95 response latency exceeded 3.2s (baseline 210ms)',
      'Downstream PostgreSQL connection pool saturated at 94%',
      '504 Gateway errors on POST /v1/checkout/process'
    ],
    metrics: {
      latencyP95: 3200,
      latencyP99: 4100,
      errorRate: 14.8,
      connectionSaturation: 94,
      throughputRps: 1840,
      cpuUtilization: 88
    },
    logs: [
      { timestamp: '12:09:40Z', level: 'WARN', source: 'payment-api', message: 'Downstream DB query wait time exceeded 2500ms' },
      { timestamp: '12:10:02Z', level: 'ERROR', source: 'payment-api-worker-14', message: 'HikariCP - Connection is not available, request timed out after 30000ms' },
      { timestamp: '12:10:28Z', level: 'ERROR', source: 'gateway', message: 'Upstream payment-api returned HTTP 504 Gateway Timeout' }
    ],
    currentEvidence: {
      recentDeployment: 'No deployments in last 12 hours',
      trafficAnomaly: 'Steady incoming payment volume (1,840 RPS)',
      dbSaturation: 'Postgres connection pool 94% allocated; read transactions queuing behind long-running ledger checks',
      errorSignature: 'HikariCP: Connection is not available, request timed out after 30000ms',
      blastRadius: 'Global checkout processing and merchant authorization'
    },
    timeline: [
      { time: '12:08:00Z', stage: 'QUERY STALL', description: 'Read query lock wait times elevated on payment-db', type: 'system' },
      { time: '12:09:40Z', stage: 'POOL EXHAUSTION', description: 'HikariCP connection pool hit 94% capacity', type: 'system' },
      { time: '12:10:00Z', stage: 'INCIDENT TRIGGERED', description: 'Critical alert: Payment API Latency Regression & Gateway Timeouts', type: 'system' }
    ]
  },
  {
    id: 'INC-028',
    title: 'Payment Service Timeout',
    service: 'webhook-dispatcher',
    severity: 'CRITICAL',
    status: 'TRIGGERED',
    detectedAt: '2026-09-29T12:35:00Z',
    impact: 'Outbound payment webhook delivery queue stalled; 18,000 pending notifications.',
    symptoms: [
      'Webhook egress worker queue depth: 18,400 messages',
      'Timeout rate to partner endpoints 32%',
      'Retry storm overwhelming egress NAT gateway'
    ],
    metrics: {
      latencyP95: 5400,
      latencyP99: 8200,
      errorRate: 32.1,
      connectionSaturation: 89,
      throughputRps: 620,
      cpuUtilization: 92
    },
    logs: [
      { timestamp: '12:34:10Z', level: 'WARN', source: 'webhook-worker-8', message: 'Egress connection pool exhausted on NAT IP 35.192.4.11' },
      { timestamp: '12:34:45Z', level: 'ERROR', source: 'webhook-dispatcher', message: 'Failed to deliver webhook payload to partner merchant: ETIMEDOUT' },
      { timestamp: '12:35:02Z', level: 'ERROR', source: 'queue-monitor', message: 'Dead letter queue growth rate +450 msgs/minute' }
    ],
    currentEvidence: {
      recentDeployment: 'None',
      trafficAnomaly: 'End-of-month reconciliation payout batch',
      errorSignature: 'ETIMEDOUT / NAT_GATEWAY_PORT_EXHAUSTION',
      blastRadius: 'Merchant notification callbacks and delivery status webhooks'
    },
    timeline: [
      { time: '12:30:00Z', stage: 'BATCH TRIGGER', description: 'Automated merchant reconciliation payout dispatch initiated', type: 'system' },
      { time: '12:34:00Z', stage: 'EGRESS EXHAUSTION', description: 'NAT gateway source port allocation exceeded 95%', type: 'system' },
      { time: '12:35:00Z', stage: 'PAGER FIRED', description: 'Critical alert: Webhook dispatcher delivery failure spike', type: 'system' }
    ]
  }
];

function seedInitialIncidents() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM incidents').get() as { count: number };
  if (countRow && countRow.count > 0) {
    return;
  }

  const insertStmt = db.prepare(`
    INSERT INTO incidents (
      id, title, service, severity, status, detected_at, resolved_at, impact,
      symptoms, metrics, logs, current_evidence, timeline, root_cause_hypotheses,
      recommended_actions, memory_influence, postmortem, has_memory_match
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (const inc of SEED_INCIDENTS) {
    insertStmt.run(
      inc.id,
      inc.title,
      inc.service,
      inc.severity,
      inc.status,
      inc.detectedAt,
      inc.resolvedAt || null,
      inc.impact,
      JSON.stringify(inc.symptoms),
      JSON.stringify(inc.metrics),
      JSON.stringify(inc.logs),
      JSON.stringify(inc.currentEvidence),
      JSON.stringify(inc.timeline),
      inc.rootCauseHypotheses ? JSON.stringify(inc.rootCauseHypotheses) : null,
      inc.recommendedActions ? JSON.stringify(inc.recommendedActions) : null,
      inc.memoryInfluence ? JSON.stringify(inc.memoryInfluence) : null,
      inc.postmortem ? JSON.stringify(inc.postmortem) : null,
      inc.hasMemoryMatch ? 1 : 0
    );
  }
}

export function getAllIncidents(): Incident[] {
  const rows = getDb().prepare('SELECT * FROM incidents ORDER BY detected_at DESC').all() as any[];
  return rows.map(formatIncidentRow);
}

export function getIncidentById(id: string): Incident | null {
  const row = getDb().prepare('SELECT * FROM incidents WHERE id = ?').get(id) as any;
  if (!row) return null;
  return formatIncidentRow(row);
}

export function updateIncident(incident: Incident): void {
  const stmt = getDb().prepare(`
    UPDATE incidents SET
      title = ?,
      service = ?,
      severity = ?,
      status = ?,
      detected_at = ?,
      resolved_at = ?,
      impact = ?,
      symptoms = ?,
      metrics = ?,
      logs = ?,
      current_evidence = ?,
      timeline = ?,
      root_cause_hypotheses = ?,
      recommended_actions = ?,
      memory_influence = ?,
      postmortem = ?,
      has_memory_match = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    incident.title,
    incident.service,
    incident.severity,
    incident.status,
    incident.detectedAt,
    incident.resolvedAt || null,
    incident.impact,
    JSON.stringify(incident.symptoms),
    JSON.stringify(incident.metrics),
    JSON.stringify(incident.logs),
    JSON.stringify(incident.currentEvidence),
    JSON.stringify(incident.timeline),
    incident.rootCauseHypotheses ? JSON.stringify(incident.rootCauseHypotheses) : null,
    incident.recommendedActions ? JSON.stringify(incident.recommendedActions) : null,
    incident.memoryInfluence ? JSON.stringify(incident.memoryInfluence) : null,
    incident.postmortem ? JSON.stringify(incident.postmortem) : null,
    incident.hasMemoryMatch ? 1 : 0,
    incident.id
  );
}

export function logIncidentEvent(incidentId: string, eventType: string, description: string, payload?: any): void {
  const id = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  getDb().prepare(`
    INSERT INTO incident_events (id, incident_id, event_type, description, payload)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, incidentId, eventType, description, payload ? JSON.stringify(payload) : null);
}

export function recordLearningEvent(event: LearningEvent): void {
  getDb().prepare(`
    INSERT INTO learning_events (id, incident_id, stage, memory_retrieved, decision_influenced, lesson_created, memory_retained)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    event.id,
    event.incidentId,
    event.stage,
    event.memoryRetrieved || null,
    event.decisionInfluenced || null,
    event.lessonCreated || null,
    event.memoryRetained || null
  );
}

export function getLearningEvents(): LearningEvent[] {
  const rows = getDb().prepare('SELECT * FROM learning_events ORDER BY created_at DESC LIMIT 50').all() as any[];
  return rows.map(r => ({
    id: r.id,
    incidentId: r.incident_id,
    stage: r.stage,
    memoryRetrieved: r.memory_retrieved,
    decisionInfluenced: r.decision_influenced,
    lessonCreated: r.lesson_created,
    memoryRetained: r.memory_retained,
    timestamp: r.created_at
  }));
}

export function resetDemoDatabase(): void {
  const database = getDb();
  database.exec('DELETE FROM incidents');
  database.exec('DELETE FROM incident_events');
  database.exec('DELETE FROM response_actions');
  database.exec('DELETE FROM postmortems');
  database.exec('DELETE FROM learning_events');
  database.exec('DELETE FROM demo_runs');
  seedInitialIncidents();
}

function formatIncidentRow(row: any): Incident {
  return {
    id: row.id,
    title: row.title,
    service: row.service,
    severity: row.severity,
    status: row.status,
    detectedAt: row.detected_at,
    resolvedAt: row.resolved_at || undefined,
    impact: row.impact,
    symptoms: safeParse(row.symptoms, []),
    metrics: safeParse(row.metrics, {
      latencyP95: 0, latencyP99: 0, errorRate: 0, connectionSaturation: 0, throughputRps: 0, cpuUtilization: 0
    }),
    logs: safeParse(row.logs, []),
    currentEvidence: safeParse(row.current_evidence, {}),
    timeline: safeParse(row.timeline, []),
    rootCauseHypotheses: safeParse(row.root_cause_hypotheses, undefined),
    recommendedActions: safeParse(row.recommended_actions, undefined),
    memoryInfluence: safeParse(row.memory_influence, undefined),
    postmortem: safeParse(row.postmortem, undefined),
    hasMemoryMatch: Boolean(row.has_memory_match)
  };
}

function safeParse(val: any, fallback: any) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}
