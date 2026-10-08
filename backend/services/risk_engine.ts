import { ThreatClass } from '../models/threat_classifier';

export type RiskSeverity = 'Normal' | 'Suspicious' | 'Malicious';

export interface RiskEvaluation {
  risk_score: number; // 0 to 100
  severity: RiskSeverity;
  signals: {
    anomaly_signal: number; // 0 to 100
    classifier_signal: number; // 0 to 100
    evidence_signal: number; // 0 to 100
  };
}

export class RiskEngine {
  // Base threat severity weights
  private static threatBaseWeights: Record<ThreatClass, number> = {
    Normal: 10,
    'Brute Force': 68,
    'Lateral Movement': 74,
    'Port Scan': 82,
    'Data Exfiltration': 92,
  };

  public static calculateRisk(
    classification: ThreatClass,
    confidence: number,
    anomalyScore: number,
    evidenceFactor: number
  ): RiskEvaluation {
    if (classification === 'Normal') {
      const rawNormal = Math.round(anomalyScore * 25 + (1 - confidence) * 10);
      const score = Math.max(5, Math.min(28, rawNormal));
      return {
        risk_score: score,
        severity: 'Normal',
        signals: {
          anomaly_signal: Math.round(anomalyScore * 100),
          classifier_signal: Math.round(confidence * 100),
          evidence_signal: Math.round(evidenceFactor * 100),
        },
      };
    }

    const baseWeight = this.threatBaseWeights[classification] || 60;

    // Conceptual formula:
    // Risk Score = weighted anomaly signal + weighted classifier confidence + security evidence
    // w_anomaly = 0.35, w_classifier = 0.40, w_evidence = 0.25
    const anomalySignal = Math.min(100, Math.max(0, anomalyScore * 100));
    const classifierSignal = Math.min(100, Math.max(0, baseWeight * confidence));
    const evidenceSignal = Math.min(100, Math.max(0, evidenceFactor * 100));

    const weightedScore =
      0.30 * anomalySignal +
      0.45 * classifierSignal +
      0.25 * evidenceSignal;

    // Normalizing strictly to 0 - 100
    let finalScore = Math.round(Math.min(100, Math.max(0, weightedScore)));

    // Ensure category boundary alignment:
    if (finalScore < 31) {
      finalScore = 35; // non-normal threats are at least suspicious
    }

    let severity: RiskSeverity = 'Normal';
    if (finalScore <= 30) {
      severity = 'Normal';
    } else if (finalScore <= 70) {
      severity = 'Suspicious';
    } else {
      severity = 'Malicious';
    }

    return {
      risk_score: finalScore,
      severity,
      signals: {
        anomaly_signal: Math.round(anomalySignal),
        classifier_signal: Math.round(classifierSignal),
        evidence_signal: Math.round(evidenceSignal),
      },
    };
  }
}
