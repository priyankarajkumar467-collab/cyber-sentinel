import React from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { RiskBar } from '../components/RiskBar';
import { AlertsTable } from '../components/AlertsTable';
import { ThreatCategories } from '../components/ThreatCategories';
import { BehaviorAnalysis } from '../components/BehaviorAnalysis';
import { DetectionPipeline } from '../components/DetectionPipeline';
import { PolicyGuardrail } from '../components/PolicyGuardrail';
import { SystemStats, AlertItem } from '../types/sentinel';

interface DashboardPageProps {
  stats: SystemStats | null;
  alerts: AlertItem[];
  loading: boolean;
  onSelectAlert: (alert: AlertItem) => void;
  onReviewHighestThreat: () => void;
  onThresholdChanged: (newThreshold: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  alerts,
  loading,
  onSelectAlert,
  onReviewHighestThreat,
  onThresholdChanged,
}) => {
  const currentRisk = stats?.current_risk ?? 72;
  const policyThreshold = stats?.policy_threshold ?? 70;
  const policyBreached = currentRisk >= policyThreshold;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Security Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time behavioral anomaly detection & explainable threat intelligence
          </p>
        </div>
      </div>

      {/* 1. Top Summary Cards (4 Cards) */}
      <SummaryCards stats={stats} loading={loading} />

      {/* 2. Risk Overview (Horizontal Indicator) */}
      <RiskBar riskScore={currentRisk} />

      {/* 3. Security Policy Guardrail */}
      <PolicyGuardrail
        threshold={policyThreshold}
        currentHighestRisk={currentRisk}
        onReviewThreat={onReviewHighestThreat}
        onThresholdChanged={onThresholdChanged}
      />

      {/* 4. Live Threat Alerts (Recent Threats Table) */}
      <AlertsTable
        alerts={alerts}
        loading={loading}
        onSelectAlert={onSelectAlert}
        maxRows={6}
        showFilters={true}
      />

      {/* 5. Behavioral Analysis Metrics */}
      <BehaviorAnalysis stats={stats} />

      {/* 6. Threat Types (5 Categories) */}
      <ThreatCategories stats={stats} />

      {/* 7. AI Detection Pipeline */}
      <DetectionPipeline
        currentRisk={currentRisk}
        policyBreached={policyBreached}
      />
    </div>
  );
};
