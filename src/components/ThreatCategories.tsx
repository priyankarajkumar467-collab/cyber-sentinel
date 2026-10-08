import React from 'react';
import { Shield, ScanLine, KeyRound, Network, ArrowUpRight } from 'lucide-react';
import { SystemStats } from '../types/sentinel';

interface ThreatCategoriesProps {
  stats: SystemStats | null;
}

export const ThreatCategories: React.FC<ThreatCategoriesProps> = ({ stats }) => {
  const counts = stats?.threat_counts || {
    normal: 12455,
    port_scan: 12,
    brute_force: 7,
    lateral_movement: 4,
    data_exfiltration: 2,
  };

  const categories = [
    {
      name: 'Normal',
      count: counts.normal,
      icon: Shield,
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Benign baseline traffic',
    },
    {
      name: 'Port Scan',
      count: counts.port_scan,
      icon: ScanLine,
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Rapid port reconnaissance',
    },
    {
      name: 'Brute Force',
      count: counts.brute_force,
      icon: KeyRound,
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Repeated authentication fails',
    },
    {
      name: 'Lateral Movement',
      count: counts.lateral_movement,
      icon: Network,
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Internal subnet hopping',
    },
    {
      name: 'Data Exfiltration',
      count: counts.data_exfiltration,
      icon: ArrowUpRight,
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Abnormal outbound egress',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Threat Types
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            5 core telemetry anomaly classifications
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          5 Categories
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.name}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">{cat.name}</span>
                <div className={`p-1.5 rounded-md border ${cat.badge}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="font-mono text-xl font-bold text-slate-100">
                {cat.count.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{cat.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
