import { MemoryCategory, OrganizationalMemory } from '../src/types.ts';

const HINDSIGHT_BASE_URL = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY || '';
const HINDSIGHT_BANK_ID = process.env.HINDSIGHT_BANK_ID || '';

// In-memory deduplication set to protect free credits
const retainedDocumentIds = new Set<string>();

// Memory recall cache: query -> { timestamp, results }
const recallCache = new Map<string, { timestamp: number; results: OrganizationalMemory[] }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Initial Organizational Memory Bank (Baseline knowledge)
const ORGANIZATIONAL_MEMORY_STORE: OrganizationalMemory[] = [
  {
    id: 'hs_mem_inc024_master',
    type: 'INCIDENT',
    incidentId: 'INC-024',
    service: 'user-db-primary',
    lesson: 'Check connection saturation and shift read traffic before executing broad service restarts.',
    outcome: 'Resolved in 28 minutes by tuning PgBouncer pool to 750 and shifting 60% read traffic to read-replica.',
    timestamp: '2026-09-15T14:48:00Z',
    relevance: 91,
    details: 'During high-volume reporting, connection pool saturated at 96% with P95 latency rising to 2.8s. Prior attempts to restart frontend services in INC-011 caused cold-start downtime. Resolving PgBouncer connection queue directly restored latency to 0.9s.',
    bankId: HINDSIGHT_BANK_ID || 'demo-prod-bank',
    source: 'cached_demo',
    tags: ['database', 'connection-pool', 'pgbouncer', 'latency']
  },
  {
    id: 'hs_mem_inc024_success',
    type: 'SUCCESSFUL_RESPONSE',
    incidentId: 'INC-024',
    service: 'user-db-primary',
    lesson: 'Connection pool remediation + read traffic shift resolved DB saturation without service downtime.',
    outcome: 'Latency dropped from 2.8s to 0.9s; connection saturation fell from 96% to 61%.',
    timestamp: '2026-09-15T14:40:00Z',
    relevance: 87,
    details: 'Remediation sequence: 1) Shifted read-heavy analytics queries to replica pool. 2) Reclaimed idle client sessions (idle_in_transaction_session_timeout = 30s). 3) Increased PgBouncer pool ceiling.',
    bankId: HINDSIGHT_BANK_ID || 'demo-prod-bank',
    source: 'cached_demo',
    tags: ['remediation', 'read-traffic', 'pgbouncer']
  },
  {
    id: 'hs_mem_inc024_failed',
    type: 'FAILED_RESPONSE',
    incidentId: 'INC-024',
    service: 'user-db-primary',
    lesson: 'Restarting unrelated upstream services (API gateway, web frontend) failed to clear connection saturation.',
    outcome: 'Failed; exacerbated client retry storm and lengthened outage by 12 minutes.',
    timestamp: '2026-09-15T14:26:00Z',
    relevance: 84,
    details: 'Attempting to bounce ingress or application pods when the root constraint is downstream DB connection queue starvation creates thundering herd reconnection storms.',
    bankId: HINDSIGHT_BANK_ID || 'demo-prod-bank',
    source: 'cached_demo',
    tags: ['anti-pattern', 'restart-failure', 'thundering-herd']
  },
  {
    id: 'hs_mem_inc024_lesson',
    type: 'LESSON',
    incidentId: 'INC-024',
    service: 'user-db-primary',
    lesson: 'Prioritize connection saturation analysis before restarting services in API latency regressions.',
    outcome: 'Architectural rule codified in IncidentMind organizational memory bank.',
    timestamp: '2026-09-15T15:00:00Z',
    relevance: 93,
    details: 'Whenever API latency rises alongside elevated database connection allocation (>85%), suppress service restart recommendations and prompt immediate connection pool inspection.',
    bankId: HINDSIGHT_BANK_ID || 'demo-prod-bank',
    source: 'cached_demo',
    tags: ['rule', 'decision-guardrail', 'latency-regression']
  },
  {
    id: 'hs_mem_inc019_runbook',
    type: 'RUNBOOK',
    incidentId: 'INC-019',
    service: 'billing-engine',
    lesson: 'Canary release NullPointerExceptions mandate instant traffic diversion, not in-pod hotfixes.',
    outcome: 'Canary diversion completed in 90 seconds, containing blast radius to under 50 customer requests.',
    timestamp: '2026-08-11T09:15:00Z',
    relevance: 62,
    details: 'Automated weight shifting to 0% on canary ingress target when 5xx error rate exceeds 5% during first 10 minutes of rollout.',
    bankId: HINDSIGHT_BANK_ID || 'demo-prod-bank',
    source: 'cached_demo',
    tags: ['canary', 'rollback', 'circuit-breaker']
  },
  {
    id: 'hs_mem_inc014_cache',
    type: 'POSTMORTEM',
    incidentId: 'INC-014',
    service: 'redis-session-store',
    lesson: 'Unbounded key allocation without TTL induces maxmemory eviction storms; use namespace quotas.',
    outcome: 'Added mandatory TTL validator to redis client interceptor pipeline.',
    timestamp: '2026-07-28T18:00:00Z',
    relevance: 58,
    details: 'Redis memory eviction cascade starved authentication workers. Postmortem mandated key TTL checks and alert on volatile-lru eviction count > 500/s.',
    bankId: HINDSIGHT_BANK_ID || 'demo-prod-bank',
    source: 'cached_demo',
    tags: ['redis', 'cache-stampede', 'ttl']
  }
];

