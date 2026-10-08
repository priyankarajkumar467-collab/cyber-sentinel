import { BehavioralFeatures } from '../feature_engineering/features';
import { ThreatClass } from '../models/threat_classifier';
import { AnomalyDetectionResult } from '../detection/isolation_forest';

export interface ExplainableEvidence {
  bullets: string[];
  ai_explanation: string;
  evidence_factor: number; // 0 to 1 for risk calculation
  technical_details: {
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

export class EvidenceGenerator {
  public static generate(
    features: BehavioralFeatures,
    classification: ThreatClass,
    confidence: number,
    anomalyResult: AnomalyDetectionResult
  ): ExplainableEvidence {
    const bullets: string[] = [];
    let explanation = '';
    let evidenceFactor = 0.5;

    switch (classification) {
      case 'Port Scan':
        bullets.push(`${features.dest_port_diversity} unique destination ports`);
        bullets.push(`High connection rate`);
        bullets.push(`${Math.round(features.conn_rate_per_sec * 30)} connections within 30 seconds`);
        bullets.push(`Behavior differs from normal activity`);
        explanation = `The source contacted a large number of ports within a short period. This behavior is consistent with port scanning.`;
        evidenceFactor = Math.min(1.0, 0.6 + (features.dest_port_diversity / 100));
        break;

      case 'Brute Force':
        bullets.push(`${features.failed_login_count} failed logins`);
        bullets.push(`Repeated authentication attempts`);
        bullets.push(`Targeted authentication service port (${features.dest_port})`);
        bullets.push(`Abnormally high reconnect frequency`);
        explanation = `Multiple failed authentication attempts were detected from this host in rapid succession, typical of automated password guessing.`;
        evidenceFactor = Math.min(1.0, 0.6 + (features.failed_login_count / 50));
        break;

      case 'Lateral Movement':
        bullets.push(`Internal-to-internal host reconnaissance`);
        bullets.push(`Targeted administrative port ${features.dest_port} (${features.protocol})`);
        bullets.push(`Rapid traversal across internal IP addresses`);
        bullets.push(`Access pattern diverges from typical workstation activity`);
        explanation = `The host is attempting to connect to other internal systems across the local network, indicating potential lateral movement after an initial breach.`;
        evidenceFactor = 0.75;
        break;

      case 'Data Exfiltration':
        bullets.push(`Large outbound transfer (${features.outbound_mb} MB)`);
        bullets.push(`Unusual destination (${features.destination_ip})`);
        bullets.push(`Abnormal traffic volume`);
        bullets.push(`High egress ratio (${Math.round(features.egress_ratio * 100)}% outbound)`);
        explanation = `An abnormally high volume of data was transferred outbound to an external destination, indicating potential unauthorized data exfiltration.`;
        evidenceFactor = Math.min(1.0, 0.75 + (features.outbound_mb / 1000));
        break;

      case 'Normal':
      default:
        bullets.push(`Standard ${features.protocol} session`);
        bullets.push(`Zero authentication failures`);
        bullets.push(`Traffic volume aligns with established enterprise baseline`);
        bullets.push(`Expected port and destination behavior`);
        explanation = `Network telemetry demonstrates normal operational parameters without statistical anomalies or attack signatures.`;
        evidenceFactor = 0.1;
        break;
    }

    return {
      bullets,
      ai_explanation: explanation,
      evidence_factor: evidenceFactor,
      technical_details: {
        isolation_forest_anomaly_score: anomalyResult.anomaly_score,
        isolation_forest_path_length: anomalyResult.average_path_length,
        threat_confidence_percent: Math.round(confidence * 100),
        features_summary: {
          dest_port_diversity: features.dest_port_diversity,
          conn_rate_per_sec: features.conn_rate_per_sec,
          failed_logins: features.failed_login_count,
          outbound_mb: features.outbound_mb,
          egress_ratio_percent: Math.round(features.egress_ratio * 100),
        },
      },
    };
  }
}
