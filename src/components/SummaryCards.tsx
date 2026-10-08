import React from 'react';
import { Activity, ShieldAlert, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { SystemStats } from '../types/sentinel';

interface SummaryCardsProps {
  stats: SystemStats | null;
  loading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, loading }) => {
  const currentRisk = stats ? stats.current_risk : 72;
  const isHighRisk = currentRisk >= 71;
  const isMediumRisk = currentRisk >= 31 && currentRisk < 71;

  let riskCategoryLabel = 'NORMAL';
  let riskColorClass = 'text-emerald-400';
  let riskBgClass = 'bg-emerald-500/10 border-emerald-500/20';

  if (isHighRisk) {
    riskCategoryLabel = 'HIGH RISK';
    riskColorClass = 'text-rose-400';
    riskBgClass = 'bg-rose-500/10 border-rose-500/20';
  } else if (isMediumRisk) {
    riskCategoryLabel = 'SUSPICIOUS';
    riskColorClass = 'text-amber-400';
    riskBgClass = 'bg-amber-500/10 border-amber-500/20';
  }

  const isThreatDetected = stats?.system_status === 'Threat Detected' || isHighRisk;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Events */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Events</span>
          <div className="p-2 rounded-lg bg-slate-800/80 text-slate-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-slate-100">
            {loading ? '...' : (stats?.total_events ? stats.total_events.toLocaleString() : '12,480')}
          </div>
          <p className="text-xs text-slate-400 mt-1">Events analyzed</p>
        </div>
      </div>

      {/* 2. Threats Detected */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Threats Detected</span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-rose-400">
            {loading ? '...' : (stats?.threats_detected ? stats.threats_detected.toLocaleString() : '27')}
          </div>
          <p className="text-xs text-slate-400 mt-1">Potential threats</p>
        </div>
      </div>

      {/* 3. Current Risk */}
      <div className={`border rounded-xl p-5 shadow-sm transition-all ${riskBgClass}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Current Risk</span>
          <div className={`p-2 rounded-lg ${riskColorClass} bg-slate-900/50`}>
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono text-slate-100">
            {loading ? '...' : `${currentRisk} / 100`}
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskColorClass} bg-slate-950/60 border border-slate-800 font-mono`}>
            {riskCategoryLabel}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Overall threat index</p>
      </div>

      {/* 4. System Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">System Status</span>
          <div className={`p-2 rounded-lg ${isThreatDetected ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {isThreatDetected ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isThreatDetected ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className={`text-xl font-bold ${isThreatDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isThreatDetected ? 'Threat Detected' : 'Monitoring'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Last updated: {stats?.last_updated || '10 seconds ago'}
          </p>
        </div>
      </div>
    </div>
  );
};
