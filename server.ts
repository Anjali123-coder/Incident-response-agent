import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { initDatabase, getAllIncidents, getIncidentById, resetDemoDatabase, getLearningEvents } from './server/db.ts';
import { hindsightService } from './server/hindsight.ts';
import { groqService } from './server/groq.ts';
import { agent } from './server/agent.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize SQLite database
initDatabase();

// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    let dbStatus: { connected: boolean; engine: string; error?: string } = { connected: true, engine: 'SQLite 3 (node:sqlite)' };
    try {
      const test = getAllIncidents();
      if (!Array.isArray(test)) throw new Error('DB query failed');
    } catch (e: any) {
      dbStatus = { connected: false, engine: 'SQLite', error: e.message };
    }

    const [hindsightStatus, groqStatus] = await Promise.all([
      hindsightService.healthCheck(),
      groqService.healthCheck()
    ]);

    const isSystemOperational = dbStatus.connected;

    res.json({
      status: isSystemOperational ? 'OPERATIONAL' : 'DEGRADED',
      database: dbStatus,
      hindsight: hindsightStatus,
      groq: groqStatus,
      simulationMode: true,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'DEGRADED',
      error: err.message,
      simulationMode: true
    });
  }
});

// ----------------------------------------------------
// Incidents Endpoints
// ----------------------------------------------------
app.get('/api/incidents', (req, res) => {
  try {
    const incidents = getAllIncidents();
    res.json(incidents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/incidents/:id', (req, res) => {
  try {
    const incident = getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: `Incident ${req.params.id} not found` });
    }
    res.json(incident);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents/:id/analyze', async (req, res) => {
  try {
    const result = await agent.investigateIncident(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/incidents/:id/memory', async (req, res) => {
  try {
    const incident = getIncidentById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const query = `${incident.title} ${incident.service} ${incident.symptoms.join(' ')}`;
    const recalled = await hindsightService.recallMemories(query, 5);
    res.json(recalled);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/incidents/:id/timeline', (req, res) => {
  try {
    const incident = getIncidentById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    res.json(incident.timeline);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/incidents/:id/recommendations', (req, res) => {
  try {
    const incident = getIncidentById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    res.json(incident.recommendedActions || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents/:id/simulate', async (req, res) => {
  try {
    const actionId = req.body.actionId;
    const result = await agent.simulateAction(req.params.id, actionId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents/:id/resolve', async (req, res) => {
  try {
    const result = await agent.resolveIncident(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents/:id/postmortem', async (req, res) => {
  try {
    const pm = await agent.generatePostmortem(req.params.id);
    res.json(pm);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents/:id/learn', async (req, res) => {
  try {
    const result = await agent.teachIncidentMind(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Organizational Memory Endpoints
// ----------------------------------------------------
app.get('/api/memory', (req, res) => {
  try {
    const memories = hindsightService.getAllMemories();
    res.json(memories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memory/recall', async (req, res) => {
  try {
    const query = req.body.query || '';
    const result = await hindsightService.recallMemories(query, req.body.maxResults || 6);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/learning', (req, res) => {
  try {
    const events = getLearningEvents();
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Demo Control Endpoints
// ----------------------------------------------------
app.post('/api/demo/reset', (req, res) => {
  try {
    resetDemoDatabase();
    res.json({ message: 'Demo environment reset successfully', ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Frontend Mounting & Server Initialization
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`INCIDENTMIND server online at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});
