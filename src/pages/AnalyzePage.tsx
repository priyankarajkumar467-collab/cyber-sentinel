import React from 'react';
import { DemoRunner } from '../components/DemoRunner';
import { TelemetryUploader } from '../components/TelemetryUploader';
import { PipelineExecutionResult } from '../types/sentinel';

interface AnalyzePageProps {
  onTelemetryProcessed: (result: PipelineExecutionResult | { results: PipelineExecutionResult[] }) => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ onTelemetryProcessed }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          Telemetry Analysis & Live Demo
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Ingest raw network events or run deterministic scenario simulations
        </p>
      </div>

      {/* 1. Hackathon Interactive Demo (Section 12) */}
      <DemoRunner onDemoCompleted={(res) => onTelemetryProcessed(res)} />

      {/* 2. File Ingestion & Demo Data (Section 11) */}
      <TelemetryUploader onAnalysisComplete={(res) => onTelemetryProcessed(res)} />
    </div>
  );
};
