import React, { useState } from 'react';
import { AlertItem } from '../types/sentinel';
import { ChevronRight } from 'lucide-react';

interface AlertsTableProps {
  alerts: AlertItem[];
  loading: boolean;
  onSelectAlert: (alert: AlertItem) => void;
  maxRows?: number;
  showFilters?: boolean;
}

export const AlertsTable: React.FC<AlertsTableProps> = ({
  alerts,
  loading,
  onSelectAlert,
  maxRows = 10,
  showFilters = false,
}) => {
  const [filter, setFilter] = useState<'All' | 'Malicious' | 'Suspicious' | 'Normal'>('All');

  const filtered = alerts.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Malicious') return a.risk_score >= 71;
    if (filter === 'Suspicious') return a.risk_score >= 31 && a.risk_score < 71;
    if (filter === 'Normal') return a.risk_score <= 30;
    return true;
  });

  const displayList = maxRows ? filtered.slice(0, maxRows) : filtered;

  const getStatusBadge = (riskScore: number) => {
    if (riskScore >= 71) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5" />
          Malicious
        </span>
      );
    }
    if (riskScore >= 31) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
          Suspicious
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
        Normal
      </span>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
        <div>
          <h3 className="text-base font-semibold text-slate-200">Recent Threats</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any row to view explainable evidence and AI reasoning
          </p>
        </div>

        {showFilters && (
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['All', 'Malicious', 'Suspicious', 'Normal'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  filter === cat
                    ? 'bg-slate-800 text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Threat</th>
              <th className="py-3 px-4 text-center">Risk</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {loading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                  Loading telemetry threats...
                </td>
              </tr>
            )}

            {!loading && displayList.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                  No threats found matching the current filter.
                </td>
              </tr>
            )}

            {!loading &&
              displayList.map((alert) => (
                <tr
                  key={alert.alert_id}
                  onClick={() => onSelectAlert(alert)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">
                    {alert.timestamp}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-medium text-slate-200">
                    {alert.source_ip}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-100">{alert.classification}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-950 text-slate-200 border border-slate-800">
                      {alert.risk_score}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(alert.risk_score)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAlert(alert);
                      }}
                      className="inline-flex items-center space-x-1 text-xs text-slate-400 group-hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <span>Explain</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
