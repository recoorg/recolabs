import * as React from "react"
import { X, Check, Key, GitBranch, FolderGit2, RefreshCw, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react"
import { githubBlogService } from "@/services/githubBlogService"
import { GitHubConfig } from "@/types/blog"

interface GitHubSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export function GitHubSettingsModal({ isOpen, onClose, onSaved }: GitHubSettingsModalProps) {
  const [config, setConfig] = React.useState<GitHubConfig>(githubBlogService.getConfig())
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<{ success?: boolean; message?: string } | null>(null)
  const [pulling, setPulling] = React.useState(false)
  const [pullResult, setPullResult] = React.useState<{ success?: boolean; count?: number; message?: string } | null>(null)

  React.useEffect(() => {
    if (isOpen) {
      setConfig(githubBlogService.getConfig())
      setTestResult(null)
      setPullResult(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    githubBlogService.saveConfig(config)
    if (onSaved) onSaved()
    onClose()
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    const res = await githubBlogService.testConnection(config)
    setTesting(false)
    if (res.success) {
      setTestResult({
        success: true,
        message: `Connected as @${res.user.login} to repository ${config.owner}/${config.repo}!`,
      })
    } else {
      setTestResult({
        success: false,
        message: res.error || "Connection failed. Check token & permissions.",
      })
    }
  }

  const handlePullFromGitHub = async () => {
    setPulling(true)
    setPullResult(null)
    const res = await githubBlogService.pullPostsFromGitHub()
    setPulling(false)
    if (res.success) {
      setPullResult({
        success: true,
        count: res.count,
        message: `Successfully synchronized ${res.count} posts from GitHub!`,
      })
      if (onSaved) onSaved()
    } else {
      setPullResult({
        success: false,
        message: res.error || "Failed to pull posts from repository.",
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 text-zinc-900 dark:text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FA5D00]/10 border border-[#FA5D00]/30 flex items-center justify-center text-[#FA5D00]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-sans">GitHub Publication Engine</h2>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Save and commit posts directly to GitHub repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">
          
          {/* Token Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#FA5D00]" />
                Personal Access Token (PAT)
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Reco%20Labs%20Blog%20Publisher"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-[#FA5D00] hover:underline flex items-center gap-1"
              >
                Generate Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={config.token}
              onChange={(e) => setConfig({ ...config, token: e.target.value })}
              placeholder="ghp_... or github_pat_..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
            />
            <p className="mt-1 text-[11px] text-zinc-500 font-sans">
              Requires <code className="text-[#FA5D00]">repo</code> scope. Stored locally in your browser only.
            </p>
          </div>

          {/* Repo Owner and Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Repo Owner / Org
              </label>
              <input
                type="text"
                value={config.owner}
                onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                placeholder="recoorg"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Repository Name
              </label>
              <input
                type="text"
                value={config.repo}
                onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                placeholder="blog"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>
          </div>

          {/* Branch and Path */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                Target Branch
              </label>
              <input
                type="text"
                value={config.branch}
                onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                placeholder="main"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Posts Directory
              </label>
              <input
                type="text"
                value={config.path}
                onChange={(e) => setConfig({ ...config, path: e.target.value })}
                placeholder="posts"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>
          </div>

          {/* Test & Pull Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !config.token}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
              {testing ? "Testing..." : "Test Connection"}
            </button>

            <button
              type="button"
              onClick={handlePullFromGitHub}
              disabled={pulling || !config.token}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <FolderGit2 className={`w-3.5 h-3.5 ${pulling ? "animate-spin" : ""}`} />
              {pulling ? "Syncing..." : "Pull Posts From Repo"}
            </button>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-start gap-2 ${
                testResult.success
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
              }`}
            >
              {testResult.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {pullResult && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-start gap-2 ${
                pullResult.success
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400"
              }`}
            >
              {pullResult.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{pullResult.message}</span>
            </div>
          )}

          {/* Security Note */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            <span>
              <strong>Zero-server custody:</strong> Your GitHub credentials never pass through an intermediary backend. Commits are dispatched directly from your browser to GitHub's REST API.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95"
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  )
}
