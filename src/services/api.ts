import { SystemStats, AlertItem, PipelineExecutionResult, AlertStatus } from '../types/sentinel';

export async function fetchStats(): Promise<SystemStats> {
  const res = await fetch('/api/statistics');
  if (!res.ok) throw new Error('Failed to load system statistics.');
  return res.json();
}

export async function fetchAlerts(limit = 100): Promise<AlertItem[]> {
  const res = await fetch(`/api/alerts?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load alerts.');
  return res.json();
}

export async function fetchAlertById(id: string): Promise<AlertItem> {
  const res = await fetch(`/api/alerts/${id}`);
  if (!res.ok) throw new Error('Alert not found.');
  return res.json();
}

export async function updateAlertStatus(id: string, status: AlertStatus): Promise<boolean> {
  const res = await fetch(`/api/alerts/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status.');
  return true;
}

export async function runDemoScenario(
  scenario: 'normal' | 'port_scan' | 'brute_force' | 'data_exfiltration'
): Promise<PipelineExecutionResult> {
  const res = await fetch('/api/demo/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario }),
  });
  if (!res.ok) throw new Error('Failed to run demo scenario.');
  return res.json();
}

export async function analyzeTelemetryData(data: any): Promise<PipelineExecutionResult | { results: PipelineExecutionResult[] }> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to analyze telemetry.');
  }
  return res.json();
}

export async function updatePolicyThreshold(threshold: number): Promise<{ success: boolean; max_allowed_risk: number }> {
  const res = await fetch('/api/policy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ max_allowed_risk: threshold }),
  });
  if (!res.ok) throw new Error('Failed to update policy threshold.');
  return res.json();
}

export async function resetDatabase(): Promise<void> {
  const res = await fetch('/api/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database.');
}

export interface GitHubPushPayload {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  isNewRepo?: boolean;
  isPrivate?: boolean;
  commitMessage?: string;
}

export interface GitHubPushResponse {
  success: boolean;
  repo_name: string;
  owner: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  repo_url: string;
  files_count: number;
}

export async function fetchGitHubPreview(): Promise<{ files_count: number; file_paths: string[]; excluded: string[] }> {
  const res = await fetch('/api/github/preview');
  if (!res.ok) throw new Error('Failed to load project files preview.');
  return res.json();
}

export async function pushToGitHubApi(payload: GitHubPushPayload): Promise<GitHubPushResponse> {
  const res = await fetch('/api/github/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to push to GitHub.');
  }
  return res.json();
}
