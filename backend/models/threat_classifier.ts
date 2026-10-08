import { BehavioralFeatures } from '../feature_engineering/features';

export type ThreatClass = 'Normal' | 'Port Scan' | 'Brute Force' | 'Lateral Movement' | 'Data Exfiltration';

export interface ClassificationResult {
  predicted_class: ThreatClass;
  confidence: number; // 0.0 to 1.0
  probabilities: Record<ThreatClass, number>;
  primary_driver: string;
}

export class ThreatClassifier {
  public classify(features: BehavioralFeatures, anomalyScore: number): ClassificationResult {
    const scores: Record<ThreatClass, number> = {
      Normal: 0.1,
      'Port Scan': 0.05,
      'Brute Force': 0.05,
      'Lateral Movement': 0.05,
      'Data Exfiltration': 0.05,
    };

    // 1. Port Scan heuristics & weights
    if (features.dest_port_diversity >= 15 || (features.dest_port_diversity >= 8 && features.syn_flag_present)) {
      scores['Port Scan'] += 0.75 + Math.min(0.2, (features.dest_port_diversity / 100));
    } else if (features.dest_port_diversity >= 4) {
      scores['Port Scan'] += 0.35;
    }

    // 2. Brute Force heuristics & weights
    if (features.failed_login_count >= 10) {
      scores['Brute Force'] += 0.85 + Math.min(0.1, features.failed_login_count / 100);
    } else if (features.failed_login_count >= 3) {
      scores['Brute Force'] += 0.45;
    }

    // 3. Lateral Movement heuristics & weights
    const lateralPorts = [445, 135, 139, 3389, 5985, 88, 22];
    const isLateralPort = lateralPorts.includes(features.dest_port);
    if (features.is_internal_target && (isLateralPort || features.dest_port_diversity >= 3)) {
      if (isLateralPort && features.failed_login_count > 0) {
        scores['Lateral Movement'] += 0.8;
      } else if (isLateralPort) {
        scores['Lateral Movement'] += 0.65;
      } else {
        scores['Lateral Movement'] += 0.4;
      }
    }

    // 4. Data Exfiltration heuristics & weights
    if (features.outbound_mb >= 100 || (features.outbound_mb >= 30 && features.egress_ratio >= 0.85)) {
      if (!features.is_internal_target) {
        scores['Data Exfiltration'] += 0.9;
      } else {
        scores['Data Exfiltration'] += 0.6;
      }
    } else if (features.outbound_mb >= 25 && !features.is_internal_target) {
      scores['Data Exfiltration'] += 0.4;
    }

    // 5. Normal baseline check
    if (
      features.failed_login_count === 0 &&
      features.dest_port_diversity <= 2 &&
      features.outbound_mb < 20 &&
      anomalyScore < 0.45
    ) {
      scores['Normal'] += 0.85;
    }

    // Softmax / normalization
    const classes = Object.keys(scores) as ThreatClass[];
    const expScores = classes.map((c) => Math.exp(scores[c] * 3.0));
    const sumExp = expScores.reduce((a, b) => a + b, 0);

    const probabilities: Record<ThreatClass, number> = {
      Normal: 0,
      'Port Scan': 0,
      'Brute Force': 0,
      'Lateral Movement': 0,
      'Data Exfiltration': 0,
    };

    let maxClass: ThreatClass = 'Normal';
    let maxProb = -1;

    for (let i = 0; i < classes.length; i++) {
      const c = classes[i];
      const prob = parseFloat((expScores[i] / sumExp).toFixed(3));
      probabilities[c] = prob;
      if (prob > maxProb) {
        maxProb = prob;
        maxClass = c;
      }
    }

    let primaryDriver = 'Baseline standard traffic';
    if (maxClass === 'Port Scan') primaryDriver = `${features.dest_port_diversity} destination ports contacted rapidly`;
    else if (maxClass === 'Brute Force') primaryDriver = `${features.failed_login_count} consecutive failed logins`;
    else if (maxClass === 'Lateral Movement') primaryDriver = `Internal subnet traversal on port ${features.dest_port}`;
    else if (maxClass === 'Data Exfiltration') primaryDriver = `${features.outbound_mb} MB outbound egress transfer`;

    return {
      predicted_class: maxClass,
      confidence: maxProb,
      probabilities,
      primary_driver: primaryDriver,
    };
  }
}

export const defaultThreatClassifier = new ThreatClassifier();
