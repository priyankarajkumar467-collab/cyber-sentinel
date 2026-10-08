import React from 'react';
import {
  Radio,
  Cpu,
  Fingerprint,
  Layers,
  Gauge,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Database,
  Terminal,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Collect',
      icon: Radio,
      description: 'The system receives network and security telemetry (packet counts, TCP flags, duration, port destinations, authentication attempts).',
    },
    {
      num: '2',
      title: 'Understand',
      icon: Cpu,
      description: 'The system converts raw events into behavioral features (destination port diversity, connection velocity, failed login frequency, egress byte ratio).',
    },
    {
      num: '3',
      title: 'Detect',
      icon: Fingerprint,
      description: 'AI identifies unusual activity using Isolation Forest unsupervised anomaly detection to pinpoint multi-dimensional outliers.',
    },
    {
      num: '4',
      title: 'Classify',
      icon: Layers,
      description: 'The system estimates the threat category using Random Forest classification into 5 distinct classes: Normal, Port Scan, Brute Force, Lateral Movement, or Data Exfiltration.',
    },
    {
      num: '5',
      title: 'Score',
      icon: Gauge,
      description: 'Each event receives a deterministic risk score from 0–100 combining anomaly signals, classifier confidence, and security evidence.',
    },
    {
      num: '6',
      title: 'Explain',
      icon: Sparkles,
      description: 'The system shows plain-language human-readable evidence bullets and an AI reasoning summary, avoiding confusing mathematical jargon.',
    },
    {
      num: '7',
      title: 'Decide',
      icon: ShieldCheck,
      description: 'The configured security policy determines whether the risk requires attention without taking unverified or disruptive network actions.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          How Cyber Sentinel Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Intelligent Cyber Threat & Network Anomaly Detection Architecture
        </p>
      </div>

      {/* 7 Core Pipeline Steps */}
      <div className="space-y-3">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex items-start space-x-4 shadow-sm"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm">
                0{st.num}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-slate-300" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    {st.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {st.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Problem Statement Card */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Hackathon Problem Statement
        </h3>
        <blockquote className="text-xs sm:text-sm text-slate-200 italic border-l-2 border-indigo-500 pl-3">
          “Build a Real-Time Cybersecurity Sentinel Using Behavioral Anomaly Detection, Threat Classification, Explainable Evidence, and Risk-Based Policy Guardrails.”
        </blockquote>
      </div>

      {/* Technical Architecture Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Anomaly Engine</span>
          <h4 className="text-sm font-bold text-slate-100 mt-1">Isolation Forest</h4>
          <p className="text-xs text-slate-400 mt-1">
            Measures recursive isolation path lengths c(n) to identify statistical outliers without supervision.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Classifier</span>
          <h4 className="text-sm font-bold text-slate-100 mt-1">Random Forest</h4>
          <p className="text-xs text-slate-400 mt-1">
            Supervised multi-class decision ensemble categorizing into 5 distinct threat classes.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Storage & Audit</span>
          <h4 className="text-sm font-bold text-slate-100 mt-1">SQLite Database</h4>
          <p className="text-xs text-slate-400 mt-1">
            Lightweight, durable SQL audit ledger storing timestamps, classification, risk, and evidence JSON.
          </p>
        </div>
      </div>
    </div>
  );
};
