import React from 'react';

interface RiskBarProps {
  riskScore: number;
}

export const RiskBar: React.FC<RiskBarProps> = ({ riskScore }) => {
  const clamped = Math.max(0, Math.min(100, riskScore));

  let category = 'Normal';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-400';

  if (clamped > 70) {
    category = 'Malicious';
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-400';
  } else if (clamped > 30) {
    category = 'Suspicious';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400';
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Risk Overview
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic risk index synthesized from behavioral deviations & classifiers
          </p>
        </div>

        {/* Current Risk Badge */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Current Risk</span>
            <span className="text-2xl font-bold font-mono text-slate-100 leading-none">
              {clamped} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </span>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${badgeColor} flex items-center space-x-1.5`}>
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span>{category}</span>
          </span>
        </div>
      </div>

      {/* Horizontal Bar Graphic */}
      <div className="mt-6">
        {/* Pointer indicator */}
        <div className="relative w-full h-4 mb-1">
          <div
            className="absolute -top-1 transition-all duration-500 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${clamped}%` }}
          >
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 shadow-sm">
              {clamped}
            </span>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-700 mt-0.5" />
          </div>
        </div>

        {/* Multi-segment risk bar: 0 - 30 (Normal), 30 - 70 (Suspicious), 70 - 100 (Malicious) */}
        <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
          {/* Normal Zone (0-30%) */}
          <div className="h-full rounded-l-full bg-emerald-500/30 hover:bg-emerald-500/40 transition-colors relative" style={{ width: '30%' }}>
            {clamped <= 30 && (
              <div
                className="h-full bg-emerald-400 rounded-l-full transition-all duration-500"
                style={{ width: `${(clamped / 30) * 100}%` }}
              />
            )}
            {clamped > 30 && <div className="h-full bg-emerald-500/80 rounded-l-full" />}
          </div>

          {/* Suspicious Zone (30-70%) */}
          <div className="h-full bg-amber-500/30 hover:bg-amber-500/40 transition-colors relative" style={{ width: '40%' }}>
            {clamped > 30 && clamped <= 70 && (
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${((clamped - 30) / 40) * 100}%` }}
              />
            )}
            {clamped > 70 && <div className="h-full bg-amber-500/80" />}
          </div>

          {/* Malicious Zone (70-100%) */}
          <div className="h-full rounded-r-full bg-rose-500/30 hover:bg-rose-500/40 transition-colors relative" style={{ width: '30%' }}>
            {clamped > 70 && (
              <div
                className="h-full bg-rose-400 rounded-r-full transition-all duration-500"
                style={{ width: `${((clamped - 70) / 30) * 100}%` }}
              />
            )}
          </div>
        </div>

        {/* Labels & Threshold Markers */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>0 Normal</span>
          </div>
          <span className="text-slate-400">30</span>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Suspicious</span>
          </div>
          <span className="text-slate-400">70</span>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>100 Malicious</span>
          </div>
        </div>
      </div>
    </div>
  );
};
