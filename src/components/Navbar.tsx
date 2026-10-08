import React from 'react';
import { Shield, ShieldAlert, Play, RefreshCw, Github } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'alerts' | 'analyze' | 'about';
  setActiveTab: (tab: 'dashboard' | 'alerts' | 'analyze' | 'about') => void;
  systemStatus: 'Monitoring' | 'Threat Detected';
  currentRisk: number;
  onRunDemoClick: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenGitHubModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  currentRisk,
  onRunDemoClick,
  onRefresh,
  isRefreshing,
  onOpenGitHubModal,
}) => {
  const isThreat = systemStatus === 'Threat Detected' || currentRisk >= 70;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className={`p-2.5 rounded-xl border ${isThreat ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              {isThreat ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-wider text-base sm:text-lg text-slate-100 font-mono">
                  CYBER SENTINEL
                </span>
                {/* Status Indicator */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    isThreat
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isThreat ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  {isThreat ? '🔴 Threat Detected' : '🟢 System Monitoring'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-Time Cyber Threat & Network Anomaly Detection
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {(
              [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'alerts', label: 'Alerts' },
                { id: 'analyze', label: 'Analyze' },
                { id: 'about', label: 'About' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Run Demo Header CTA */}
            <button
              onClick={onRunDemoClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Run interactive hackathon telemetry scenario"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>▶ Run Demo</span>
            </button>

            {/* Push to GitHub Button */}
            <button
              onClick={onOpenGitHubModal}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Push project to GitHub"
            >
              <Github className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden md:inline">Push to GitHub</span>
              <span className="md:hidden">GitHub</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 transition-colors border border-transparent hover:border-slate-800 cursor-pointer disabled:opacity-50"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
