import * as React from "react"
import { X, ShieldCheck, Key, Mail, AlertCircle, Check, Loader2 } from "lucide-react"
import { networkApi, UserProfile } from "@/services/networkApi"
import { identifyUser, trackEvent } from "@/lib/analytics"

interface BuilderSignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: UserProfile) => void
}

export function BuilderSignInModal({ isOpen, onClose, onSuccess }: BuilderSignInModalProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  if (!isOpen) return null

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Email and password are required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await networkApi.login({ email, password })
      // Identify builder with opaque ID (never raw email)
      identifyUser(res.user.id, {
        username: res.user.username,
        auth_provider: res.user.auth_provider || "database",
      })
      trackEvent("builder_signed_in", {
        username: res.user.username,
        has_website: Boolean(res.user.website),
      })
      setSuccess(true)
      setTimeout(() => {
        onSuccess(res.user)
        onClose()
      }, 700)
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Verify your builder credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 text-zinc-900 dark:text-zinc-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="w-12 h-12 rounded-2xl bg-[#FA5D00]/10 border border-[#FA5D00]/30 flex items-center justify-center text-[#FA5D00] mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-zinc-950 dark:text-white">Builder Sign In</h2>
          <p className="text-xs font-mono text-zinc-500 mt-1 max-w-xs">
            Only verified Reco Labs builders can publish dispatches to <code className="text-[#FA5D00]">recoorg/blog</code>.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSignIn} className="mt-5 space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Builder Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.com"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00] transition-colors"
              />
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-mono text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Authenticated via Supabase. Welcome back!</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2.5 rounded-xl bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Security note */}
          <p className="text-[11px] font-mono text-center text-zinc-500 pt-1">
            Connected to Supabase authentication server.
          </p>

        </form>

      </div>
    </div>
  )
}
