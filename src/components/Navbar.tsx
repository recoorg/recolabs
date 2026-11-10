"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, ArrowUpRight, MessageSquare, Terminal, User, LogOut, ChevronDown, Zap, LayoutDashboard, Rocket, ShieldCheck, ExternalLink } from "lucide-react"
import { GithubIcon, WhatsAppIcon } from "@/components/icons"
import { networkApi, type UserProfile } from "@/services/networkApi"
import { VerifiedBadge } from "@/components/VerifiedBadge"

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(() => networkApi.getCurrentUser())

  // Close mobile menu whenever route changes
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Sync auth state
  React.useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(networkApi.getCurrentUser())
    }
    window.addEventListener("reco_auth_changed", handleAuth)
    return () => window.removeEventListener("reco_auth_changed", handleAuth)
  }, [])

  // Prevent background scroll when mobile drawer is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  // Project & Dashboard pages have their own dedicated sidebar/dock - hide global floating navbar
  if (
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/project") ||
    location.pathname.startsWith("/dashboard")
  ) {
    return null
  }

  const isHomePage = location.pathname === "/"
  const isActive = (path: string) => location.pathname === path

  interface NavItem {
    label: string
    path: string
    external?: boolean
  }

  const navLinks: NavItem[] = [
    { label: "ABOUT", path: "/about" },
    { label: "JOBS", path: "/jobs" },
    { label: "PROJECTS", path: "/projects" },
    { label: "HACKATHONS", path: "/hackathons" },
    { label: "BUILDERS", path: "/network" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 py-3.5 sm:py-5 pointer-events-none">
      <div className="relative mx-auto max-w-7xl flex items-center justify-between">
        
        {/* Left: Raw Logo Mark */}
        <div className="flex items-center flex-1 justify-start">
          <Link
            to="/"
            className="pointer-events-auto flex items-center gap-2 hover:opacity-85 transition-opacity"
            aria-label="Reco Labs Home"
          >
            <img
              src="/logo-black.png"
              alt="Reco Labs Logo"
              className="h-8 sm:h-10 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-white.png"
              alt="Reco Labs Logo"
              className="h-8 sm:h-10 w-auto object-contain hidden dark:block"
            />
          </Link>
        </div>

        {/* Center: Desktop Vibrant Orange Pill Navigation */}
        <div className="pointer-events-none hidden sm:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <nav
            className="pointer-events-auto flex items-center gap-6 md:gap-8 px-7 py-2 rounded-full bg-[#FA5D00] border-2 border-black text-black font-mono text-[13px] font-bold tracking-wider uppercase shadow-sm"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-75 transition-opacity inline-flex items-center gap-0.5"
                >
                  <span>{link.label}</span>
                  <span className="text-[10px] leading-none opacity-70">↗</span>
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-opacity ${isActive(link.path) ? "underline underline-offset-4 decoration-2" : "hover:opacity-75"}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>

        {/* Right: User Avatar in Circle / Sign In & Discord Button & Mobile Hamburger */}
        <div className="flex items-center justify-end flex-1 gap-2.5 pointer-events-auto">
          {currentUser ? (
            <div className="relative group/navuser hidden sm:block">
              <Link
                to={`/builder/${currentUser.username}`}
                className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full bg-white/95 dark:bg-[#121216]/95 border-2 border-black dark:border-zinc-700 hover:border-[#FA5D00] shadow-sm transition-all"
                title={`@${currentUser.username}`}
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#FA5D00]/20 flex items-center justify-center font-serif font-bold text-xs text-black border border-black/10 dark:border-white/10 flex-none">
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name || currentUser.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUser.username)}`;
                      }}
                    />
                  ) : (
                    (currentUser.name || currentUser.username).charAt(0).toUpperCase()
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-zinc-950 dark:text-zinc-50 group-hover/navuser:text-[#FA5D00] transition-colors truncate max-w-[110px]">
                  @{currentUser.username}
                </span>
                {currentUser.is_verified && <VerifiedBadge size="xs" />}
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover/navuser:text-[#FA5D00] transition-transform duration-200 group-hover/navuser:rotate-180" />
              </Link>

              {/* Hover Dropdown Menu */}
              <div className="absolute right-0 top-full pt-2 hidden group-hover/navuser:block group-focus-within/navuser:block z-50">
                <div className="w-64 p-3 rounded-2xl bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-zinc-700 shadow-2xl font-mono text-xs text-zinc-800 dark:text-zinc-200 animate-in fade-in duration-150 space-y-2">
                  {/* User Profile Card */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="font-bold text-zinc-950 dark:text-zinc-50 truncate">
                      {currentUser.name || currentUser.username}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      @{currentUser.username}
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400">Status:</span>
                      {currentUser.is_verified || currentUser.is_pro ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <VerifiedBadge size="xs" /> Verified Member
                        </span>
                      ) : (
                        <Link
                          to="/pricing"
                          className="text-[#FA5D00] font-black uppercase hover:underline"
                        >
                          ⚡ Get Blue Tick
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Nav Links with Dark Filled Curved Icons */}
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#FA5D00]" />
                      <span>Console &amp; Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard?tab=startups"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
                    >
                      <Rocket className="w-4 h-4 text-[#FA5D00]" />
                      <span>My Projects &amp; Startups</span>
                    </Link>

                    <Link
                      to={`/builder/${currentUser.username}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      <span>Public Profile</span>
                    </Link>

                    <Link
                      to="/pricing"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span>Verification &amp; Pricing</span>
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        networkApi.logout();
                        setCurrentUser(null);
                        window.dispatchEvent(new Event("reco_auth_changed"));
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 text-zinc-500 font-bold transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/network?auth=login"
              onClick={() => {
                if (window.location.pathname.startsWith("/network")) {
                  window.dispatchEvent(new CustomEvent("reco_open_auth", { detail: { mode: "login" } }))
                }
              }}
              className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:bg-[#FA5D00] hover:border-[#FA5D00] dark:hover:bg-[#FA5D00] dark:hover:border-[#FA5D00] dark:hover:text-black transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Sign In
            </Link>
          )}

          {isHomePage && !currentUser && (
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://chat.whatsapp.com/IApnk6YLM0l2j1nwcVzRR5"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black font-mono text-xs font-bold tracking-wide transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-black" />
                <span>WhatsApp</span>
              </a>
            </div>
          )}

          {/* Right Mobile: User circle avatar & 3-line Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            {currentUser && (
              <Link
                to={`/builder/${currentUser.username}`}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-black dark:border-zinc-700 flex items-center justify-center font-serif font-bold text-xs bg-[#FA5D00]/10 text-[#FA5D00]"
                title={`@${currentUser.username}`}
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUser.username)}`;
                    }}
                  />
                ) : (
                  (currentUser.name || currentUser.username).charAt(0).toUpperCase()
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm active:scale-90 transition-all cursor-pointer"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-[#FA5D00]" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 w-4">
                  <span className="w-4 h-[2px] bg-black dark:bg-white rounded-full transition-transform" />
                  <span className="w-4 h-[2px] bg-black dark:bg-white rounded-full transition-transform" />
                  <span className="w-4 h-[2px] bg-black dark:bg-white rounded-full transition-transform" />
                </div>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 top-[60px] z-40 bg-black/60 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200">
          <div className="mx-4 mt-2 p-5 rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#09090b] shadow-2xl flex flex-col justify-between max-h-[calc(100vh-80px)] overflow-y-auto">
            
            {/* User Profile Card on Mobile */}
            {currentUser ? (
              <div className="p-3.5 rounded-2xl border-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3 mb-2">
                <Link
                  to={`/builder/${currentUser.username}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-black/20 flex items-center justify-center font-bold text-xs bg-orange-100 text-[#FA5D00] flex-none">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.username} className="w-full h-full object-cover" />
                    ) : (
                      (currentUser.name || currentUser.username).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif text-xs font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-1 truncate">
                      <span>{currentUser.name || currentUser.username}</span>
                      {currentUser.is_verified && <VerifiedBadge size="xs" />}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-500 truncate">
                      @{currentUser.username}
                    </div>
                  </div>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-1.5 rounded-full bg-[#FA5D00] text-black font-mono text-[10px] font-bold uppercase tracking-wider flex-none"
                >
                  Console
                </Link>
              </div>
            ) : (
              <div className="pb-3 border-b editorial-hairline mb-2">
                <Link
                  to="/network?auth=login"
                  onClick={() => {
                    setMobileOpen(false)
                    if (window.location.pathname.startsWith("/network")) {
                      window.dispatchEvent(new CustomEvent("reco_open_auth", { detail: { mode: "login" } }))
                    }
                  }}
                  className="w-full py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer"
                >
                  Sign In to Reco Guild
                </Link>
              </div>
            )}

            {/* Nav list */}
            <nav className="flex flex-col py-4 space-y-2.5 font-mono">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between py-2 text-sm font-bold tracking-wider transition-colors ${
                  isActive("/") ? "text-[#FA5D00]" : "text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                }`}
              >
                <span>01. HOME</span>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </Link>

              {navLinks.map((link, idx) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-2 text-sm font-bold tracking-wider transition-colors border-t editorial-hairline text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                  >
                    <span>0{idx + 2}. {link.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#FA5D00]" />
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-2 text-sm font-bold tracking-wider transition-colors border-t editorial-hairline ${
                      isActive(link.path) ? "text-[#FA5D00]" : "text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                    }`}
                  >
                    <span>0{idx + 2}. {link.label}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </Link>
                )
              )}
            </nav>

            {/* Bottom Actions */}
            <div className="pt-3 border-t editorial-hairline flex flex-col gap-2 font-mono text-xs">
              <Link
                to="/pricing"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-black dark:border-white font-bold uppercase tracking-wider text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span>Verified Pass & Pricing</span>
              </Link>

              <a
                href="https://chat.whatsapp.com/IApnk6YLM0l2j1nwcVzRR5"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#25D366] text-black font-bold uppercase tracking-wider shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4 fill-black" />
                <span>WhatsApp Guild</span>
              </a>

              <a
                href="https://discord.com/invite/7dk4w37BhP"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#5865F2] text-white font-bold uppercase tracking-wider shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discord Guild</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
