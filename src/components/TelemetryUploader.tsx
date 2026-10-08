import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { analyzeTelemetryData } from '../services/api';
import { PipelineExecutionResult } from '../types/sentinel';

interface TelemetryUploaderProps {
  onAnalysisComplete: (result: PipelineExecutionResult | { results: PipelineExecutionResult[] }) => void;
}

export const TelemetryUploader: React.FC<TelemetryUploaderProps> = ({ onAnalysisComplete }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleDemoRecords = [
    {
      source_ip: '192.168.1.105',
      destination_ip: '10.0.0.12',
      dest_port: 80,
      protocol: 'TCP',
      packet_count: 520,
      byte_count: 22000,
      failed_logins: 0,
      conn_duration_sec: 20.0,
      tcp_flags: 'SYN',
      unique_ports: 38,
    },
    {
      source_ip: '192.168.1.72',
      destination_ip: '10.0.0.9',
      dest_port: 22,
      protocol: 'SSH',
      packet_count: 140,
      byte_count: 31000,
      failed_logins: 29,
      conn_duration_sec: 18.0,
      tcp_flags: 'SYN-ACK',
      unique_ports: 1,
    },
    {
      source_ip: '192.168.1.33',
      destination_ip: '10.0.0.2',
      dest_port: 443,
      protocol: 'HTTPS',
      packet_count: 15,
      byte_count: 11200,
      failed_logins: 0,
      conn_duration_sec: 12.0,
      tcp_flags: 'ACK',
      unique_ports: 1,
    },
  ];

  const handleUseDemoData = async () => {
    setAnalyzing(true);
    setFeedback(null);
    setErrorMsg(null);

    try {
      const res = await analyzeTelemetryData({ events: sampleDemoRecords });
      setFeedback('Successfully processed 3 demo telemetry records!');
      onAnalysisComplete(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error analyzing telemetry.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setFeedback(null);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let payload: any[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          payload = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          // Parse CSV
          const lines = text.trim().split('\n');
          if (lines.length <= 1) {
            throw new Error('CSV file has no data rows.');
          }
          const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',').map((v) => v.trim());
            if (vals.length < 2) continue;

            const rowObj: any = {};
            headers.forEach((h, idx) => {
              rowObj[h] = vals[idx];
            });

            payload.push({
              source_ip: rowObj.source_ip || rowObj.src_ip || '192.168.1.10',
              destination_ip: rowObj.destination_ip || rowObj.dst_ip || '10.0.0.5',
              dest_port: Number(rowObj.dest_port || rowObj.dst_port) || 80,
              protocol: rowObj.protocol || 'TCP',
              packet_count: Number(rowObj.packet_count) || 10,
              byte_count: Number(rowObj.byte_count) || 5000,
              failed_logins: Number(rowObj.failed_logins) || 0,
              conn_duration_sec: Number(rowObj.conn_duration_sec) || 5.0,
              tcp_flags: rowObj.tcp_flags || 'ACK',
              unique_ports: Number(rowObj.unique_ports) || 1,
            });
          }
        }

        const res = await analyzeTelemetryData({ events: payload });
        setFeedback(`Analyzed ${payload.length} telemetry records successfully.`);
        onAnalysisComplete(res);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse file format.');
      } finally {
        setAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
      setAnalyzing(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider font-mono">
          Analyze Network Data
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Ingest raw telemetry batches via CSV, JSON, or pre-loaded network capture samples
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv,.json"
          className="hidden"
        />

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={analyzing}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-slate-300" />
          <span>Upload File (CSV / JSON)</span>
        </button>

        {/* Use Demo Data Button */}
        <button
          onClick={handleUseDemoData}
          disabled={analyzing}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Use Demo Data</span>
        </button>
      </div>

      {/* Analyzing status */}
      {analyzing && (
        <div className="flex items-center space-x-2 text-xs font-medium text-indigo-400 bg-indigo-950/30 p-3 rounded-lg border border-indigo-900/40 animate-pulse">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <span>Analyzing telemetry...</span>
        </div>
      )}

      {/* Success feedback */}
      {feedback && !analyzing && (
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Error feedback */}
      {errorMsg && !analyzing && (
        <div className="flex items-center space-x-2 text-xs font-medium text-rose-400 bg-rose-950/30 p-3 rounded-lg border border-rose-900/40">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
