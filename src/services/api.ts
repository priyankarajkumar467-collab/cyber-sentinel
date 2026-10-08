import {
  SystemStats,
  AlertItem,
  PipelineExecutionResult,
  AlertStatus,
  ThreatClass,
  RiskSeverity,
} from '../types/sentinel';

// Baseline default dataset for static deployment (e.g. GitHub Pages)
const DEFAULT_ALERTS: AlertItem[] = [
  {
    alert_id: 'ALT-1094',
    timestamp: '19:35:02',
    source_ip: '192.168.1.99',
    destination_ip: '198.51.100.42',
    classification: 'Data Exfiltration',
    risk_score: 91,
    evidence_features: JSON.stringify({
      bullets: [
        'Large outbound transfer of 850 MB to external IP',
        'Unusual external destination (198.51.100.42)',
        'High egress byte ratio (98.4% outbound)',
        'Encrypted channel outside typical working hours',
      ],
      metrics: {
        outbound_mb: 850,
        unique_ports: 1,
        failed_logins: 0,
        conn_rate_per_sec: 142,
        anomaly_score: 0.94,
        confidence: 'High (97%)',
      },
      technical: {
        isolation_forest_anomaly_score: 0.94,
        isolation_forest_path_length: 3.12,
        threat_confidence_percent: 97,
        features_summary: {
          dest_port_diversity: 1,
          conn_rate_per_sec: 142,
          failed_logins: 0,
          outbound_mb: 850,
          egress_ratio_percent: 98,
        },
      },
    }),
    ai_explanation:
      'The internal host transferred an abnormally high volume of encrypted outbound data to an external address, matching data exfiltration behavior.',
    status: 'New',
  },
  {
    alert_id: 'ALT-1093',
    timestamp: '19:33:10',
    source_ip: '192.168.1.88',
    destination_ip: '10.0.1.20',
    classification: 'Lateral Movement',
    risk_score: 74,
    evidence_features: JSON.stringify({
      bullets: [
        'Sequential administrative SMB and RPC probing across subnet',
        'Access attempts to 10.0.1.20 and 10.0.1.25 within 40 seconds',
        'Service account authentication from non-standard workstation',
        'Internal reconnaissance pattern detected',
      ],
      metrics: {
        outbound_mb: 2.4,
        unique_ports: 5,
        failed_logins: 3,
        conn_rate_per_sec: 18,
        anomaly_score: 0.78,
        confidence: 'High (88%)',
      },
      technical: {
        isolation_forest_anomaly_score: 0.78,
        isolation_forest_path_length: 4.25,
        threat_confidence_percent: 88,
        features_summary: {
          dest_port_diversity: 5,
          conn_rate_per_sec: 18,
          failed_logins: 3,
          outbound_mb: 2.4,
          egress_ratio_percent: 45,
        },
      },
    }),
    ai_explanation:
      'Host initiated rapid SMB/RPC connections across internal subnets, characteristic of internal lateral movement and network enumeration.',
    status: 'Reviewed',
  },
  {
    alert_id: 'ALT-1092',
    timestamp: '19:32:14',
    source_ip: '192.168.1.24',
    destination_ip: '10.0.0.15',
    classification: 'Port Scan',
    risk_score: 82,
    evidence_features: JSON.stringify({
      bullets: [
        '42 unique destination ports probed',
        'High connection rate of 25 connections within 30 seconds',
        'Sequential TCP SYN packets with zero payload return',
        'Behavior differs significantly from normal baseline',
      ],
      metrics: {
        outbound_mb: 0.8,
        unique_ports: 42,
        failed_logins: 0,
        conn_rate_per_sec: 25,
        anomaly_score: 0.86,
        confidence: 'High (94%)',
      },
      technical: {
        isolation_forest_anomaly_score: 0.86,
        isolation_forest_path_length: 3.82,
        threat_confidence_percent: 94,
        features_summary: {
          dest_port_diversity: 42,
          conn_rate_per_sec: 25,
          failed_logins: 0,
          outbound_mb: 0.8,
          egress_ratio_percent: 15,
        },
      },
    }),
    ai_explanation:
      'The source contacted a large number of ports within a short period. This behavior is consistent with port scanning.',
    status: 'New',
  },
  {
    alert_id: 'ALT-1091',
    timestamp: '19:30:05',
    source_ip: '192.168.1.15',
    destination_ip: '10.0.0.8',
    classification: 'Brute Force',
    risk_score: 68,
    evidence_features: JSON.stringify({
      bullets: [
        '37 failed authentication attempts within 60 seconds',
        'Targeted SSH port 22 with dictionary password signatures',
        'Rapid reconnection frequency from single source IP',
        'Zero successful sessions established',
      ],
      metrics: {
        outbound_mb: 0.4,
        unique_ports: 1,
        failed_logins: 37,
        conn_rate_per_sec: 12,
        anomaly_score: 0.72,
        confidence: 'High (91%)',
      },
      technical: {
        isolation_forest_anomaly_score: 0.72,
        isolation_forest_path_length: 4.88,
        threat_confidence_percent: 91,
        features_summary: {
          dest_port_diversity: 1,
          conn_rate_per_sec: 12,
          failed_logins: 37,
          outbound_mb: 0.4,
          egress_ratio_percent: 22,
        },
      },
    }),
    ai_explanation:
      'Repeated failed login attempts on port 22 indicate an automated credential brute force attack.',
    status: 'New',
  },
  {
    alert_id: 'ALT-1090',
    timestamp: '19:28:14',
    source_ip: '192.168.1.41',
    destination_ip: '10.0.0.5',
    classification: 'Normal',
    risk_score: 12,
    evidence_features: JSON.stringify({
      bullets: [
        'Standard HTTPS web session to trusted application server',
        'Zero authentication errors',
        'Traffic profile matches historical baseline',
        'Typical packet length distribution',
      ],
      metrics: {
        outbound_mb: 1.2,
        unique_ports: 1,
        failed_logins: 0,
        conn_rate_per_sec: 1.8,
        anomaly_score: 0.12,
        confidence: 'High (99%)',
      },
      technical: {
        isolation_forest_anomaly_score: 0.12,
        isolation_forest_path_length: 7.22,
        threat_confidence_percent: 99,
        features_summary: {
          dest_port_diversity: 1,
          conn_rate_per_sec: 1.8,
          failed_logins: 0,
          outbound_mb: 1.2,
          egress_ratio_percent: 35,
        },
      },
    }),
    ai_explanation:
      'Connection pattern, protocol usage, and data rates are consistent with benign routine business applications.',
    status: 'Resolved',
  },
];

