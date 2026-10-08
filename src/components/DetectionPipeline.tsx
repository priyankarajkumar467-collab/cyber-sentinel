import React from 'react';
import {
  Radio,
  Cpu,
  Fingerprint,
  Layers,
  Gauge,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface DetectionPipelineProps {
  currentRisk: number;
  policyBreached: boolean;
  activeScenarioName?: string;
}

export const DetectionPipeline: React.FC<DetectionPipelineProps> = ({
  currentRisk,
  policyBreached,
  activeScenarioName,
}) => {
  const isMalicious = currentRisk >= 71;

  const steps = [
    {
      id: 'telemetry',
      name: 'Telemetry',
      statusText: '🟢 Telemetry Received',
      icon: Radio,
      detail: 'Network packet flow ingested',
      isAlert: false,
    },
    {
      id: 'features',
      name: 'Feature Analysis',
      statusText: '🟢 Features Extracted',
      icon: Cpu,
      detail: 'Port diversity & rate metrics',
      isAlert: false,
    },
    {
      id: 'anomaly',
      name: 'Anomaly Detection',
      statusText: isMalicious ? '🟢 Anomaly Detected' : '🟢 Baseline Matched',
      icon: Fingerprint,
      detail: 'Isolation Forest scoring',
      isAlert: false,
    },
    {
      id: 'classification',
      name: 'Threat Classification',
      statusText: '🟢 Threat Classified',
      icon: Layers,
      detail: 'Supervised Random Forest',
      isAlert: false,
    },
    {
      id: 'risk',
      name: 'Risk Score',
      statusText: isMalicious ? '🔴 High Risk Score' : '🟢 Risk Calculated',
      icon: Gauge,
      detail: `${currentRisk}/100 deterministic index`,
      isAlert: isMalicious,
    },
    {
      id: 'decision',
      name: 'Security Decision',
      statusText: policyBreached ? '🔴 Policy Alert' : '🟢 Policy Compliant',
      icon: policyBreached ? ShieldAlert : ShieldCheck,
      detail: policyBreached ? 'Requires analyst review' : 'Normal execution',
      isAlert: policyBreached,
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            AI Detection Pipeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent sequential processing from raw telemetry to policy guardrail
          </p>
        </div>
        {activeScenarioName && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono">
            Active: {activeScenarioName}
          </span>
        )}
      </div>

      {/* Responsive Pipeline Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border relative transition-all ${
                step.isAlert
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-200'
              }`}
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  0{idx + 1}
                </span>
                <div
                  className={`p-1.5 rounded-md ${
                    step.isAlert
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-xs font-bold text-slate-100">{step.name}</div>
              <div
                className={`text-[11px] font-medium mt-1.5 ${
                  step.isAlert ? 'text-rose-400 font-semibold' : 'text-emerald-400'
                }`}
              >
                {step.statusText}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                {step.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
