import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';
import {
  getAllAlerts,
  getAlertById,
  updateAlertStatus,
  getStatistics,
  getPolicyThreshold,
  setPolicyThreshold,
  resetDatabase,
} from './backend/database/db';
import { SecurityPipeline } from './backend/services/pipeline';
import { RawTelemetryEvent } from './backend/feature_engineering/features';
import { collectProjectFiles, pushToGitHub } from './backend/services/github_service';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'CYBER SENTINEL',
    version: '1.0.0',
    monitoring: true,
    timestamp: new Date().toISOString(),
  });
});

// 2. Statistics
app.get('/api/statistics', (_req: Request, res: Response) => {
  try {
    const stats = getStatistics();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve system statistics.' });
  }
});

// 3. Alerts list
app.get('/api/alerts', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const alerts = getAllAlerts(limit);
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve alerts list.' });
  }
});

// 4. Alert detail
app.get('/api/alerts/:id', (req: Request, res: Response) => {
  try {
    const alert = getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }
    res.json(alert);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve alert details.' });
  }
});

// 5. Update alert status (Reviewed / Resolved)
app.patch('/api/alerts/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['New', 'Reviewed', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be New, Reviewed, or Resolved.' });
    }
    const success = updateAlertStatus(req.params.id, status);
    if (!success) {
      return res.status(404).json({ error: 'Alert not found to update.' });
    }
    res.json({ success: true, alert_id: req.params.id, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update alert status.' });
  }
});

// 6. Security policy threshold GET/POST
app.get('/api/policy', (_req: Request, res: Response) => {
  try {
    const threshold = getPolicyThreshold();
    const stats = getStatistics();
    res.json({
      max_allowed_risk: threshold,
      current_highest_risk: stats.current_risk,
      breached: stats.current_risk >= threshold,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch policy threshold.' });
  }
});

app.post('/api/policy', (req: Request, res: Response) => {
  try {
    const { max_allowed_risk } = req.body;
    const val = Number(max_allowed_risk);
    if (isNaN(val) || val < 10 || val > 100) {
      return res.status(400).json({ error: 'Policy threshold must be a number between 10 and 100.' });
    }
    setPolicyThreshold(val);
    res.json({ success: true, max_allowed_risk: val });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update policy threshold.' });
  }
});

// 7. Telemetry Analysis (Single or batch with defensive validation)
app.post('/api/analyze', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const events: RawTelemetryEvent[] = Array.isArray(body)
      ? body
      : body.events && Array.isArray(body.events)
      ? body.events
      : [body];

    const results: any[] = [];
    const errors: { index: number; reason: string }[] = [];

    events.forEach((raw, idx) => {
      // Validate with soft error recovery
      if (!raw || typeof raw !== 'object') {
        errors.push({ index: idx, reason: 'Record is empty or not an object.' });
        return;
      }

      try {
        const result = SecurityPipeline.processEvent(raw);
        results.push(result);
      } catch (e: any) {
        errors.push({ index: idx, reason: 'Telemetry processing failed for record.' });
      }
    });

    if (results.length === 0 && errors.length > 0) {
      return res.status(400).json({
        error: 'Unable to analyze provided telemetry data.',
        details: errors,
      });
    }

    // Return single result if input was single item, else batch
    if (!Array.isArray(body) && !body.events && results.length === 1) {
      return res.json({
        ...results[0],
        total_processed: 1,
        skipped_count: errors.length,
      });
    }

    res.json({
      results,
      total_processed: results.length,
      skipped_count: errors.length,
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'An unexpected error occurred during network telemetry analysis.',
    });
  }
});

// 8. Demo scenario execution endpoint
app.post('/api/demo/run', (req: Request, res: Response) => {
  try {
    const { scenario } = req.body; // 'normal' | 'port_scan' | 'brute_force' | 'data_exfiltration'

    let demoEvent: RawTelemetryEvent;

    switch (scenario) {
      case 'normal':
        demoEvent = {
          timestamp: new Date().toTimeString().split(' ')[0],
          source_ip: '192.168.1.41',
          destination_ip: '10.0.0.5',
          dest_port: 443,
          protocol: 'HTTPS',
          packet_count: 24,
          byte_count: 14500,
          failed_logins: 0,
          conn_duration_sec: 15.0,
          tcp_flags: 'ACK',
          unique_ports: 1,
        };
        break;

      case 'port_scan':
        demoEvent = {
          timestamp: new Date().toTimeString().split(' ')[0],
          source_ip: '192.168.1.24',
          destination_ip: '10.0.0.15',
          dest_port: 80,
          protocol: 'TCP',
          packet_count: 750,
          byte_count: 30000,
          failed_logins: 0,
          conn_duration_sec: 30.0,
          tcp_flags: 'SYN',
          unique_ports: 42,
        };
        break;

      case 'brute_force':
        demoEvent = {
          timestamp: new Date().toTimeString().split(' ')[0],
          source_ip: '192.168.1.15',
          destination_ip: '10.0.0.8',
          dest_port: 22,
          protocol: 'SSH',
          packet_count: 180,
          byte_count: 42000,
          failed_logins: 37,
          conn_duration_sec: 25.0,
          tcp_flags: 'SYN-ACK',
          unique_ports: 1,
        };
        break;

      case 'data_exfiltration':
      default:
        demoEvent = {
          timestamp: new Date().toTimeString().split(' ')[0],
          source_ip: '192.168.1.99',
          destination_ip: '198.51.100.42',
          dest_port: 443,
          protocol: 'HTTPS',
          packet_count: 18500,
          byte_count: 891289600, // ~850MB
          failed_logins: 0,
          conn_duration_sec: 120.0,
          tcp_flags: 'ACK',
          unique_ports: 1,
          outbound_bytes: 891289600,
          inbound_bytes: 1200000,
        };
        break;
    }

    const result = SecurityPipeline.processEvent(demoEvent);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to run demo scenario.' });
  }
});

// 9. Reset database
app.post('/api/reset', (_req: Request, res: Response) => {
  try {
    resetDatabase();
    res.json({ success: true, message: 'Sentinel SQLite database reset to baseline demo state.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset database.' });
  }
});

// 10. GitHub Export Preview
app.get('/api/github/preview', (_req: Request, res: Response) => {
  try {
    const files = collectProjectFiles();
    res.json({
      files_count: files.length,
      file_paths: files.map((f) => f.path),
      excluded: ['node_modules', '.env', 'data/*.sqlite', 'dist', 'build', '.git', '*.log'],
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to preview project files.' });
  }
});

// 11. GitHub Push to Repository
app.post('/api/github/push', async (req: Request, res: Response) => {
  try {
    const { token, owner, repo, branch, isNewRepo, isPrivate, commitMessage } = req.body;

    if (!token || !token.trim()) {
      return res.status(400).json({ error: 'GitHub Personal Access Token is required.' });
    }
    if (!owner || !owner.trim()) {
      return res.status(400).json({ error: 'GitHub username or organization is required.' });
    }
    if (!repo || !repo.trim()) {
      return res.status(400).json({ error: 'Repository name is required.' });
    }

    const result = await pushToGitHub({
      token,
      owner,
      repo,
      branch: branch || 'main',
      isNewRepo: Boolean(isNewRepo),
      isPrivate: Boolean(isPrivate),
      commitMessage: commitMessage || 'Initial commit: CYBER SENTINEL Intelligent Cyber Threat Detection',
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to push to GitHub.' });
  }
});

// Start server with Vite middleware
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      base: '/',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use('/cyber-sentinel', express.static(distPath));
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYBER SENTINEL] Real-Time Threat Sentinel live on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
