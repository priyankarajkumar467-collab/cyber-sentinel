import React from 'react';
import { Activity, KeyRound, Globe, HardDrive, BarChart3 } from 'lucide-react';
import { SystemStats } from '../types/sentinel';

interface BehaviorAnalysisProps {
  stats: SystemStats | null;
}

export const BehaviorAnalysis: React.FC<BehaviorAnalysisProps> = ({ stats }) => {
  const behavior = stats?.behavioral_summary || {
    connection_activity: 'High',
    failed_logins: 37,
    destination_diversity: 42,
    outbound_data_mb: 850,
    traffic_pattern: 'Unusual',
  };

  const isHighConn = behavior.connection_activity === 'High';
  const isUnusualPattern = behavior.traffic_pattern === 'Unusual' || behavior.traffic_pattern === 'Critical';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Behavioral Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time extracted telemetry behavioral metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Connection Activity */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Connection Activity</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isHighConn ? 'bg-rose-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`text-lg font-bold font-mono ${
                isHighConn ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {behavior.connection_activity}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Connection velocity</span>
        </div>

        {/* Failed Logins */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Failed Logins</span>
            <KeyRound className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">
            {behavior.failed_logins}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Authentication errors</span>
        </div>

        {/* Destination Diversity */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Destination Diversity</span>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {behavior.destination_diversity}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Distinct targets contacted</span>
        </div>

        {/* Outbound Data */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Outbound Data</span>
            <HardDrive className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {behavior.outbound_data_mb} MB
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Egress byte volume</span>
        </div>

        {/* Traffic Pattern */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Traffic Pattern</span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isUnusualPattern ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`text-lg font-bold ${
                isUnusualPattern ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {behavior.traffic_pattern}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Deviation from baseline</span>
        </div>
      </div>
    </div>
  );
};
