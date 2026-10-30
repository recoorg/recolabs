"use client"

import * as React from "react"
import { useParams, Link } from "react-router-dom"
import confetti from "canvas-confetti"
import {
  User,
  Phone,
  Globe,
  Mail,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Rocket,
  ArrowLeft,
  Calendar,
  Building2,
  ShieldCheck,
  Edit3,
  X,
  Camera,
} from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { networkApi, type UserProfile, type StartupItem } from "@/services/networkApi"
import { StartupScreenshotModal } from "@/components/StartupScreenshotModal"

export function BuilderProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [startups, setStartups] = React.useState<StartupItem[]>([])
  const [screenshotStartup, setScreenshotStartup] = React.useState<StartupItem | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [copiedLink, setCopiedLink] = React.useState(false)

  // Edit Modal
  const [isSelf, setIsSelf] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [editForm, setEditForm] = React.useState({
    name: "",
    username: "",
    phone: "",
    website: "",
    bio: "",
    discord: "",
  })
  const [editLoading, setEditLoading] = React.useState(false)

  React.useEffect(() => {
    if (!username) return
    loadProfile(username)
  }, [username])

  const loadProfile = async (u: string) => {
    try {
      setLoading(true)
      setError("")
      const data = await networkApi.getBuilderProfile(u)
      setProfile(data.user)
      setStartups(data.startups)

      const currentUser = networkApi.getCurrentUser()
      if (currentUser && currentUser.id === data.user.id) {
        setIsSelf(true)
        setEditForm({
          name: data.user.name || "",
          username: data.user.username || "",
          phone: data.user.phone || "",
          website: data.user.website || "",
          bio: data.user.bio || "",
          discord: data.user.discord || "",
        })
        const params = new URLSearchParams(window.location.search)
        if (params.get("edit") === "true") {
          setShowEditModal(true)
        }
      }
    } catch (err: any) {
      setError(err.message || "Builder not found.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyProfileUrl = () => {
    const fullUrl = `https://recolabs.in/builder/${profile?.username || username}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedLink(true)
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } })
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      const updated = await networkApi.updateProfile(editForm)
      setProfile(updated)
      setShowEditModal(false)
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } })
      // If username changed, update URL
      if (updated.username !== username) {
        window.history.replaceState(null, "", `/builder/${updated.username}`)
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile.")
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex items-center justify-center">
        <div className="font-mono text-xs text-zinc-500 animate-pulse">
          Loading builder profile...
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="font-serif text-4xl sm:text-5xl text-zinc-950 dark:text-zinc-50 font-normal">
          Builder not found<span className="text-[#FA5D00]">.</span>
        </h1>
        <p className="mt-3 font-sans text-sm text-zinc-500 max-w-md">
          {error || `No builder profile exists under @${username}.`}
        </p>
        <Link
          to="/network"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore Network</span>
        </Link>
      </div>
    )
  }

  const profileUrl = `https://recolabs.in/builder/${profile.username}`

  return (
    <div className="relative w-full pt-32 sm:pt-36 pb-24 px-5 sm:px-8 bg-transparent overflow-hidden">
      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-orange-500/[0.02] dark:bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/network"
            className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 hover:text-[#FA5D00] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Founder Network</span>
          </Link>
        </div>

        {/* Builder Hero Card */}
        <div className="p-8 sm:p-10 rounded-3xl border-2 border-black dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            
            {/* Left: Avatar & Identity */}
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl border-2 border-black dark:border-zinc-700 bg-[#FA5D00]/10 flex items-center justify-center font-serif text-3xl font-bold text-[#FA5D00] flex-none overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
                    {profile.name}
                  </h1>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#FA5D00] font-bold">
                    @{profile.username}
                  </span>
                </div>

                <div className="mt-1 font-mono text-xs text-zinc-400 flex items-center gap-2">
                  <span>Verified Builder</span>
                  <span>·</span>
                  <span className="truncate">recolabs.in/builder/{profile.username}</span>
                </div>

                {profile.bio && (
                  <p className="mt-3 font-sans text-sm text-zinc-700 dark:text-zinc-300 max-w-lg leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Right Action Stack */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 flex-none">
              <button
                type="button"
                onClick={handleCopyProfileUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
              </button>

              {isSelf && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-xs font-semibold hover:border-[#FA5D00] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-[#FA5D00]" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

          </div>

          {/* Contact Strip */}
          <div className="mt-8 pt-6 border-t editorial-hairline flex flex-wrap items-center gap-3 font-mono text-xs">
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>{profile.phone}</span>
              </a>
            )}

            {profile.website && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>{profile.website.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#FA5D00]" />
                <span>{profile.email}</span>
              </a>
            )}

            {profile.discord && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300">
                <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>{profile.discord}</span>
              </span>
            )}
          </div>

        </div>

        {/* Startups by this Builder */}
        <div className="mt-14">
          <div className="flex items-center justify-between pb-4 border-b editorial-hairline mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              Built by {profile.name} <span className="font-mono text-xs text-zinc-400 font-normal">({startups.length})</span>
            </h2>
            <span className="font-mono text-xs text-zinc-400">PUBLIC ROSTER</span>
          </div>

          {startups.length === 0 ? (
            <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs text-zinc-500">
              No startups listed yet by @{profile.username}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {startups.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl border editorial-hairline bg-white/60 dark:bg-zinc-900/40 flex flex-col justify-between shadow-sm hover:border-[#FA5D00] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-100/70 dark:bg-orange-950/40 text-[#FA5D00] font-mono text-[10px] font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 uppercase">
                        {item.stage}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl text-zinc-950 dark:text-zinc-50 font-normal">
                      {item.name}
                    </h3>

                    <div className="mt-1 font-mono text-xs text-zinc-400 truncate">
                      <a
                        href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#FA5D00] transition-colors underline underline-offset-2"
                      >
                        {item.url.replace(/^https?:\/\//, "")}
                      </a>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border editorial-hairline">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                        PROBLEM SOLVED:
                      </span>
                      <p className="font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {item.problem_solving}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t editorial-hairline flex items-center justify-between">
                    <button
                      onClick={() =>
                        setScreenshotStartup({
                          ...item,
                          founder_name: profile.name,
                          founder_username: profile.username,
                          avatar_url: profile.avatar_url,
                        } as any)
                      }
                      title="Create Shareable Screenshot Card"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border editorial-hairline bg-orange-50 dark:bg-orange-950/30 text-[#FA5D00] font-mono text-[11px] font-bold hover:bg-[#FA5D00] hover:text-black transition-all cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Snap Card</span>
                    </button>
                    <a
                      href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-black dark:text-white hover:text-[#FA5D00] transition-colors"
                    >
                      <span>Open Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#09090b] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-mono text-xs text-[#FA5D00] font-bold uppercase tracking-wider">
              EDIT PROFILE
            </span>
            <h2 className="mt-1 font-serif text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              Customize Your Profile<span className="text-[#FA5D00]">.</span>
            </h2>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">DISPLAY NAME</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">UNIQUE USERNAME</label>
                <div className="flex items-center rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 px-3">
                  <span className="text-zinc-400 mr-1">@</span>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="aditya"
                    className="w-full py-2.5 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  Your URL: recolabs.in/builder/{editForm.username || "username"}
                </span>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">PHONE NUMBER</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91..."
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">WEBSITE</label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 mb-1">BIO</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell the guild what you build..."
                  className="w-full px-3.5 py-2 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="w-full mt-4 py-3 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT MODAL */}
      {screenshotStartup && (
        <StartupScreenshotModal
          startup={screenshotStartup}
          onClose={() => setScreenshotStartup(null)}
        />
      )}

    </div>
  )
}

export default BuilderProfilePage
