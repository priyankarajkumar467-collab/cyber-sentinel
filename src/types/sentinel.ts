export type ThreatClass = 'Normal' | 'Port Scan' | 'Brute Force' | 'Lateral Movement' | 'Data Exfiltration';
export type RiskSeverity = 'Normal' | 'Suspicious' | 'Malicious';
export type AlertStatus = 'New' | 'Reviewed' | 'Resolved';

export interface AlertItem {
  alert_id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  classification: ThreatClass;
  risk_score: number;
  evidence_features: string; // JSON string
  ai_explanation: string;
  status: AlertStatus;
}

export interface ParsedEvidence {
  bullets: string[];
  metrics?: {
    outbound_mb?: number;
    unique_ports?: number;
    failed_logins?: number;
    conn_rate_per_sec?: number;
    anomaly_score?: number;
    confidence?: string;
  };
  technical?: {
    isolation_forest_anomaly_score: number;
    isolation_forest_path_length: number;
    threat_confidence_percent: number;
    features_summary: {
      dest_port_diversity: number;
      conn_rate_per_sec: number;
      failed_logins: number;
      outbound_mb: number;
      egress_ratio_percent: number;
    };
  };
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

export interface PipelineExecutionResult {
  alert_id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  classification: ThreatClass;
  risk_score: number;
  severity: RiskSeverity;
  evidence_bullets: string[];
  ai_explanation: string;
  policy_breached: boolean;
  policy_threshold: number;
  policy_message: string;
  status: AlertStatus;
  steps: {
    telemetry: { status: 'success'; summary: string };
    feature_analysis: { status: 'success'; summary: string; features: any };
    anomaly_detection: { status: 'success' | 'alert'; summary: string; anomaly: any };
    threat_classification: { status: 'success'; summary: string; classification: any };
    risk_score: { status: 'success' | 'alert'; summary: string; risk: any };
    security_decision: { status: 'success' | 'breach'; summary: string };
  };
}
