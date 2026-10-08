import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  Fingerprint,
  Layers,
  Gauge,
  Sparkles,
  Database,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { runDemoScenario } from '../services/api';
import { PipelineExecutionResult } from '../types/sentinel';

interface DemoRunnerProps {
  onDemoCompleted: (result: PipelineExecutionResult) => void;
}

export const DemoRunner: React.FC<DemoRunnerProps> = ({ onDemoCompleted }) => {
  const [selectedScenario, setSelectedScenario] = useState<
    'normal' | 'port_scan' | 'brute_force' | 'data_exfiltration'
  >('port_scan');
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [latestResult, setLatestResult] = useState<PipelineExecutionResult | null>(null);

  const scenarios = [
    {
      id: 'normal',
      title: 'Scenario 1 — Normal Traffic',
      expectedRisk: '18 / 100',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      summary: 'Benign HTTPS web browsing to intranet servers with zero errors.',
      evidencePreview: 'Baseline port usage, zero failed logins, standard byte transfer.',
    },
    {
      id: 'port_scan',
      title: 'Scenario 2 — Port Scan',
      expectedRisk: '82 / 100',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      summary: 'High destination-port diversity & rapid connection rate.',
      evidencePreview: '42 unique ports probed within 30s, SYN flags without payload.',
    },
    {
      id: 'brute_force',
      title: 'Scenario 3 — Brute Force',
      expectedRisk: '76 / 100',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      summary: 'Repeated authentication failures on SSH port 22.',
      evidencePreview: '37 failed logins in 60s, automated dictionary password signature.',
    },
    {
      id: 'data_exfiltration',
      title: 'Scenario 4 — Data Exfiltration',
      expectedRisk: '91 / 100',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      summary: 'Abnormal egress transfer to unfamiliar external address.',
      evidencePreview: '850 MB outbound transfer, 98% egress byte ratio, non-business hours.',
    },
  ] as const;

  const pipelineSteps = [
    { title: '1. Telemetry Ingestion', icon: Radio, desc: 'Ingesting raw packet flow & TCP sessions' },
    { title: '2. Feature Extraction', icon: Cpu, desc: 'Calculating port diversity, rates & failed auths' },
    { title: '3. Anomaly Detection', icon: Fingerprint, desc: 'Executing Isolation Forest path lengths' },
    { title: '4. Threat Classification', icon: Layers, desc: 'Random Forest multi-class model inference' },
    { title: '5. Risk Calculation', icon: Gauge, desc: 'Synthesizing deterministic 0–100 risk score' },
    { title: '6. Evidence Generation', icon: Sparkles, desc: 'Formulating explainable human-readable reasoning' },
    { title: '7. SQLite Storage', icon: Database, desc: 'Persisting record to SQLite audit log' },
  ];

  const handleExecute = async (scenarioId: typeof selectedScenario) => {
    setSelectedScenario(scenarioId);
    setRunning(true);
    setActiveStep(0);
    setLatestResult(null);

    // Animate through pipeline steps smoothly for hackathon demonstration
    for (let i = 1; i < pipelineSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 180));
      setActiveStep(i);
    }

    try {
      const res = await runDemoScenario(scenarioId);
      setLatestResult(res);
      onDemoCompleted(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider font-mono">
              ▶ Interactive Hackathon Demo
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Live Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Execute real-time network scenarios to observe anomaly detection, explainable evidence, and guardrails
          </p>
        </div>

        <button
          onClick={() => handleExecute(selectedScenario)}
          disabled={running}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{running ? 'Processing Pipeline...' : 'Run Selected Scenario'}</span>
        </button>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/80 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${sc.badge}`}>
                    {sc.expectedRisk}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-100">{sc.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.summary}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Evidence preview:</span>
                <span className="text-slate-300 italic">{sc.evidencePreview}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Pipeline Stepping View */}
      {running && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 animate-in fade-in">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Analyzing telemetry across pipeline...
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {pipelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const isPast = activeStep > idx;
              const isCurrent = activeStep === idx;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 animate-pulse'
                      : isPast
                      ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="font-semibold truncate">{step.title}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Result Banner */}
      {latestResult && !running && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-indigo-400 font-bold">
                {latestResult.alert_id}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold border ${
                  latestResult.severity === 'Malicious'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : latestResult.severity === 'Suspicious'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {latestResult.classification} — {latestResult.risk_score}/100
              </span>
              {latestResult.policy_breached && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-950/40 text-rose-300 border border-rose-600/40">
                  🔴 Guardrail Breached
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 italic">
              "{latestResult.ai_explanation}"
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {latestResult.evidence_bullets.slice(0, 3).map((bullet, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                >
                  • {bullet}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved to SQLite</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