export class HindsightService {
  private hasApiKey: boolean;
  private hasBankId: boolean;

  constructor() {
    this.hasApiKey = Boolean(HINDSIGHT_API_KEY && HINDSIGHT_API_KEY.trim() !== '');
    this.hasBankId = Boolean(HINDSIGHT_BANK_ID && HINDSIGHT_BANK_ID.trim() !== '');
  }

  async healthCheck(): Promise<{
    connected: boolean;
    bankId: string;
    message: string;
    usingRealKey: boolean;
  }> {
    if (!this.hasApiKey || !this.hasBankId) {
      return {
        connected: false,
        bankId: HINDSIGHT_BANK_ID || 'not-configured',
        message: 'HINDSIGHT_API_KEY or HINDSIGHT_BANK_ID not set. Running in verified cached demo memory mode.',
        usingRealKey: false
      };
    }

    try {
      const url = `${HINDSIGHT_BASE_URL}/v1/default/banks/${HINDSIGHT_BANK_ID}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HINDSIGHT_API_KEY}`,
          'X-API-Key': HINDSIGHT_API_KEY,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return {
          connected: true,
          bankId: HINDSIGHT_BANK_ID,
          message: 'Hindsight Cloud Memory Bank Connected',
          usingRealKey: true
        };
      }

      // If bank doesn't exist or returns 404/401
      return {
        connected: false,
        bankId: HINDSIGHT_BANK_ID,
        message: `Hindsight Cloud returned HTTP ${response.status}: ${response.statusText}`,
        usingRealKey: true
      };
    } catch (err: any) {
      return {
        connected: false,
        bankId: HINDSIGHT_BANK_ID,
        message: `Hindsight network check failed: ${err.message || 'Timeout'}`,
        usingRealKey: true
      };
    }
  }

  async recallMemories(query: string, maxResults: number = 4): Promise<{
    memories: OrganizationalMemory[];
    source: 'hindsight' | 'cached_demo';
    message: string;
  }> {
    const cleanQuery = query.toLowerCase().trim();

    // Check cache to save credits and latency
    const cached = recallCache.get(cleanQuery);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return {
        memories: cached.results.slice(0, maxResults),
        source: this.hasApiKey ? 'hindsight' : 'cached_demo',
        message: 'Recalled from local deduplication cache'
      };
    }

    // If real API key is configured, perform real recall
    if (this.hasApiKey && this.hasBankId) {
      try {
        const recallUrl = `${HINDSIGHT_BASE_URL}/v1/default/banks/${HINDSIGHT_BANK_ID}/memories/recall`;
        const resp = await fetch(recallUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HINDSIGHT_API_KEY}`,
            'X-API-Key': HINDSIGHT_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            query: query,
            top_k: maxResults
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (resp.ok) {
          const data: any = await resp.json();
          const items = Array.isArray(data.memories) ? data.memories : (Array.isArray(data) ? data : []);
          if (items.length > 0) {
            const transformed: OrganizationalMemory[] = items.map((item: any, idx: number) => ({
              id: item.id || `hs_cloud_${Date.now()}_${idx}`,
              type: (item.metadata?.type || item.context || 'LESSON') as MemoryCategory,
              incidentId: item.metadata?.incidentId || item.document_id || 'INC-HISTORICAL',
              service: item.metadata?.service || 'production',
              lesson: item.content || item.text || item.summary || 'Historical operational insight',
              outcome: item.metadata?.outcome || 'Resolved with past intervention',
              timestamp: item.timestamp || item.created_at || new Date().toISOString(),
              relevance: Math.round((item.score || 0.85) * 100),
              details: item.details || item.content || '',
              bankId: HINDSIGHT_BANK_ID,
              source: 'hindsight'
            }));

            recallCache.set(cleanQuery, { timestamp: Date.now(), results: transformed });
            return {
              memories: transformed.slice(0, maxResults),
              source: 'hindsight',
              message: 'Retrieved fresh memories from Hindsight Cloud bank'
            };
          }
        }
      } catch (err: any) {
        console.warn('Hindsight Cloud recall failed, falling back to verified organizational store:', err.message);
      }
    }

    // Fallback to verified local organizational memory bank with fuzzy matching
    const scored = ORGANIZATIONAL_MEMORY_STORE.map(mem => {
      let score = 50;
      const haystack = (mem.lesson + ' ' + mem.details + ' ' + mem.service + ' ' + (mem.tags || []).join(' ')).toLowerCase();
      const terms = cleanQuery.split(/\s+/).filter(t => t.length > 2);
      let matchCount = 0;
      for (const term of terms) {
        if (haystack.includes(term)) matchCount++;
      }
      if (terms.length > 0) {
        score = Math.min(96, Math.max(55, Math.round(55 + (matchCount / terms.length) * 40)));
      }
      // If query is specifically about connection pool or latency, boost INC-024
      if (cleanQuery.includes('connection') || cleanQuery.includes('latency') || cleanQuery.includes('inc-024') || cleanQuery.includes('inc-027')) {
        if (mem.incidentId === 'INC-024') score = Math.max(score, 87);
      }
      return { ...mem, relevance: score };
    });

    scored.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    const finalMemories = scored.slice(0, maxResults);
    recallCache.set(cleanQuery, { timestamp: Date.now(), results: finalMemories });

    return {
      memories: finalMemories,
      source: 'cached_demo',
      message: this.hasApiKey 
        ? 'SERVICE TEMPORARILY UNAVAILABLE (showing verified cached demo result)'
        : 'CACHED DEMO RESULT (Configure HINDSIGHT_API_KEY for live Cloud bank recall)'
    };
  }

  async retainMemory(params: {
    documentId: string;
    content: string;
    context?: string;
    category: MemoryCategory;
    service: string;
    lesson: string;
    outcome: string;
    incidentId: string;
    tags?: string[];
  }): Promise<{
    memoryId: string;
    source: 'hindsight' | 'cached_demo';
    status: 'CREATED' | 'DUPLICATE_SKIPPED';
    message: string;
  }> {
    // 1. Deduplication check: prevent spamming duplicate memories into Hindsight
    if (retainedDocumentIds.has(params.documentId)) {
      return {
        memoryId: params.documentId,
        source: this.hasApiKey ? 'hindsight' : 'cached_demo',
        status: 'DUPLICATE_SKIPPED',
        message: `Memory with document_id "${params.documentId}" already retained. Duplicate prevention activated.`
      };
    }

    retainedDocumentIds.add(params.documentId);

    // 2. Add to organizational memory store so it immediately surfaces across the UI
    const newMemory: OrganizationalMemory = {
      id: params.documentId,
      type: params.category,
      incidentId: params.incidentId,
      service: params.service,
      lesson: params.lesson,
      outcome: params.outcome,
      timestamp: new Date().toISOString(),
      relevance: 95,
      details: params.content,
      bankId: HINDSIGHT_BANK_ID || 'demo-prod-bank',
      source: this.hasApiKey && this.hasBankId ? 'hindsight' : 'cached_demo',
      tags: params.tags || ['incident-response', 'learned-lesson']
    };

    // Prepend to store
    ORGANIZATIONAL_MEMORY_STORE.unshift(newMemory);

    // Invalidate recall cache
    recallCache.clear();

    // 3. If real credentials exist, call Hindsight Cloud retain API
    if (this.hasApiKey && this.hasBankId) {
      try {
        const retainUrl = `${HINDSIGHT_BASE_URL}/v1/default/banks/${HINDSIGHT_BANK_ID}/memories/retain`;
        const resp = await fetch(retainUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HINDSIGHT_API_KEY}`,
            'X-API-Key': HINDSIGHT_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            document_id: params.documentId,
            content: params.content,
            context: params.context || params.category,
            timestamp: new Date().toISOString()
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (resp.ok) {
          const respData: any = await resp.json();
          return {
            memoryId: respData.id || params.documentId,
            source: 'hindsight',
            status: 'CREATED',
            message: 'Successfully stored new lesson into Hindsight Cloud Bank'
          };
        } else {
          return {
            memoryId: params.documentId,
            source: 'cached_demo',
            status: 'CREATED',
            message: `Hindsight Cloud returned HTTP ${resp.status}. Preserved in organizational memory.`
          };
        }
      } catch (err: any) {
        return {
          memoryId: params.documentId,
          source: 'cached_demo',
          status: 'CREATED',
          message: `Hindsight Cloud call timed out. Preserved in verified organizational memory.`
        };
      }
    }

    return {
      memoryId: params.documentId,
      source: 'cached_demo',
      status: 'CREATED',
      message: 'New organizational memory retained (CACHED DEMO RESULT - Configure HINDSIGHT_API_KEY for live bank sync)'
    };
  }

  getAllMemories(): OrganizationalMemory[] {
    return [...ORGANIZATIONAL_MEMORY_STORE];
  }
}

export const hindsightService = new HindsightService();
