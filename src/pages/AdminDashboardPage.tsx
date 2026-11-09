"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import {
  Mail,
  Send,
  Check,
  CheckSquare,
  Square,
  Users,
  UserCheck,
  ShieldCheck,
  Copy,
  ExternalLink,
  Eye,
  Code,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Trash2,
  Plus,
  Search,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  Layers,
  Flame,
  ArrowRight,
  Monitor,
  Smartphone,
  ChevronRight,
  FileText,
} from "lucide-react"
import { networkApi } from "@/services/networkApi"

interface BuilderUser {
  id: number
  name: string
  username: string
  email: string
  is_verified: boolean
  is_pro: boolean
  plan?: string
  avatar_url?: string
  created_at: string
}

// Pre-crafted responsive HTML email templates
const EMAIL_TEMPLATES = [
  {
    id: "announcement",
    name: "Reco Branded Announcement",
    description: "Dark luxury card with orange accents, Reco Labs logo badge & CTA button",
    subject: "✨ Important Announcement from Reco Labs Guild",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0c0e; color: #f4f4f5; margin: 0; padding: 40px 16px; }
    .wrapper { max-width: 580px; margin: 0 auto; background-color: #121214; border: 1px solid #27272a; border-radius: 20px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .brand-row { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; text-decoration: none; }
    .brand-badge { background-color: #FA5D00; color: #000000; width: 32px; height: 32px; border-radius: 50%; font-weight: 900; font-family: monospace; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; text-align: center; line-height: 32px; }
    .brand-name { color: #ffffff; font-weight: 800; font-family: monospace; font-size: 15px; letter-spacing: -0.5px; }
    .tag { display: inline-block; background-color: rgba(250, 93, 0, 0.15); color: #FA5D00; border: 1px solid rgba(250, 93, 0, 0.4); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; font-family: monospace; }
    h1 { font-size: 26px; font-weight: 700; color: #ffffff; line-height: 1.25; margin: 0 0 16px 0; letter-spacing: -0.5px; }
    p { font-size: 14px; line-height: 1.7; color: #a1a1aa; margin: 0 0 16px 0; }
    .highlight-box { background-color: #18181b; border: 1px solid #27272a; border-left: 3px solid #FA5D00; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #e4e4e7; line-height: 1.6; }
    .btn-container { text-align: center; margin: 32px 0 24px 0; }
    .btn { display: inline-block; background-color: #FA5D00; color: #000000 !important; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-family: monospace; box-shadow: 0 4px 14px rgba(250, 93, 0, 0.35); }
    .footer { margin-top: 36px; padding-top: 24px; border-top: 1px solid #27272a; font-size: 11px; color: #71717a; text-align: center; font-family: monospace; line-height: 1.6; }
    .footer a { color: #FA5D00; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="brand-row">
      <div class="brand-badge">R</div>
      <span class="brand-name">RECO LABS</span>
    </div>
    <span class="tag">COMMUNITY DISPATCH</span>
    <h1>Building the Future with Reco Labs</h1>
    <p>Hey Builder,</p>
    <p>We are rolling out major platform upgrades to celebrate builders shipping peer-proofed software and hardware across our network.</p>
    <div class="highlight-box">
      <strong>🚀 What's New:</strong> Explore our enhanced Founder Network, filtered job opportunities, and weekly spotlights. Your profile is already live on the guild directory.
    </div>
    <p>Dive into the network to discover verified projects, connect with founders, and boost your tools to the platform top.</p>
    <div class="btn-container">
      <a href="https://recolabs.in/network" class="btn">Explore Network ↗</a>
    </div>
    <div class="footer">
      Dispatched to registered builders of <a href="https://recolabs.in">recolabs.in</a><br>
      © 2026 Reco Labs. Backed by peer proof.
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: "hackathon",
    name: "Hackathon & Builder Invite",
    description: "Event invite format with orange accent, dates, and RSVP CTA",
    subject: "⚡ Exclusive Hackathon Invite for Reco Labs Builders",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0c0e; color: #f4f4f5; margin: 0; padding: 40px 16px; }
    .wrapper { max-width: 580px; margin: 0 auto; background-color: #111113; border: 1px solid #27272a; border-radius: 20px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .tag { display: inline-block; background-color: rgba(250, 93, 0, 0.12); color: #FA5D00; border: 1px solid rgba(250, 93, 0, 0.35); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; font-family: monospace; }
    h1 { font-size: 26px; font-weight: 700; color: #ffffff; line-height: 1.25; margin: 0 0 16px 0; }
    p { font-size: 14px; line-height: 1.7; color: #a1a1aa; margin: 0 0 16px 0; }
    .event-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin: 24px 0; }
    .event-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; font-family: monospace; border-bottom: 1px solid #27272a; }
    .event-row:last-child { border-bottom: none; }
    .event-label { color: #71717a; }
    .event-value { color: #ffffff; font-weight: bold; }
    .btn-container { text-align: center; margin: 32px 0 20px 0; }
    .btn { display: inline-block; background-color: #FA5D00; color: #000000 !important; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-family: monospace; }
    .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 11px; color: #71717a; text-align: center; font-family: monospace; }
  </style>
</head>
<body>
  <div class="wrapper">
    <span class="tag">⚡ UPCOMING EVENT</span>
    <h1>Join the Next Global Builder Hackathon</h1>
    <p>Hey there,</p>
    <p>You're invited to join hundreds of builders shipping cutting-edge AI tools, open-source projects, and hardware prototypes.</p>
    <div class="event-card">
      <div class="event-row"><span class="event-label">EVENT:</span><span class="event-value">Reco Labs Global Hack Sprint</span></div>
      <div class="event-row"><span class="event-label">DATE:</span><span class="event-value">Coming this Weekend</span></div>
      <div class="event-row"><span class="event-label">FORMAT:</span><span class="event-value">Virtual / Worldwide</span></div>
      <div class="event-row"><span class="event-label">TRACKS:</span><span class="event-value">AI, DevTools, Web3, Hardware</span></div>
    </div>
    <p>Form a squad or ship solo. High-ranking projects will receive direct spotlight on the platform homepage.</p>
    <div class="btn-container">
      <a href="https://recolabs.in/hackathons" class="btn">Register Free ↗</a>
    </div>
    <div class="footer">
      Reco Labs Guild · <a href="https://recolabs.in/hackathons" style="color: #FA5D00;">recolabs.in/hackathons</a>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: "minimal",
    name: "Minimal Clean Letter",
    description: "Crisp black & white letterhead for personal founder updates",
    subject: "A quick note from Reco Labs",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #18181b; margin: 0; padding: 40px 20px; }
    .card { max-width: 540px; margin: 0 auto; }
    h2 { font-size: 22px; font-weight: 600; margin: 0 0 20px 0; color: #09090b; }
    p { font-size: 15px; line-height: 1.7; color: #3f3f46; margin: 0 0 16px 0; }
    a { color: #FA5D00; font-weight: 600; text-decoration: none; }
    .sig { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7; font-size: 13px; color: #71717a; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Quick Update from Reco Labs</h2>
    <p>Hey,</p>
    <p>Just checking in with an update on what we've been building for the developer and founder community.</p>
    <p>If you have any feedback or want to feature your recent projects, reply directly to this email or visit our <a href="https://recolabs.in/network">Founder Network</a>.</p>
    <div class="sig">
      Best,<br>
      <strong>Aditya & The Reco Labs Team</strong><br>
      <a href="https://recolabs.in">recolabs.in</a>
    </div>
  </div>
</body>
</html>`,
  },
]

export function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = React.useState<any>(null)
  const [adminKey, setAdminKey] = React.useState<string>(() => {
    return sessionStorage.getItem("recolabs_admin_key") || ""
  })
  const [passkeyInput, setPasskeyInput] = React.useState("")
  const [authError, setAuthError] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"email" | "builders" | "spotlight">("email")

  // Builders State
  const [builders, setBuilders] = React.useState<BuilderUser[]>([])
  const [loadingBuilders, setLoadingBuilders] = React.useState(false)
  const [builderSearch, setBuilderSearch] = React.useState("")
  const [builderFilter, setBuilderFilter] = React.useState<"ALL" | "VERIFIED" | "PRO">("ALL")

  // Email Studio State
  const [selectedBuilderIds, setSelectedBuilderIds] = React.useState<Set<number>>(new Set())
  const [customEmails, setCustomEmails] = React.useState<string[]>([])
  const [customEmailInput, setCustomEmailInput] = React.useState("")
  const [emailSubject, setEmailSubject] = React.useState(EMAIL_TEMPLATES[0].subject)
  const [emailHtml, setEmailHtml] = React.useState(EMAIL_TEMPLATES[0].html)
  const [senderName, setSenderName] = React.useState("Reco Labs")
  const [editorMode, setEditorMode] = React.useState<"code" | "preview" | "split">("split")
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "mobile">("desktop")

  // Dispatch state
  const [sending, setSending] = React.useState(false)
  const [sendResult, setSendResult] = React.useState<{
    success: boolean
    message?: string
    count?: number
    provider?: string
    messageId?: string
  } | null>(null)
  const [copiedStatus, setCopiedStatus] = React.useState("")

  // Check login on mount
  React.useEffect(() => {
    const u = networkApi.getCurrentUser()
    setCurrentUser(u)
  }, [])

  const isUserAdmin = Boolean(
    currentUser?.username === "rawenergon" ||
    currentUser?.email === "devadibxr@gmail.com" ||
    adminKey.trim().length > 0
  )

  // Fetch builders on auth
  const loadBuilders = React.useCallback(async (key?: string) => {
    setLoadingBuilders(true)
    const effectiveKey = key || adminKey
    const res = await networkApi.adminListBuilders(effectiveKey)
    if (res.success && res.builders) {
      setBuilders(res.builders)
    }
    setLoadingBuilders(false)
  }, [adminKey])

  React.useEffect(() => {
    if (isUserAdmin) {
      loadBuilders()
    }
  }, [isUserAdmin, loadBuilders])

  // Handle Passkey submission
  const handleUnlockAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setAuthError("")
    const key = passkeyInput.trim()
    if (!key) {
      setAuthError("Please enter the master admin key.")
      return
    }

    const test = await networkApi.adminListBuilders(key)
    if (test.success) {
      setAdminKey(key)
      sessionStorage.setItem("recolabs_admin_key", key)
      setBuilders(test.builders)
      setPasskeyInput("")
    } else {
      setAuthError("Invalid admin secret passkey. Access denied.")
    }
  }

  // Filtered Builders list
  const filteredBuilders = React.useMemo(() => {
    return builders.filter((b) => {
      if (builderFilter === "VERIFIED" && !b.is_verified) return false
      if (builderFilter === "PRO" && !b.is_pro) return false
      if (!builderSearch.trim()) return true
      const q = builderSearch.toLowerCase().trim()
      return (
        b.name?.toLowerCase().includes(q) ||
        b.username?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q)
      )
    })
  }, [builders, builderFilter, builderSearch])

  // Select / Deselect All Builders
  const isAllBuildersSelected =
    builders.length > 0 && builders.every((b) => selectedBuilderIds.has(b.id))

  const toggleSelectAllBuilders = () => {
    if (isAllBuildersSelected) {
      setSelectedBuilderIds(new Set())
    } else {
      const allIds = new Set<number>(builders.map((b) => b.id))
      setSelectedBuilderIds(allIds)
    }
  }

  const toggleSelectBuilder = (id: number) => {
    const next = new Set(selectedBuilderIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedBuilderIds(next)
  }

  // Handle Custom Emails
  const handleAddCustomEmail = (rawText?: string) => {
    const text = rawText || customEmailInput
    if (!text.trim()) return

    // Split by comma, space, newline or semicolon
    const items = text
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 4 && e.includes("@") && e.includes("."))

    if (items.length > 0) {
      setCustomEmails((prev) => Array.from(new Set([...prev, ...items])))
      setCustomEmailInput("")
    }
  }

  const removeCustomEmail = (email: string) => {
    setCustomEmails((prev) => prev.filter((e) => e !== email))
  }

  // Compute final recipients array
  const finalRecipients = React.useMemo(() => {
    const builderEmails = builders
      .filter((b) => selectedBuilderIds.has(b.id))
      .map((b) => b.email.trim().toLowerCase())

    return Array.from(new Set([...builderEmails, ...customEmails])).filter(Boolean)
  }, [builders, selectedBuilderIds, customEmails])

  // Copy all emails
  const copyAllBuilderEmails = () => {
    const emails = builders.map((b) => b.email).filter(Boolean).join(", ")
    navigator.clipboard.writeText(emails)
    setCopiedStatus("Copied All Builder Emails!")
    setTimeout(() => setCopiedStatus(""), 3000)
  }

  // Dispatch Email Broadcast
  const handleDispatchEmail = async (isTest = false) => {
    setSendResult(null)
    const targetRecipients = isTest
      ? [currentUser?.email || "devadibxr@gmail.com"]
      : finalRecipients

    if (targetRecipients.length === 0) {
      alert("No recipients selected! Select builders or add custom email addresses.")
      return
    }

    if (!emailSubject.trim()) {
      alert("Please enter a subject line.")
      return
    }

    if (!emailHtml.trim()) {
      alert("Please provide email HTML content.")
      return
    }

    if (!isTest && !confirm(`Confirm dispatch to ${targetRecipients.length} recipient(s)?`)) {
      return
    }

    setSending(true)
    try {
      const res = await networkApi.adminSendEmail(
        {
          to: targetRecipients,
          subject: emailSubject,
          html: emailHtml,
          senderName: senderName || "Reco Labs",
        },
        adminKey
      )

      if (res.success) {
        setSendResult({
          success: true,
          count: res.count || targetRecipients.length,
          provider: res.provider || "verified_delivery",
          messageId: res.messageId,
          message: isTest
            ? `Test email sent to ${targetRecipients[0]}`
            : `Broadcast sent to ${targetRecipients.length} recipient(s) successfully!`,
        })
      } else {
        setSendResult({
          success: false,
          message: res.error || "Failed to dispatch email broadcast.",
        })
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || "Delivery error occurred.",
      })
    } finally {
      setSending(false)
    }
  }

  // Toggle user verification in tab 2
  const handleToggleVerify = async (userId: number) => {
    const success = await networkApi.adminToggleUserVerify(userId, adminKey)
    if (success) {
      setBuilders((prev) =>
        prev.map((b) => (b.id === userId ? { ...b, is_verified: !b.is_verified } : b))
      )
    }
  }

  // ==========================================
  // Render: Passkey Prompt if not authorized
  // ==========================================
  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-[#121214] shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FA5D00] text-black font-mono font-black flex items-center justify-center text-lg shadow-md">
              R
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight">Operator Terminal</h1>
              <p className="font-mono text-xs text-zinc-400">Reco Labs Admin Access</p>
            </div>
          </div>

          <p className="font-mono text-xs text-zinc-400 leading-relaxed">
            Administrative access is restricted. Please sign in with an authorized admin account or provide the master passkey.
          </p>

          <form onSubmit={handleUnlockAdmin} className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase font-bold text-zinc-300 mb-1.5">
                Master Passkey:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FA5D00] transition-colors"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 font-mono text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-none text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FA5D00] hover:bg-[#ff6e1a] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/network" className="font-mono text-xs text-zinc-500 hover:text-zinc-300">
              ← Return to Reco Labs Network
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // Render: Full Admin Dashboard
  // ==========================================
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-24">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/90 bg-[#0c0c0e]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/network" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#FA5D00] text-black font-mono font-black flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
                R
              </div>
              <span className="font-mono font-bold text-sm tracking-tight text-white">RECO LABS</span>
            </Link>
            <span className="text-zinc-600 font-mono">/</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-[#FA5D00] border border-zinc-700">
              ADMIN CONSOLE
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab("email")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "email"
                  ? "bg-[#FA5D00] text-black font-bold shadow-xs"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Broadcast Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("builders")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "builders"
                  ? "bg-[#FA5D00] text-black font-bold shadow-xs"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Builders ({builders.length})</span>
            </button>

            <Link
              to="/dashboard"
              className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>User Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================== */}
        {/* TAB 1: EMAIL BROADCAST STUDIO                              */}
        {/* ========================================================== */}
        {activeTab === "email" && (
          <div className="space-y-8">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
                  Email Broadcast Studio
                </h1>
                <p className="font-mono text-xs text-zinc-400 mt-1">
                  Dispatch custom responsive HTML emails via verified Resend API & Gmail SMTP to builders or custom recipient lists.
                </p>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SMTP & Resend Ready</span>
                </span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-400">
                  <strong className="text-white">{builders.length}</strong> Registered Builders
                </span>
              </div>
            </div>

            {/* Step 1: Select Recipients */}
            <div className="p-6 rounded-3xl border border-zinc-800 bg-[#121214] shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FA5D00]" />
                    <span>1. Select Recipients</span>
                  </h2>
                  <p className="font-mono text-xs text-zinc-400 mt-0.5">
                    Choose from registered platform builders, add custom email addresses, or select all with one click.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={toggleSelectAllBuilders}
                    className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAllBuildersSelected
                        ? "bg-[#FA5D00] text-black border-[#FA5D00]"
                        : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500"
                    }`}
                  >
                    {isAllBuildersSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{isAllBuildersSelected ? "Deselect All Builders" : `Select All (${builders.length} Builders)`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBuilderIds(new Set())
                      setCustomEmails([])
                    }}
                    className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-xs transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Builder Selector Sub-Panel */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={builderSearch}
                      onChange={(e) => setBuilderSearch(e.target.value)}
                      placeholder="Search builders by name, username or email..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#FA5D00]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {(["ALL", "VERIFIED", "PRO"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setBuilderFilter(f)}
                        className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          builderFilter === f
                            ? "bg-zinc-800 text-[#FA5D00] border-zinc-700 font-bold"
                            : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Builders Grid / List */}
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {loadingBuilders ? (
                    <div className="col-span-full py-8 text-center font-mono text-xs text-zinc-500 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#FA5D00] animate-spin" />
                      <span>Loading builders...</span>
                    </div>
                  ) : filteredBuilders.length === 0 ? (
                    <div className="col-span-full py-6 text-center font-mono text-xs text-zinc-500">
                      No builders match current search.
                    </div>
                  ) : (
                    filteredBuilders.map((b) => {
                      const isSelected = selectedBuilderIds.has(b.id)
                      return (
                        <div
                          key={b.id}
                          onClick={() => toggleSelectBuilder(b.id)}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${
                            isSelected
                              ? "border-[#FA5D00] bg-[#FA5D00]/10 shadow-xs"
                              : "border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex-none overflow-hidden flex items-center justify-center text-[11px] font-bold text-white">
                              {b.avatar_url ? (
                                <img src={b.avatar_url} alt={b.name} className="w-full h-full object-cover" />
                              ) : (
                                (b.name || "B")[0].toUpperCase()
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-mono text-xs font-bold text-white truncate flex items-center gap-1">
                                <span>{b.name}</span>
                                {b.is_verified && <ShieldCheck className="w-3 h-3 text-blue-400 flex-none" />}
                              </div>
                              <div className="font-mono text-[10px] text-zinc-400 truncate">
                                {b.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex-none">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#FA5D00]" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Custom Add Emails Bar */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <label className="block font-mono text-xs font-bold text-zinc-300">
                  + Add Custom Emails (Comma or space separated):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddCustomEmail()
                      }
                    }}
                    placeholder="e.g. founder@company.com, investor@fund.vc, test@gmail.com"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FA5D00]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomEmail()}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Active Selected Summary Chips */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#FA5D00]" />
                    <span>Active Selected Recipients:</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FA5D00] text-black font-black text-[11px]">
                      {finalRecipients.length}
                    </span>
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    ({selectedBuilderIds.size} Builders + {customEmails.length} Custom)
                  </span>
                </div>

                {finalRecipients.length === 0 ? (
                  <p className="font-mono text-xs text-zinc-500 italic">
                    No recipients selected yet. Click &quot;Select All (19 Builders)&quot; above or type custom emails.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {finalRecipients.map((email) => {
                      const isCustom = customEmails.includes(email)
                      return (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-[11px]"
                        >
                          <span className={isCustom ? "text-[#FA5D00]" : "text-zinc-400"}>
                            {isCustom ? "custom:" : "builder:"}
                          </span>
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isCustom) {
                                removeCustomEmail(email)
                              } else {
                                const found = builders.find((b) => b.email.toLowerCase() === email)
                                if (found) toggleSelectBuilder(found.id)
                              }
                            }}
                            className="text-zinc-500 hover:text-red-400 cursor-pointer ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Compose Email HTML & Presets */}
            <div className="p-6 rounded-3xl border border-zinc-800 bg-[#121214] shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#FA5D00]" />
                    <span>2. Compose HTML Email</span>
                  </h2>
                  <p className="font-mono text-xs text-zinc-400 mt-0.5">
                    Write custom HTML, pick from responsive branded presets, and preview in real time before sending.
                  </p>
                </div>

                {/* Template Preset Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs text-zinc-500 mr-1">Preset:</span>
                  {EMAIL_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setEmailSubject(tmpl.subject)
                        setEmailHtml(tmpl.html)
                      }}
                      className="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 hover:border-[#FA5D00] text-zinc-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject & Sender Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300">
                    Subject Line:
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject line..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300">
                    Sender Display Name:
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Reco Labs"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setEditorMode("code")}
                    className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      editorMode === "code"
                        ? "bg-[#FA5D00] text-black border-[#FA5D00] font-bold"
                        : "border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    HTML Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      editorMode === "preview"
                        ? "bg-[#FA5D00] text-black border-[#FA5D00] font-bold"
                        : "border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Live Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("split")}
                    className={`hidden lg:inline-block px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      editorMode === "split"
                        ? "bg-[#FA5D00] text-black border-[#FA5D00] font-bold"
                        : "border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Split View
                  </button>
                </div>

                {/* Device preview toggles */}
                {(editorMode === "preview" || editorMode === "split") && (
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        previewDevice === "desktop"
                          ? "bg-zinc-800 text-[#FA5D00] border-zinc-700"
                          : "border-zinc-800 text-zinc-500 hover:text-white"
                      }`}
                      title="Desktop Preview"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        previewDevice === "mobile"
                          ? "bg-zinc-800 text-[#FA5D00] border-zinc-700"
                          : "border-zinc-800 text-zinc-500 hover:text-white"
                      }`}
                      title="Mobile Preview"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Code & Preview Split Container */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* HTML Textarea */}
                {(editorMode === "code" || editorMode === "split") && (
                  <div className={editorMode === "code" ? "col-span-full" : ""}>
                    <div className="flex items-center justify-between pb-1.5 font-mono text-[11px] text-zinc-500">
                      <span>HTML Document Body:</span>
                      <span>{emailHtml.length} characters</span>
                    </div>
                    <textarea
                      value={emailHtml}
                      onChange={(e) => setEmailHtml(e.target.value)}
                      rows={18}
                      className="w-full p-4 rounded-2xl border border-zinc-800 bg-[#09090b] font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-[#FA5D00] resize-y selection:bg-[#FA5D00] selection:text-black"
                    />
                  </div>
                )}

                {/* Live Preview Frame */}
                {(editorMode === "preview" || editorMode === "split") && (
                  <div className={editorMode === "preview" ? "col-span-full" : ""}>
                    <div className="flex items-center justify-between pb-1.5 font-mono text-[11px] text-zinc-500">
                      <span>Live Rendered Email Preview:</span>
                      <span className="capitalize">{previewDevice} View</span>
                    </div>

                    <div
                      className={`rounded-2xl border border-zinc-800 bg-black/90 p-3 sm:p-4 shadow-inner overflow-hidden mx-auto transition-all ${
                        previewDevice === "mobile" ? "max-w-sm" : "w-full"
                      }`}
                    >
                      {/* Simulated email client subject bar */}
                      <div className="mb-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-1">
                        <div className="text-zinc-400 truncate">
                          <strong className="text-zinc-200">From:</strong> {senderName} &lt;noreply@recolabs.in&gt;
                        </div>
                        <div className="text-zinc-400 truncate">
                          <strong className="text-zinc-200">To:</strong> {finalRecipients.length > 0 ? finalRecipients[0] : "recipient@builder.dev"}
                          {finalRecipients.length > 1 && ` (+${finalRecipients.length - 1} BCC)`}
                        </div>
                        <div className="text-white font-bold truncate">
                          <strong className="text-zinc-400 font-normal">Subject:</strong> {emailSubject}
                        </div>
                      </div>

                      {/* Rendered HTML Container */}
                      <div
                        className="rounded-xl overflow-hidden bg-[#0c0c0e] min-h-[380px] max-h-[500px] overflow-y-auto border border-zinc-800/80 p-2"
                        dangerouslySetInnerHTML={{ __html: emailHtml }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Dispatch Actions & Logs */}
            <div className="p-6 rounded-3xl border border-zinc-800 bg-[#121214] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                    3. Dispatch Broadcast
                  </h3>
                  <p className="font-mono text-xs text-zinc-400 mt-0.5">
                    Ready to send to {finalRecipients.length} verified recipient(s). Privacy protected via BCC delivery.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => handleDispatchEmail(true)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Send Test to Me
                  </button>

                  <button
                    type="button"
                    disabled={sending || finalRecipients.length === 0}
                    onClick={() => handleDispatchEmail(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#FA5D00] hover:bg-[#ff6e1a] text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send to {finalRecipients.length} Recipient(s)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Delivery Result Message */}
              {sendResult && (
                <div
                  className={`p-4 rounded-2xl border font-mono text-xs flex items-start gap-3 animate-in fade-in ${
                    sendResult.success
                      ? "bg-emerald-950/60 border-emerald-800 text-emerald-200"
                      : "bg-red-950/60 border-red-800 text-red-200"
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-none mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-none mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold">{sendResult.message}</div>
                    {sendResult.success && (
                      <div className="text-[11px] text-emerald-400/80">
                        Provider: {sendResult.provider} · MessageId: {sendResult.messageId || "confirmed"} · Count: {sendResult.count}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: REGISTERED BUILDERS DIRECTORY                       */}
        {/* ========================================================== */}
        {activeTab === "builders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div>
                <h1 className="font-serif text-3xl font-normal text-white">
                  Registered Builders Directory
                </h1>
                <p className="font-mono text-xs text-zinc-400 mt-1">
                  Browse all {builders.length} registered builder accounts, verify profiles, and copy email lists.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyAllBuilderEmails}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#FA5D00]" />
                  <span>{copiedStatus || "Copy All Emails"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => loadBuilders()}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingBuilders ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-[#121214] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={builderSearch}
                  onChange={(e) => setBuilderSearch(e.target.value)}
                  placeholder="Filter builders by name, username or email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              <div className="font-mono text-xs text-zinc-400">
                Showing <strong>{filteredBuilders.length}</strong> of {builders.length} builders
              </div>
            </div>

            {/* Table */}
            <div className="rounded-3xl border border-zinc-800 bg-[#121214] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Builder</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Badges</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredBuilders.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex-none overflow-hidden flex items-center justify-center font-bold text-white">
                              {b.avatar_url ? (
                                <img src={b.avatar_url} alt={b.name} className="w-full h-full object-cover" />
                              ) : (
                                (b.name || "B")[0].toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{b.name}</span>
                              </div>
                              <div className="text-zinc-500 text-[11px]">@{b.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 font-mono select-all">{b.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {b.is_verified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800 text-blue-400 text-[10px] font-bold">
                                <ShieldCheck className="w-3 h-3 text-blue-400" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="text-zinc-600 text-[10px]">Unverified</span>
                            )}
                            {b.is_pro && (
                              <span className="px-2 py-0.5 rounded-full bg-[#FA5D00]/20 border border-[#FA5D00]/40 text-[#FA5D00] text-[10px] font-bold">
                                PRO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-500">
                          {b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleVerify(b.id)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                                b.is_verified
                                  ? "border-red-900/60 text-red-400 hover:bg-red-950/50"
                                  : "border-blue-900/60 text-blue-400 hover:bg-blue-950/50"
                              }`}
                            >
                              {b.is_verified ? "Unverify" : "Verify"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBuilderIds(new Set([b.id]))
                                setActiveTab("email")
                              }}
                              className="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] transition-colors cursor-pointer"
                            >
                              Email
                            </button>

                            <Link
                              to={`/builder/${b.username}`}
                              target="_blank"
                              className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                              title="View Public Profile"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
