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
  Zap,
  Edit3,
  X,
  Camera,
} from "lucide-react"
import { GithubIcon, TwitterIcon } from "@/components/icons"
import { networkApi, type UserProfile, type StartupItem } from "@/services/networkApi"
import { StartupScreenshotModal } from "@/components/StartupScreenshotModal"
import { ProfileUpgradeModal } from "@/components/ProfileUpgradeModal"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { BuilderLinearCard } from "@/components/BuilderLinearCard"
import { usePageMeta } from "@/hooks/usePageMeta"

export function BuilderProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)

  usePageMeta({
    title: profile ? `${profile.name || profile.username} (@${profile.username}) | Reco Labs` : (username ? `@${username.replace(/^@/, '')} | Reco Labs` : "Builder Profile | Reco Labs"),
    description: profile?.bio || "Builder and founder showcasing projects on Reco Labs.",
    image: profile?.avatar_url || "/twitter-image.png",
    type: "profile",
  })
  const [startups, setStartups] = React.useState<StartupItem[]>([])
  const [screenshotStartup, setScreenshotStartup] = React.useState<StartupItem | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
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
    const clean = username.startsWith('@') ? username.slice(1) : username
    loadProfile(clean.trim())
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
      <div className="relative w-full pt-20 sm:pt-36 pb-16 sm:pb-24 px-3 sm:px-8 bg-transparent">
        <div className="mx-auto max-w-4xl space-y-8 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="w-36 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full" />

          {/* Builder Hero Card Skeleton */}
          <div className="p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-start gap-3.5 sm:gap-5 min-w-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex-none" />
                <div className="space-y-2.5">
                  <div className="w-48 sm:w-64 h-7 sm:h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <div className="w-36 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                  <div className="w-64 sm:w-80 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>

            {/* Contact Pills Skeleton */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
              <div className="w-28 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-32 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-24 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          {/* Projects Section Skeleton */}
          <div className="space-y-4">
            <div className="w-40 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 p-6 space-y-4">
                <div className="w-24 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-40 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-full h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
              </div>
              <div className="h-48 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 p-6 space-y-4">
                <div className="w-24 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-40 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-full h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
              </div>
            </div>
          </div>
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
    <div className="relative w-full pt-20 sm:pt-36 pb-16 sm:pb-24 px-3 sm:px-8 bg-transparent overflow-hidden">
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
            className="inline-flex items-center gap-2 font-mono text-xs text-zinc-600 dark:text-zinc-400 hover:text-[#FA5D00] transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Founder Network</span>
          </Link>
        </div>

        {/* Builder Hero Card */}
        <div className="p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/60 backdrop-blur-md shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            
            {/* Left: Avatar & Identity */}
            <div className="flex items-start gap-3.5 sm:gap-5 min-w-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-[#FA5D00]/10 flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold text-[#FA5D00] flex-none overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-bold leading-tight">
                    {profile.name}
                  </h1>
                  <span className="font-mono text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/70 text-[#FA5D00] font-bold border border-orange-200 dark:border-orange-900/60">
                    @{profile.username}
                  </span>
                  {(profile.is_verified || profile.is_pro) && (
                    <VerifiedBadge
                      size="xs"
                      showText
                      label="Verified"
                    />
                  )}
                </div>

                <div className="mt-1.5 font-mono text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 flex-wrap font-medium">
                  <span>Verified Builder</span>
                  <span>·</span>
                  <span className="truncate text-zinc-800 dark:text-zinc-300">recolabs.in/builder/{profile.username}</span>
                </div>

                {profile.bio && (
                  <p className="mt-3 font-sans text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 max-w-lg leading-relaxed font-normal">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Right Action Stack */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 flex-none">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={handleCopyProfileUrl}
                  title={copiedLink ? "Link Copied!" : "Copy profile link"}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FA5D00] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer flex-none"
                >
                  {copiedLink ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Share2 className="w-4 h-4" />}
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${profile.name || profile.username}'s builder profile on @adibxr Reco Labs:`)}&url=${encodeURIComponent(`https://recolabs.in/builder/${profile.username}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share profile to Twitter/X"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:border-[#FA5D00] hover:text-[#FA5D00] transition-colors flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs flex-none"
                >
                  <TwitterIcon className="w-3.5 h-3.5 fill-current" />
                </a>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {isSelf && !profile.is_verified && !profile.is_pro && (
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>Get Verified</span>
                  </button>
                )}

                {isSelf && (
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-[11px] sm:text-xs font-bold hover:border-[#FA5D00] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-[#FA5D00]" />
                    <span>Edit Profile</span>
                  </button>
                )}

                
              </div>
            </div>

          </div>

          {/* Contact Strip */}
          <div className="mt-4 sm:mt-8 pt-3.5 sm:pt-6 border-t editorial-hairline flex flex-wrap items-center gap-1.5 sm:gap-3 font-mono text-[11px] sm:text-xs">
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors text-[10px] sm:text-xs"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors text-[10px] sm:text-xs"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>{profile.website.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold hover:text-[#FA5D00] hover:border-[#FA5D00] transition-colors text-[10px] sm:text-xs"
              >
                <Mail className="w-3.5 h-3.5 text-[#FA5D00]" />
                <span>{profile.email}</span>
              </a>
            )}

            {profile.discord && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-[10px] sm:text-xs">
                <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>{profile.discord}</span>
              </span>
            )}
          </div>

        </div>

        {/* Startups by this Builder */}
        <div className="mt-8 sm:mt-14">
          <div className="flex items-center justify-between pb-4 border-b editorial-hairline mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-bold">
              Built by {profile.name} <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-bold">({startups.length})</span>
            </h2>
            <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-bold tracking-wider">PUBLIC ROSTER</span>
          </div>

          {startups.length === 0 ? (
            <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 text-center font-mono text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              No startups listed yet by @{profile.username}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {startups.map((item) => (
                <BuilderLinearCard
                  key={item.id}
                  item={item}
                  profile={profile}
                  onScreenshot={() =>
                    setScreenshotStartup({
                      ...item,
                      founder_name: profile.name,
                      founder_username: profile.username,
                      avatar_url: profile.avatar_url,
                    } as any)
                  }
                />
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
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">DISPLAY NAME</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">UNIQUE USERNAME</label>
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
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">PHONE NUMBER</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91..."
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">WEBSITE</label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border editorial-hairline bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">BIO</label>
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

      {/* PROFILE UPGRADE MODAL */}
      {showUpgradeModal && profile && (
        <ProfileUpgradeModal
          username={profile.username}
          name={profile.name}
          onClose={() => setShowUpgradeModal(false)}
        />
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
