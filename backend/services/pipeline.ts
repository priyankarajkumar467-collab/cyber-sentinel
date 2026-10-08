import { RawTelemetryEvent, extractFeatures, BehavioralFeatures } from '../feature_engineering/features';
import { defaultIsolationForest, AnomalyDetectionResult } from '../detection/isolation_forest';
import { defaultThreatClassifier, ClassificationResult } from '../models/threat_classifier';
import { RiskEngine, RiskEvaluation } from './risk_engine';
import { EvidenceGenerator, ExplainableEvidence } from './evidence_generator';
import { insertAlert, AlertRecord, getPolicyThreshold } from '../database/db';

export interface PipelineExecutionResult {
  alert_id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  classification: string;
  risk_score: number;
  severity: 'Normal' | 'Suspicious' | 'Malicious';
  evidence_bullets: string[];
  ai_explanation: string;
  policy_breached: boolean;
  policy_threshold: number;
  policy_message: string;
  status: 'New' | 'Reviewed' | 'Resolved';
  steps: {
    telemetry: { status: 'success'; summary: string };
    feature_analysis: { status: 'success'; summary: string; features: BehavioralFeatures };
    anomaly_detection: { status: 'success' | 'alert'; summary: string; anomaly: AnomalyDetectionResult };
    threat_classification: { status: 'success'; summary: string; classification: ClassificationResult };
    risk_score: { status: 'success' | 'alert'; summary: string; risk: RiskEvaluation };
    security_decision: { status: 'success' | 'breach'; summary: string };
  };
}

export class SecurityPipeline {
  public static processEvent(event: RawTelemetryEvent): PipelineExecutionResult {
    const now = new Date();
    const timeStr = event.timestamp
      ? (event.timestamp.includes(' ') ? event.timestamp.split(' ')[1] : event.timestamp)
      : now.toTimeString().split(' ')[0];

    const sourceIp = event.source_ip || '192.168.1.' + Math.floor(10 + Math.random() * 80);
    const destIp = event.destination_ip || '10.0.0.' + Math.floor(2 + Math.random() * 50);

    // 1. Feature Engineering
    const features = extractFeatures({
      ...event,
      source_ip: sourceIp,
      destination_ip: destIp,
    });

    // 2. Anomaly Detection (Isolation Forest)
    const anomalyResult = defaultIsolationForest.predict(features);

    // 3. Threat Classification (Supervised Random Forest)
    const classification = defaultThreatClassifier.classify(features, anomalyResult.anomaly_score);

    // 4. Evidence Generation
    const evidence = EvidenceGenerator.generate(
      features,
      classification.predicted_class,
      classification.confidence,
      anomalyResult
    );

    // 5. Deterministic Risk Engine
    const risk = RiskEngine.calculateRisk(
      classification.predicted_class,
      classification.confidence,
      anomalyResult.anomaly_score,
      evidence.evidence_factor
    );

    // 6. Security Policy Guardrail
    const policyThreshold = getPolicyThreshold();
    const policyBreached = risk.risk_score >= policyThreshold;
    const policyMessage = policyBreached
      ? `A detected threat (${risk.risk_score}/100) exceeded the configured maximum risk level (${policyThreshold}).`
      : `Risk level (${risk.risk_score}/100) is within configured security guardrails (Max: ${policyThreshold}).`;

    // 7. Store in SQLite
    const alertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
    const status: 'New' | 'Reviewed' | 'Resolved' = risk.severity === 'Normal' ? 'Resolved' : 'New';

    const alertRecord: AlertRecord = {
      alert_id: alertId,
      timestamp: timeStr,
      source_ip: sourceIp,
      destination_ip: destIp,
      classification: classification.predicted_class,
      risk_score: risk.risk_score,
      evidence_features: JSON.stringify({
        bullets: evidence.bullets,
        metrics: {
          outbound_mb: features.outbound_mb,
          unique_ports: features.dest_port_diversity,
          failed_logins: features.failed_login_count,
          conn_rate_per_sec: features.conn_rate_per_sec,
          anomaly_score: anomalyResult.anomaly_score,
          confidence: `${Math.round(classification.confidence * 100)}%`,
        },
        technical: evidence.technical_details,
      }),
      ai_explanation: evidence.ai_explanation,
      status,
    };

    insertAlert(alertRecord);

    return {
      alert_id: alertId,
      timestamp: timeStr,
      source_ip: sourceIp,
      destination_ip: destIp,
      classification: classification.predicted_class,
      risk_score: risk.risk_score,
      severity: risk.severity,
      evidence_bullets: evidence.bullets,
      ai_explanation: evidence.ai_explanation,
      policy_breached: policyBreached,
      policy_threshold: policyThreshold,
      policy_message: policyMessage,
      status,
      steps: {
        telemetry: {
          status: 'success',
          summary: `Received packet telemetry from ${sourceIp}`,
        },
        feature_analysis: {
          status: 'success',
          summary: `Extracted behavioral features (ports: ${features.dest_port_diversity}, logins failed: ${features.failed_login_count})`,
          features,
        },
        anomaly_detection: {
          status: anomalyResult.is_anomalous ? 'alert' : 'success',
          summary: anomalyResult.is_anomalous
            ? `Isolation Forest detected unusual behavioral deviation (score: ${anomalyResult.anomaly_score})`
            : `Behavior within expected statistical distribution (score: ${anomalyResult.anomaly_score})`,
          anomaly: anomalyResult,
        },
        threat_classification: {
          status: 'success',
          summary: `Classified as ${classification.predicted_class} (confidence: ${Math.round(classification.confidence * 100)}%)`,
          classification,
        },
        risk_score: {
          status: risk.severity === 'Malicious' ? 'alert' : 'success',
          summary: `Risk calculated at ${risk.risk_score} / 100 (${risk.severity})`,
          risk,
        },
        security_decision: {
          status: policyBreached ? 'breach' : 'success',
          summary: policyBreached ? 'Policy breach: manual analyst review required' : 'Guardrail satisfied',
        },
      },
    };
  }
}
