import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, Sliders, Check } from 'lucide-react';
import { updatePolicyThreshold } from '../services/api';

interface PolicyGuardrailProps {
  threshold: number;
  currentHighestRisk: number;
  onReviewThreat: () => void;
  onThresholdChanged: (newVal: number) => void;
}

export const PolicyGuardrail: React.FC<PolicyGuardrailProps> = ({
  threshold,
  currentHighestRisk,
  onReviewThreat,
  onThresholdChanged,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(threshold);
  const [saving, setSaving] = useState(false);

  const isBreached = currentHighestRisk >= threshold;

  const handleSaveThreshold = async () => {
    setSaving(true);
    try {
      await updatePolicyThreshold(tempThreshold);
      onThresholdChanged(tempThreshold);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm transition-all ${
        isBreached
          ? 'bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 border-rose-500/40'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Security Policy
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold border ${
                isBreached
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isBreached ? '🔴 POLICY BREACH' : '🟢 POLICY COMPLIANT'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Risk-based operational guardrails for autonomous alerting
          </p>
        </div>

        {/* Adjust Policy Threshold */}
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setTempThreshold(threshold);
                setIsEditing(true);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 flex items-center space-x-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>Configure (Max: {threshold})</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-mono">Max Risk:</span>
              <input
                type="number"
                min={10}
                max={100}
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                className="w-12 bg-slate-900 text-xs font-mono px-1 py-0.5 border border-slate-700 rounded text-center text-slate-100"
              />
              <button
                onClick={handleSaveThreshold}
                disabled={saving}
                className="px-2 py-0.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Risk Comparison Numbers */}
        <div className="flex items-center space-x-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 uppercase block font-medium">
              Maximum Allowed Risk
            </span>
            <span className="text-xl font-bold font-mono text-slate-200">
              {threshold}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div>
            <span className="text-[11px] text-slate-400 uppercase block font-medium">
              Current Highest Risk
            </span>
            <span
              className={`text-xl font-bold font-mono ${
                isBreached ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {currentHighestRisk}
            </span>
          </div>
        </div>

        {/* Policy Message */}
        <div className="md:col-span-1 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
          {isBreached ? (
            <p className="text-rose-300">
              “A detected threat exceeded the configured maximum risk level.”
            </p>
          ) : (
            <p className="text-slate-300">
              “All network telemetry is currently operating within approved risk limits.”
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex md:justify-end">
          {isBreached ? (
            <button
              onClick={onReviewThreat}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Review Threat</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Guardrails active & compliant</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
