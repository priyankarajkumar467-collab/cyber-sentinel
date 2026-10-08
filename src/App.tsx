import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { AboutPage } from './pages/AboutPage';
import { ThreatDetailPanel } from './components/ThreatDetailPanel';
import { GitHubModal } from './components/GitHubModal';
import { fetchStats, fetchAlerts, updateAlertStatus, resetDatabase } from './services/api';
import { SystemStats, AlertItem, PipelineExecutionResult } from './types/sentinel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'analyze' | 'about'>('dashboard');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [fetchedStats, fetchedAlerts] = await Promise.all([
        fetchStats(),
        fetchAlerts(50),
      ]);
      setStats(fetchedStats);
      setAlerts(fetchedAlerts);
    } catch (err) {
      console.error('Failed to load Sentinel data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Poll every 15 seconds to reflect live telemetry updates
    const timer = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [loadData]);

  // Handle reviewing the highest threat triggered from policy breach banner
  const handleReviewHighestThreat = () => {
    if (alerts.length === 0) return;
    const sorted = [...alerts].sort((a, b) => b.risk_score - a.risk_score);
    if (sorted[0]) {
      setSelectedAlert(sorted[0]);
    }
  };

  // Handle updating alert status (Reviewed / Resolved)
  const handleUpdateStatus = async (id: string, status: 'New' | 'Reviewed' | 'Resolved') => {
    try {
      await updateAlertStatus(id, status);
      setAlerts((prev) =>
        prev.map((a) => (a.alert_id === id ? { ...a, status } : a))
      );
      if (selectedAlert && selectedAlert.alert_id === id) {
        setSelectedAlert((prev) => (prev ? { ...prev, status } : null));
      }
      loadData(true);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Handle results from demo or telemetry upload
  const handleTelemetryProcessed = (
    result: PipelineExecutionResult | { results: PipelineExecutionResult[] }
  ) => {
    loadData(true);
    if ('alert_id' in result) {
      // Find and select this newly processed alert
      setTimeout(() => {
        setSelectedAlert({
          alert_id: result.alert_id,
          timestamp: result.timestamp,
          source_ip: result.source_ip,
          destination_ip: result.destination_ip,
          classification: result.classification,
          risk_score: result.risk_score,
          evidence_features: JSON.stringify({
            bullets: result.evidence_bullets,
          }),
          ai_explanation: result.ai_explanation,
          status: result.status,
        });
      }, 300);
    }
  };

  const handleResetData = async () => {
    try {
      await resetDatabase();
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={stats?.system_status || 'Monitoring'}
        currentRisk={stats?.current_risk || 72}
        onRunDemoClick={() => setActiveTab('analyze')}
        onRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            alerts={alerts}
            loading={loading}
            onSelectAlert={(a) => setSelectedAlert(a)}
            onReviewHighestThreat={handleReviewHighestThreat}
            onThresholdChanged={() => loadData(true)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPage
            alerts={alerts}
            stats={stats}
            loading={loading}
            onSelectAlert={(a) => setSelectedAlert(a)}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzePage onTelemetryProcessed={handleTelemetryProcessed} />
        )}

        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* 3. Threat Detail Panel Modal */}
      <ThreatDetailPanel
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* 4. GitHub Export & Push Modal */}
      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* 5. Minimalist Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-400">CYBER SENTINEL</span>
            <span>•</span>
            <span>Behavioral Network Anomaly Detection Prototype</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Push to GitHub
            </button>
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset SQLite database to baseline hackathon scenario"
            >
              Reset Demo State
            </button>
            <span className="text-slate-400">SQLite Audit Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
