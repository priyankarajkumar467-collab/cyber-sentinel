import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  Key,
  FolderGit2,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Lock,
  Globe,
  UploadCloud,
} from 'lucide-react';
import {
  fetchGitHubPreview,
  pushToGitHubApi,
  GitHubPushResponse,
} from '../services/api';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('cyber-sentinel');
  const [branch, setBranch] = useState('main');
  const [isNewRepo, setIsNewRepo] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [commitMessage, setCommitMessage] = useState(
    'Initial commit: CYBER SENTINEL Intelligent Cyber Threat Detection'
  );

  const [previewFiles, setPreviewFiles] = useState<{
    files_count: number;
    file_paths: string[];
    excluded: string[];
  } | null>(null);
  const [showFileList, setShowFileList] = useState(false);

  // Push state
  const [isPushing, setIsPushing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pushResult, setPushResult] = useState<GitHubPushResponse | null>(null);

  const steps = [
    'Preparing files',
    'Connecting to GitHub',
    isNewRepo ? 'Creating repository' : 'Validating repository',
    'Uploading files',
    'Committing changes',
    'Push completed',
  ];

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setPushResult(null);
      setIsPushing(false);
      fetchGitHubPreview()
        .then((data) => setPreviewFiles(data))
        .catch((e) => console.error('Error fetching preview:', e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPushResult(null);

    if (!token.trim()) {
      setErrorMsg('Please enter your GitHub Personal Access Token (PAT).');
      return;
    }
    if (!owner.trim()) {
      setErrorMsg('Please enter your GitHub username or organization name.');
      return;
    }
    if (!repo.trim()) {
      setErrorMsg('Please enter a repository name.');
      return;
    }

    setIsPushing(true);
    setCurrentStepIndex(0);

    // Simulate stepping progress through the pipeline
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 500);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 1200);
    const timer3 = setTimeout(() => setCurrentStepIndex(3), 2000);
    const timer4 = setTimeout(() => setCurrentStepIndex(4), 3200);

    try {
      const res = await pushToGitHubApi({
        token: token.trim(),
        owner: owner.trim(),
        repo: repo.trim(),
        branch: branch.trim() || 'main',
        isNewRepo,
        isPrivate,
        commitMessage: commitMessage.trim(),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      setCurrentStepIndex(5);
      setPushResult(res);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setErrorMsg(err.message || 'Failed to push to GitHub.');
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
                <span>Push to GitHub</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Full Project Export
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Export complete source code and directory structure to your GitHub account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Success Result View */}
          {pushResult ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Push Successfully Completed!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your full project files have been committed to GitHub.
                  </p>
                </div>
              </div>

              {/* Details card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Repository:</span>
                  <span className="font-bold text-slate-200">
                    {pushResult.owner}/{pushResult.repo_name}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Branch:</span>
                  <span className="text-indigo-400 font-bold">{pushResult.branch}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Commit:</span>
                  <span className="text-slate-300">
                    {pushResult.commit_sha} — {pushResult.commit_message}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Files Exported:</span>
                  <span className="text-emerald-400 font-bold">
                    {pushResult.files_count} files
                  </span>
                </div>
              </div>

              {/* CTA Link */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={pushResult.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm text-center flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                >
                  <span>Open Repository on GitHub</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePush} className="space-y-4">
              {/* Security Warning */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-300 leading-relaxed">
                  <span className="font-semibold text-amber-300 block mb-0.5">
                    Security Assurance
                  </span>
                  Your token is transmitted directly in-memory to execute the GitHub API commit. It is never logged, stored in source code, or saved to the database.
                </div>
              </div>

              {/* GitHub Token */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>Personal Access Token (PAT)</span>
                  </span>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=CyberSentinelExport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Generate token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Requires 'repo' scope)"
                    required
                    disabled={isPushing}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fine-grained PAT with Repository "Contents: Read and write" or Classic PAT with <code className="text-slate-300">repo</code> scope.
                </p>
              </div>

              {/* Username & Repository Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-400" />
                    <span>GitHub Username / Org</span>
                  </label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. octocat"
                    required
                    disabled={isPushing}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Repository Name</span>
                  </label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="cyber-sentinel"
                    required
                    disabled={isPushing}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Repo Mode: New vs Existing */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Repository Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewRepo(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      isNewRepo
                        ? 'bg-slate-800 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isNewRepo ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                    <span>Create New Repository</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNewRepo(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      !isNewRepo
                        ? 'bg-slate-800 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${!isNewRepo ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                    <span>Push to Existing Repo</span>
                  </button>
                </div>
              </div>

              {/* Branch & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    <span>Branch</span>
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    disabled={isPushing}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {isNewRepo && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Visibility
                    </label>
                    <div className="flex items-center space-x-3 h-[38px] px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!isPrivate}
                          onChange={() => setIsPrivate(false)}
                          className="accent-indigo-500"
                        />
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>Public</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="visibility"
                          checked={isPrivate}
                          onChange={() => setIsPrivate(true)}
                          className="accent-indigo-500"
                        />
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Private</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Files Summary Accordion */}
              {previewFiles && (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  <button
                    type="button"
                    onClick={() => setShowFileList(!showFileList)}
                    className="w-full px-3.5 py-2.5 text-xs text-slate-300 flex items-center justify-between hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        Project Tree: <strong className="text-slate-100">{previewFiles.files_count} files</strong> ready
                      </span>
                    </div>
                    {showFileList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showFileList && (
                    <div className="p-3 border-t border-slate-800 text-[11px] font-mono space-y-2 max-h-40 overflow-y-auto">
                      <div className="text-slate-400">
                        <span className="text-slate-400 block font-semibold mb-1">Included files:</span>
                        {previewFiles.file_paths.map((p, i) => (
                          <div key={i} className="text-slate-300 truncate">
                            • {p}
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-800/60 text-slate-400">
                        <span>Excluded: </span>
                        <span className="text-rose-400">{previewFiles.excluded.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Stepper (Active during push) */}
              {isPushing && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                    <span className="flex items-center space-x-2">
                      <UploadCloud className="w-4 h-4 animate-bounce text-indigo-400" />
                      <span>Pushing project to GitHub...</span>
                    </span>
                    <span className="font-mono text-[11px]">
                      Step {currentStepIndex + 1} of {steps.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {steps.map((st, i) => {
                      const isDone = currentStepIndex > i;
                      const isCurrent = currentStepIndex === i;
                      return (
                        <div
                          key={i}
                          className={`flex items-center space-x-2 text-xs transition-colors ${
                            isDone
                              ? 'text-emerald-400'
                              : isCurrent
                              ? 'text-indigo-300 font-semibold animate-pulse'
                              : 'text-slate-400'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] shrink-0 ${
                                isCurrent
                                  ? 'border-indigo-400 text-indigo-400'
                                  : 'border-slate-700 text-slate-400'
                              }`}
                            >
                              {i + 1}
                            </span>
                          )}
                          <span>{st}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="block text-rose-200">Push Failed</strong>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPushing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPushing}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Github className="w-4 h-4" />
                  <span>{isPushing ? 'Pushing to GitHub...' : 'Push to GitHub'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
