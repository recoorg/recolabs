import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, ArrowUpRight, ShieldCheck, LogOut, PenTool, LayoutDashboard } from "lucide-react"
import { DiscordIcon } from "@/components/icons"
import { networkApi, UserProfile } from "@/services/networkApi"
import { identifyUser, resetUser, trackEvent } from "@/lib/analytics"
import { BuilderSignInModal } from "./BuilderSignInModal"
import { ThemeToggle } from "./ThemeToggle"

export function BlogNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null)
  const [isSignInOpen, setIsSignInOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const refreshUser = () => {
    const user = networkApi.getCurrentUser()
    setCurrentUser(user)
    if (user) {
      identifyUser(user.id, { username: user.username })
    }
  }

  React.useEffect(() => {
    refreshUser()
  }, [])

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/blog"
    }
    return location.pathname.startsWith(path)
  }

  const handleSignOut = () => {
    resetUser()
    trackEvent("builder_signed_out")
    networkApi.logout()
    setCurrentUser(null)
    if (location.pathname.startsWith("/write")) {
      navigate("/")
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 py-3 sm:py-5 pointer-events-none">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          
          {/* Left: Raw Reco Labs Logo Mark */}
          <Link
            to="/"
            className="pointer-events-auto flex items-center gap-2 hover:opacity-85 transition-opacity"
            aria-label="Reco Labs Blog"
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
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FA5D00] pl-1.5 border-l border-zinc-300 dark:border-zinc-700">
              BLOG
            </span>
          </Link>

          {/* Center: Reco Labs Signature Vibrant Orange Pill Navigation */}
          <nav
            className="pointer-events-auto hidden sm:flex items-center gap-5 md:gap-7 px-7 py-2 rounded-full bg-[#FA5D00] border-2 border-black text-black font-mono text-[13px] font-bold tracking-wider uppercase shadow-sm"
            aria-label="Blog Navigation"
          >
            {/* BLOG */}
            <Link
              to="/"
              className={`transition-opacity ${
                isActive("/") && !location.pathname.startsWith("/dashboard") && !location.pathname.startsWith("/write")
                  ? "underline underline-offset-4 decoration-2"
                  : "hover:opacity-75"
              }`}
            >
              Blog
            </Link>

            {/* DASHBOARD */}
            <Link
              to="/dashboard"
              className={`transition-opacity ${
                isActive("/dashboard") ? "underline underline-offset-4 decoration-2" : "hover:opacity-75"
              }`}
            >
              Dashboard
            </Link>

            {/* SIGN IN / BUILDER HANDLE */}
            {currentUser ? (
              <a
                href={`https://www.recolabs.in/builder/${currentUser.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75 flex items-center gap-1"
                title="View your builder profile"
              >
                <span>@{currentUser.username}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setIsSignInOpen(true)}
                className="hover:opacity-75 uppercase text-left cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* WRITE */}
            <Link
              to="/write"
              className={`transition-opacity ${
                isActive("/write") ? "underline underline-offset-4 decoration-2" : "hover:opacity-75"
              }`}
            >
              Write
            </Link>
          </nav>

          {/* Right Desktop: Theme Switcher & Discord */}
          <div className="pointer-events-auto hidden sm:flex items-center gap-2.5">
            <ThemeToggle />

            {currentUser && (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <a
              href="https://discord.com/invite/7dk4w37BhP"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <DiscordIcon className="w-4 h-4" />
              <span>Discord</span>
            </a>
          </div>

          {/* Right Mobile: Theme Toggle & Hamburger Button */}
          <div className="pointer-events-auto flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-black dark:border-zinc-700 bg-[#FA5D00] text-black shadow-sm active:scale-90 transition-all cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
            </button>
          </div>

        </div>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div className="sm:hidden fixed inset-0 top-[60px] z-40 bg-black/60 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200">
            <div className="mx-4 mt-2 p-6 rounded-3xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#09090b] shadow-2xl flex flex-col justify-between max-h-[calc(100vh-80px)] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-bold">
                  RECO LABS · BLOG
                </span>
                <span className="font-mono text-[11px] text-zinc-400">Navigation</span>
              </div>

              <nav className="flex flex-col py-6 space-y-3 font-mono">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-2 text-base font-bold tracking-wider transition-colors ${
                    isActive("/") ? "text-[#FA5D00]" : "text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                  }`}
                >
                  <span>01. BLOG</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-2 text-base font-bold tracking-wider transition-colors border-t border-zinc-100 dark:border-zinc-800 ${
                    isActive("/dashboard") ? "text-[#FA5D00]" : "text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                  }`}
                >
                  <span>02. DASHBOARD</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </Link>

                {currentUser ? (
                  <a
                    href={`https://www.recolabs.in/builder/${currentUser.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-2 text-base font-bold tracking-wider text-[#10B981] border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <span>03. @{currentUser.username} (PROFILE)</span>
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      setIsSignInOpen(true)
                    }}
                    className="flex items-center justify-between py-2 text-base font-bold tracking-wider text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00] border-t border-zinc-100 dark:border-zinc-800 text-left"
                  >
                    <span>03. SIGN IN</span>
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </button>
                )}

                <Link
                  to="/write"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-2 text-base font-bold tracking-wider transition-colors border-t border-zinc-100 dark:border-zinc-800 ${
                    isActive("/write") ? "text-[#FA5D00]" : "text-zinc-900 dark:text-zinc-100 hover:text-[#FA5D00]"
                  }`}
                >
                  <span>04. WRITE</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </Link>
              </nav>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
                <a
                  href="https://discord.com/invite/7dk4w37BhP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#5865F2] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  <DiscordIcon className="w-4 h-4" />
                  <span>Join Discord</span>
                </a>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Builder Sign In Modal */}
      <BuilderSignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user)
          navigate("/write")
        }}
      />
    </>
  )
}