// Local state helpers for static environments
const STORAGE_KEY_ALERTS = 'cyber_sentinel_alerts';
const STORAGE_KEY_POLICY = 'cyber_sentinel_policy_threshold';

function getStoredAlerts(): AlertItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return [...DEFAULT_ALERTS];
}

function saveStoredAlerts(alerts: AlertItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
  } catch (e) {
    // ignore
  }
}

function getStoredPolicy(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POLICY);
    if (raw) return Number(raw) || 70;
  } catch (e) {
    // ignore
  }
  return 70;
}

function saveStoredPolicy(threshold: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_POLICY, threshold.toString());
  } catch (e) {
    // ignore
  }
}

function computeStaticStats(alerts: AlertItem[]): SystemStats {
  const policyThreshold = getStoredPolicy();
  let highestRisk = 0;
  let newThreats = 0;

  let port_scan = 12;
  let brute_force = 7;
  let lateral_movement = 4;
  let data_exfiltration = 2;
  let normal = 12455;

  for (const a of alerts) {
    if (a.risk_score > highestRisk) {
      highestRisk = a.risk_score;
    }
    if (a.classification !== 'Normal' && a.status === 'New') {
      newThreats++;
    }
    if (a.classification === 'Port Scan') port_scan++;
    else if (a.classification === 'Brute Force') brute_force++;
    else if (a.classification === 'Lateral Movement') lateral_movement++;
    else if (a.classification === 'Data Exfiltration') data_exfiltration++;
    else normal++;
  }

  const total = normal + port_scan + brute_force + lateral_movement + data_exfiltration;
  const threats = port_scan + brute_force + lateral_movement + data_exfiltration;

  return {
    total_events: total,
    threats_detected: threats,
    current_risk: highestRisk > 0 ? highestRisk : 72,
    system_status: highestRisk >= policyThreshold || newThreats > 0 ? 'Threat Detected' : 'Monitoring',
    last_updated: '10 seconds ago',
    threat_counts: {
      normal,
      port_scan,
      brute_force,
      lateral_movement,
      data_exfiltration,
    },
    behavioral_summary: {
      connection_activity: highestRisk >= 75 ? 'High' : highestRisk >= 40 ? 'Moderate' : 'Normal',
      failed_logins: 37,
      destination_diversity: 42,
      outbound_data_mb: 850,
      traffic_pattern: highestRisk >= 70 ? 'Unusual' : 'Baseline',
    },
    policy_threshold: policyThreshold,
  };
}

