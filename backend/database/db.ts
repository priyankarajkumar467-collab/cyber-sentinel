import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export interface AlertRecord {
  alert_id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  classification: 'Normal' | 'Port Scan' | 'Brute Force' | 'Lateral Movement' | 'Data Exfiltration';
  risk_score: number;
  evidence_features: string; // JSON string with evidence list & metrics
  ai_explanation: string;
  status: 'New' | 'Reviewed' | 'Resolved';
}

export interface SystemStats {
  total_events: number;
  threats_detected: number;
  current_risk: number;
  system_status: 'Monitoring' | 'Threat Detected';
  last_updated: string;
  threat_counts: {
    normal: number;
    port_scan: number;
    brute_force: number;
    lateral_movement: number;
    data_exfiltration: number;
  };
  behavioral_summary: {
    connection_activity: 'Normal' | 'Moderate' | 'High';
    failed_logins: number;
    destination_diversity: number;
    outbound_data_mb: number;
    traffic_pattern: 'Baseline' | 'Unusual' | 'Critical';
  };
  policy_threshold: number;
}

let db: DatabaseSync;

export function getDatabase(): DatabaseSync {
  if (db) return db;

  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'sentinel.sqlite');
  db = new DatabaseSync(dbPath);

  initSchema();
  seedInitialData();
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      alert_id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      source_ip TEXT NOT NULL,
      destination_ip TEXT NOT NULL,
      classification TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      evidence_features TEXT NOT NULL,
      ai_explanation TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('New', 'Reviewed', 'Resolved'))
    );

    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seedInitialData() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM alerts').get() as { count: number };
  if (countRow && countRow.count > 0) {
    return;
  }

  const initialAlerts: AlertRecord[] = [
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
          'Encrypted channel outside typical working hours'
        ],
        metrics: {
          outbound_mb: 850,
          unique_ports: 1,
          failed_logins: 0,
          conn_rate_per_sec: 142,
          anomaly_score: 0.94,
          confidence: 'High (97%)'
        }
      }),
      ai_explanation: 'The internal host transferred an abnormally high volume of encrypted outbound data to an external address, matching data exfiltration behavior.',
      status: 'New'
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
          'Internal reconnaissance pattern detected'
        ],
        metrics: {
          outbound_mb: 2.4,
          unique_ports: 5,
          failed_logins: 3,
          conn_rate_per_sec: 18,
          anomaly_score: 0.78,
          confidence: 'High (88%)'
        }
      }),
      ai_explanation: 'Host initiated rapid SMB/RPC connections across internal subnets, characteristic of internal lateral movement and network enumeration.',
      status: 'Reviewed'
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
          'Behavior differs significantly from normal baseline'
        ],
        metrics: {
          outbound_mb: 0.8,
          unique_ports: 42,
          failed_logins: 0,
          conn_rate_per_sec: 25,
          anomaly_score: 0.86,
          confidence: 'High (94%)'
        }
      }),
      ai_explanation: 'The source contacted a large number of ports within a short period. This behavior is consistent with port scanning.',
      status: 'New'
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
          'Zero successful sessions established'
        ],
        metrics: {
          outbound_mb: 0.4,
          unique_ports: 1,
          failed_logins: 37,
          conn_rate_per_sec: 12,
          anomaly_score: 0.72,
          confidence: 'High (91%)'
        }
      }),
      ai_explanation: 'Repeated failed login attempts on port 22 indicate an automated credential brute force attack.',
      status: 'New'
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
          'Typical packet length distribution'
        ],
        metrics: {
          outbound_mb: 1.2,
          unique_ports: 1,
          failed_logins: 0,
          conn_rate_per_sec: 1.8,
          anomaly_score: 0.12,
          confidence: 'High (99%)'
        }
      }),
      ai_explanation: 'Connection pattern, protocol usage, and data rates are consistent with benign routine business applications.',
      status: 'Resolved'
    }
  ];

  const insert = db.prepare(`
    INSERT INTO alerts (alert_id, timestamp, source_ip, destination_ip, classification, risk_score, evidence_features, ai_explanation, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of initialAlerts) {
    insert.run(
      a.alert_id,
      a.timestamp,
      a.source_ip,
      a.destination_ip,
      a.classification,
      a.risk_score,
      a.evidence_features,
      a.ai_explanation,
      a.status
    );
  }

  // Set default policy threshold
  db.prepare('INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)').run('policy_max_risk', '70');
}

export function getAllAlerts(limit = 100): AlertRecord[] {
  const database = getDatabase();
  const rows = database.prepare('SELECT * FROM alerts ORDER BY rowid DESC LIMIT ?').all(limit) as unknown as AlertRecord[];
  return rows;
}

export function getAlertById(alert_id: string): AlertRecord | null {
  const database = getDatabase();
  const row = database.prepare('SELECT * FROM alerts WHERE alert_id = ?').get(alert_id) as unknown as AlertRecord | undefined;
  return row || null;
}

export function insertAlert(alert: AlertRecord): void {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO alerts (alert_id, timestamp, source_ip, destination_ip, classification, risk_score, evidence_features, ai_explanation, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    alert.alert_id,
    alert.timestamp,
    alert.source_ip,
    alert.destination_ip,
    alert.classification,
    alert.risk_score,
    alert.evidence_features,
    alert.ai_explanation,
    alert.status
  );
}

export function updateAlertStatus(alert_id: string, status: 'New' | 'Reviewed' | 'Resolved'): boolean {
  const database = getDatabase();
  const res = database.prepare('UPDATE alerts SET status = ? WHERE alert_id = ?').run(status, alert_id);
  return res.changes > 0;
}

export function getPolicyThreshold(): number {
  const database = getDatabase();
  const row = database.prepare('SELECT value FROM system_config WHERE key = ?').get('policy_max_risk') as { value: string } | undefined;
  if (row && row.value) {
    return parseInt(row.value, 10) || 70;
  }
  return 70;
}

export function setPolicyThreshold(val: number): void {
  const database = getDatabase();
  database.prepare('INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)').run('policy_max_risk', val.toString());
}

export function getStatistics(): SystemStats {
  const database = getDatabase();
  const alerts = getAllAlerts(500);

  let port_scan = 12;
  let brute_force = 7;
  let lateral_movement = 4;
  let data_exfiltration = 2;
  let normal = 12455;

  let highestRisk = 0;
  let newThreatCount = 0;

  for (const a of alerts) {
    if (a.risk_score > highestRisk) {
      highestRisk = a.risk_score;
    }
    if (a.classification !== 'Normal' && a.status === 'New') {
      newThreatCount++;
    }
    if (a.classification === 'Port Scan') port_scan++;
    else if (a.classification === 'Brute Force') brute_force++;
    else if (a.classification === 'Lateral Movement') lateral_movement++;
    else if (a.classification === 'Data Exfiltration') data_exfiltration++;
    else normal++;
  }

  const totalEvents = normal + port_scan + brute_force + lateral_movement + data_exfiltration;
  const threatsDetected = port_scan + brute_force + lateral_movement + data_exfiltration;
  const policyThreshold = getPolicyThreshold();

  return {
    total_events: totalEvents,
    threats_detected: threatsDetected,
    current_risk: highestRisk > 0 ? highestRisk : 72,
    system_status: highestRisk >= policyThreshold || newThreatCount > 0 ? 'Threat Detected' : 'Monitoring',
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

export function resetDatabase(): void {
  const database = getDatabase();
  database.exec('DELETE FROM alerts; DELETE FROM system_config;');
  seedInitialData();
}
