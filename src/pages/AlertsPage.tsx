import React, { useState } from 'react';
import { AlertsTable } from '../components/AlertsTable';
import { AlertItem, SystemStats } from '../types/sentinel';
import { ShieldAlert, CheckCircle2, Clock, Filter } from 'lucide-react';

interface AlertsPageProps {
  alerts: AlertItem[];
  stats: SystemStats | null;
  loading: boolean;
  onSelectAlert: (alert: AlertItem) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  stats,
  loading,
  onSelectAlert,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Reviewed' | 'Resolved'>('All');

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'All') return true;
    return a.status === statusFilter;
  });

  const newCount = alerts.filter((a) => a.status === 'New').length;
  const reviewedCount = alerts.filter((a) => a.status === 'Reviewed').length;
  const resolvedCount = alerts.filter((a) => a.status === 'Resolved').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Threat Alerts & Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Complete SQLite incident records with explainable behavioral evidence
          </p>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(
            [
              { id: 'All', label: 'All Alerts', count: alerts.length },
              { id: 'New', label: 'New', count: newCount },
              { id: 'Reviewed', label: 'Reviewed', count: reviewedCount },
              { id: 'Resolved', label: 'Resolved', count: resolvedCount },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                statusFilter === t.id
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.label}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400">
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <AlertsTable
        alerts={filteredAlerts}
        loading={loading}
        onSelectAlert={onSelectAlert}
        maxRows={100}
        showFilters={true}
      />
    </div>
  );
};