// ---------------- Public API Methods with Seamless Fallback ----------------

export async function fetchStats(): Promise<SystemStats> {
  try {
    const res = await fetch('/api/statistics');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend unavailable, fallback to static computation
  }
  return computeStaticStats(getStoredAlerts());
}

export async function fetchAlerts(limit = 100): Promise<AlertItem[]> {
  try {
    const res = await fetch(`/api/alerts?limit=${limit}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }
  return getStoredAlerts().slice(0, limit);
}

export async function fetchAlertById(id: string): Promise<AlertItem> {
  try {
    const res = await fetch(`/api/alerts/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }
  const alerts = getStoredAlerts();
  const found = alerts.find((a) => a.alert_id === id);
  if (!found) throw new Error('Alert not found.');
  return found;
}

export async function updateAlertStatus(id: string, status: AlertStatus): Promise<boolean> {
  try {
    const res = await fetch(`/api/alerts/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return true;
  } catch (err) {
    // Fallback
  }
  const alerts = getStoredAlerts();
  const updated = alerts.map((a) => (a.alert_id === id ? { ...a, status } : a));
  saveStoredAlerts(updated);
  return true;
}

export async function runDemoScenario(
  scenario: 'normal' | 'port_scan' | 'brute_force' | 'data_exfiltration'
): Promise<PipelineExecutionResult> {
  try {
    const res = await fetch('/api/demo/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }

  // Deterministic in-browser scenario evaluation
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const alertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;

  let classification: ThreatClass = 'Normal';
  let riskScore = 18;
  let severity: RiskSeverity = 'Normal';
  let sourceIp = '192.168.1.41';
  let destIp = '10.0.0.5';
  let evidenceBullets: string[] = [];
  let explanation = '';

  switch (scenario) {
    case 'port_scan':
      classification = 'Port Scan';
      riskScore = 82;
      severity = 'Malicious';
      sourceIp = '192.168.1.24';
      destIp = '10.0.0.15';
      evidenceBullets = [
        '42 unique destination ports probed',
        'High connection rate (25 connections within 30 seconds)',
        'Rapid TCP SYN scan profile',
        'Behavior differs from normal activity',
      ];
      explanation =
        'The source contacted a large number of ports within a short period. This behavior is consistent with port scanning.';
      break;

    case 'brute_force':
      classification = 'Brute Force';
      riskScore = 76;
      severity = 'Malicious';
      sourceIp = '192.168.1.15';
      destIp = '10.0.0.8';
      evidenceBullets = [
        '37 failed logins within 60 seconds',
        'Repeated authentication attempts on SSH port 22',
        'Rapid reconnection frequency',
        'Zero successful sessions established',
      ];
      explanation =
        'Multiple failed authentication attempts were detected from this host in rapid succession, typical of automated password guessing.';
      break;

    case 'data_exfiltration':
      classification = 'Data Exfiltration';
      riskScore = 91;
      severity = 'Malicious';
      sourceIp = '192.168.1.99';
      destIp = '198.51.100.42';
      evidenceBullets = [
        'Large outbound transfer (850 MB)',
        'Unusual external destination (198.51.100.42)',
        'Abnormal traffic volume and duration',
        'High egress ratio (98.4% outbound)',
      ];
      explanation =
        'An abnormally high volume of data was transferred outbound to an external destination, indicating potential unauthorized data exfiltration.';
      break;

    case 'normal':
    default:
      classification = 'Normal';
      riskScore = 18;
      severity = 'Normal';
      sourceIp = '192.168.1.41';
      destIp = '10.0.0.5';
      evidenceBullets = [
        'Standard HTTPS session',
        'Zero authentication failures',
        'Traffic volume aligns with established enterprise baseline',
        'Expected port and destination behavior',
      ];
      explanation =
        'Network telemetry demonstrates normal operational parameters without statistical anomalies or attack signatures.';
      break;
  }

  const policyThreshold = getStoredPolicy();
  const policyBreached = riskScore >= policyThreshold;
  const status: AlertStatus = severity === 'Normal' ? 'Resolved' : 'New';

  const newAlert: AlertItem = {
    alert_id: alertId,
    timestamp: timeStr,
    source_ip: sourceIp,
    destination_ip: destIp,
    classification,
    risk_score: riskScore,
    evidence_features: JSON.stringify({
      bullets: evidenceBullets,
      metrics: {
        outbound_mb: scenario === 'data_exfiltration' ? 850 : 1.2,
        unique_ports: scenario === 'port_scan' ? 42 : 1,
        failed_logins: scenario === 'brute_force' ? 37 : 0,
        conn_rate_per_sec: scenario === 'port_scan' ? 25 : 2,
        anomaly_score: riskScore / 100,
        confidence: '95%',
      },
    }),
    ai_explanation: explanation,
    status,
  };

  const stored = getStoredAlerts();
  saveStoredAlerts([newAlert, ...stored]);

  return {
    alert_id: alertId,
    timestamp: timeStr,
    source_ip: sourceIp,
    destination_ip: destIp,
    classification,
    risk_score: riskScore,
    severity,
    evidence_bullets: evidenceBullets,
    ai_explanation: explanation,
    policy_breached: policyBreached,
    policy_threshold: policyThreshold,
    policy_message: policyBreached
      ? `A detected threat (${riskScore}/100) exceeded the configured maximum risk level (${policyThreshold}).`
      : `Risk level (${riskScore}/100) is within configured security guardrails.`,
    status,
    steps: {
      telemetry: { status: 'success', summary: `Received packet telemetry from ${sourceIp}` },
      feature_analysis: { status: 'success', summary: 'Extracted behavioral telemetry features', features: {} },
      anomaly_detection: {
        status: severity === 'Malicious' ? 'alert' : 'success',
        summary: severity === 'Malicious' ? 'Isolation Forest flagged behavioral anomaly' : 'Baseline pattern verified',
        anomaly: {},
      },
      threat_classification: {
        status: 'success',
        summary: `Classified as ${classification} (95% confidence)`,
        classification: {},
      },
      risk_score: {
        status: severity === 'Malicious' ? 'alert' : 'success',
        summary: `Risk calculated at ${riskScore}/100 (${severity})`,
        risk: {},
      },
      security_decision: {
        status: policyBreached ? 'breach' : 'success',
        summary: policyBreached ? 'Policy breach: manual analyst review required' : 'Guardrail satisfied',
      },
    },
  };
}

export async function analyzeTelemetryData(
  data: any
): Promise<PipelineExecutionResult | { results: PipelineExecutionResult[] }> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }

  // Parse batch or single
  const events = Array.isArray(data)
    ? data
    : data.events && Array.isArray(data.events)
    ? data.events
    : [data];

  const results: PipelineExecutionResult[] = [];
  for (const ev of events) {
    let scenarioType: 'normal' | 'port_scan' | 'brute_force' | 'data_exfiltration' = 'normal';
    if ((ev.unique_ports && ev.unique_ports >= 15) || (ev.tcp_flags && ev.tcp_flags.includes('SYN'))) {
      scenarioType = 'port_scan';
    } else if (ev.failed_logins && ev.failed_logins >= 10) {
      scenarioType = 'brute_force';
    } else if ((ev.byte_count && ev.byte_count > 50000000) || (ev.outbound_bytes && ev.outbound_bytes > 50000000)) {
      scenarioType = 'data_exfiltration';
    }
    const r = await runDemoScenario(scenarioType);
    results.push(r);
  }

  return { results };
}

export async function updatePolicyThreshold(
  threshold: number
): Promise<{ success: boolean; max_allowed_risk: number }> {
  try {
    const res = await fetch('/api/policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_allowed_risk: threshold }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  saveStoredPolicy(threshold);
  return { success: true, max_allowed_risk: threshold };
}

export async function resetDatabase(): Promise<void> {
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      localStorage.removeItem(STORAGE_KEY_ALERTS);
      localStorage.removeItem(STORAGE_KEY_POLICY);
      return;
    }
  } catch (err) {
    // Fallback
  }
  localStorage.removeItem(STORAGE_KEY_ALERTS);
  localStorage.removeItem(STORAGE_KEY_POLICY);
}

// ---------------- GitHub Direct API Methods ----------------

export interface GitHubPushPayload {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  isNewRepo?: boolean;
  isPrivate?: boolean;
  commitMessage?: string;
}

export interface GitHubPushResponse {
  success: boolean;
  repo_name: string;
  owner: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  repo_url: string;
  files_count: number;
}

export async function fetchGitHubPreview(): Promise<{
  files_count: number;
  file_paths: string[];
  excluded: string[];
}> {
  try {
    const res = await fetch('/api/github/preview');
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return {
    files_count: 42,
    file_paths: [
      '.github/workflows/deploy.yml',
      '.env.example',
      '.gitignore',
      'README.md',
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'index.html',
      'server.ts',
      'requirements.txt',
      'data/demo_telemetry.csv',
      'src/App.tsx',
      'src/main.tsx',
      'src/index.css',
      'src/types/sentinel.ts',
      'src/services/api.ts',
      'src/components/Navbar.tsx',
      'src/components/SummaryCards.tsx',
      'src/components/RiskBar.tsx',
      'src/components/AlertsTable.tsx',
      'src/components/ThreatDetailPanel.tsx',
      'src/components/ThreatCategories.tsx',
      'src/components/BehaviorAnalysis.tsx',
      'src/components/DetectionPipeline.tsx',
      'src/components/PolicyGuardrail.tsx',
      'src/components/DemoRunner.tsx',
      'src/components/TelemetryUploader.tsx',
      'src/components/GitHubModal.tsx',
      'src/pages/DashboardPage.tsx',
      'src/pages/AlertsPage.tsx',
      'src/pages/AnalyzePage.tsx',
      'src/pages/AboutPage.tsx',
      'backend/main.py',
      'backend/database/db.ts',
      'backend/feature_engineering/features.ts',
      'backend/detection/isolation_forest.ts',
      'backend/models/threat_classifier.ts',
      'backend/services/risk_engine.ts',
      'backend/services/evidence_generator.ts',
      'backend/services/pipeline.ts',
      'backend/services/github_service.ts',
    ],
    excluded: ['node_modules', '.env', 'data/*.sqlite', 'dist', 'build', '.git', '*.log'],
  };
}

export async function pushToGitHubApi(payload: GitHubPushPayload): Promise<GitHubPushResponse> {
  const res = await fetch('/api/github/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return await res.json();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.error || 'Failed to push to GitHub.');
}
