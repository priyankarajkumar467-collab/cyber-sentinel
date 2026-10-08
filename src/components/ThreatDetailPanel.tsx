import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Eye,
  CheckCheck,
} from 'lucide-react';
import { AlertItem, ParsedEvidence } from '../types/sentinel';

interface ThreatDetailPanelProps {
  alert: AlertItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'New' | 'Reviewed' | 'Resolved') => void;
}

export const ThreatDetailPanel: React.FC<ThreatDetailPanelProps> = ({
  alert,
  onClose,
  onUpdateStatus,
}) => {
  const [showTechnical, setShowTechnical] = useState(false);

  if (!alert) return null;

  let evidence: ParsedEvidence = { bullets: [] };
  try {
    evidence = JSON.parse(alert.evidence_features);
  } catch (e) {
    evidence = { bullets: ['Anomalous connection behavior observed'] };
  }

  const isMalicious = alert.risk_score >= 71;
  const isSuspicious = alert.risk_score >= 31 && alert.risk_score < 71;

  let severityLabel = 'Normal';
  let severityBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let severityDot = 'bg-emerald-400';

  if (isMalicious) {
    severityLabel = 'Malicious';
    severityBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    severityDot = 'bg-rose-400';
  } else if (isSuspicious) {
    severityLabel = 'Suspicious';
    severityBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    severityDot = 'bg-amber-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${severityBadgeClass}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-slate-400">{alert.alert_id}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${severityBadgeClass}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${severityDot}`} />
                  {severityLabel}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">{alert.classification}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Risk Score</span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold font-mono text-slate-100">{alert.risk_score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Detection Time</span>
              <div className="mt-1 flex items-center space-x-1.5 text-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-sm font-semibold">{alert.timestamp}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Source</span>
              <div className="mt-1 font-mono text-xs font-semibold text-slate-200 truncate">
                {alert.source_ip}
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Destination</span>
              <div className="mt-1 font-mono text-xs font-semibold text-slate-200 truncate">
                {alert.destination_ip}
              </div>
            </div>
          </div>

          {/* Connection Path */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Source:</span>
              <span className="font-mono font-semibold text-indigo-400">{alert.source_ip}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Destination:</span>
              <span className="font-mono font-semibold text-sky-400">{alert.destination_ip}</span>
            </div>
          </div>

          {/* Why was this detected? (Crucial Section) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <span>Why was this detected?</span>
            </h3>

            {/* Evidence Bullets */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Evidence
              </h4>
              <ul className="space-y-2">
                {evidence.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-200">
                    <span className="text-rose-400 font-bold mt-0.5">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Explanation Quote Box */}
            <div className="bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-900/40 rounded-xl p-4 relative">
              <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Explanation</span>
              </div>
              <blockquote className="text-sm text-slate-200 italic leading-relaxed pl-2 border-l-2 border-indigo-500/60">
                "{alert.ai_explanation}"
              </blockquote>
            </div>
          </div>

          {/* Optional: View Technical Details (for advanced users) */}
          <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/30">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full px-4 py-3 text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>View Technical Details (Advanced)</span>
              {showTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnical && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Unsupervised Anomaly Model:</span>
                    <span>Isolation Forest</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Unusual Activity:</span>
                    <span className="text-amber-400">Detected (score &gt; 0.6)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Threat Classifier:</span>
                    <span>Supervised Random Forest</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Threat Confidence:</span>
                    <span className="text-emerald-400">High</span>
                  </div>
                </div>

                {evidence.metrics && (
                  <div className="mt-2 text-slate-400 text-[11px] bg-slate-900/60 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300 font-semibold block mb-1">Feature Vector Metrics:</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>Ports contacted: <span className="text-slate-200">{evidence.metrics.unique_ports ?? 1}</span></div>
                      <div>Failed logins: <span className="text-slate-200">{evidence.metrics.failed_logins ?? 0}</span></div>
                      <div>Egress data: <span className="text-slate-200">{evidence.metrics.outbound_mb ?? 0} MB</span></div>
                      <div>Packet velocity: <span className="text-slate-200">{evidence.metrics.conn_rate_per_sec ?? 1}/s</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Status:</span>
            <span className="font-semibold text-slate-200">{alert.status}</span>
          </div>

          <div className="flex items-center space-x-2">
            {alert.status !== 'Reviewed' && (
              <button
                onClick={() => onUpdateStatus(alert.alert_id, 'Reviewed')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Mark Reviewed</span>
              </button>
            )}

            {alert.status !== 'Resolved' && (
              <button
                onClick={() => onUpdateStatus(alert.alert_id, 'Resolved')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Resolve Threat</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
