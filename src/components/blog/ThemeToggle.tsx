import * as React from "react"
import { Sun, Moon, Terminal, Palette, Check } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

export type ThemeMode = "dark" | "light" | "terminal" | "cyber"

const THEME_STORAGE_KEY = "reco_blog_theme"

export function useTheme() {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode
      if (saved && ["dark", "light", "terminal", "cyber"].includes(saved)) {
        return saved
      }
    }
    return "dark"
  })

  const applyTheme = (t: ThemeMode, trackChange = true) => {
    setThemeState(t)
    if (typeof window === "undefined") return
    localStorage.setItem(THEME_STORAGE_KEY, t)

    if (trackChange) {
      trackEvent("theme_switched", { theme: t })
    }

    const root = document.documentElement
    root.classList.remove("dark", "light", "theme-terminal", "theme-cyber")

    if (t === "dark") {
      root.classList.add("dark")
      root.style.setProperty("--theme-bg", "#09090b")
      root.style.setProperty("--theme-accent", "#FA5D00")
    } else if (t === "light") {
      root.classList.add("light")
      root.style.setProperty("--theme-bg", "#ffffff")
      root.style.setProperty("--theme-accent", "#FA5D00")
    } else if (t === "terminal") {
      root.classList.add("dark", "theme-terminal")
      root.style.setProperty("--theme-bg", "#080703")
      root.style.setProperty("--theme-accent", "#f59e0b")
    } else if (t === "cyber") {
      root.classList.add("dark", "theme-cyber")
      root.style.setProperty("--theme-bg", "#06090e")
      root.style.setProperty("--theme-accent", "#06b6d4")
    }
  }

  React.useEffect(() => {
    applyTheme(theme, false)
  }, [])

  return { theme, setTheme: applyTheme }
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  const themes: { id: ThemeMode; label: string; icon: any; color: string }[] = [
    { id: "dark", label: "Void (Dark)", icon: Moon, color: "#FA5D00" },
    { id: "light", label: "Editorial (Light)", icon: Sun, color: "#09090b" },
    { id: "terminal", label: "Amber Terminal", icon: Terminal, color: "#f59e0b" },
    { id: "cyber", label: "Silicon Cyan", icon: Palette, color: "#06b6d4" },
  ]

  const current = themes.find((t) => t.id === theme) || themes[0]
  const CurrentIcon = current.icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors flex items-center gap-1.5 font-mono text-xs"
        title="Change Blog Theme"
      >
        <CurrentIcon className="w-3.5 h-3.5" style={{ color: current.color }} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Select Theme
            </div>
            {themes.map((item) => {
              const Icon = item.icon
              const active = item.id === theme
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTheme(item.id)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                    active
                      ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-[#FA5D00]" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
