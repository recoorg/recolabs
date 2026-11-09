import * as React from "react"

export interface StartupFaviconProps {
  name: string
  url?: string | null
  className?: string
  textClassName?: string
}

export function StartupFavicon({
  name,
  url,
  className = "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl",
  textClassName = "font-serif text-3xl sm:text-4xl font-bold",
}: StartupFaviconProps) {
  const [loadError, setLoadError] = React.useState(false)
  const [fallbackIndex, setFallbackIndex] = React.useState(0)

  const host = React.useMemo(() => {
    if (!url || typeof url !== "string") return null
    try {
      const trimmed = url.trim()
      if (!trimmed) return null
      const withProto = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`
      const parsed = new URL(withProto)
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "")
      if (!hostname || hostname.length < 3 || !hostname.includes(".") || hostname.endsWith(".local") || hostname === "localhost") {
        return null
      }
      return hostname
    } catch {
      return null
    }
  }, [url])

  React.useEffect(() => {
    setLoadError(false)
    setFallbackIndex(0)
  }, [url, name])

  const initial = (name || "S").trim()[0]?.toUpperCase() || "S"

  const sources = React.useMemo(() => {
    if (!host) return []
    return [
      `https://icon.horse/icon/${host}`,
      `https://unavatar.io/${host}`,
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
    ]
  }, [host])

  const handleImageError = () => {
    if (fallbackIndex + 1 < sources.length) {
      setFallbackIndex(fallbackIndex + 1)
    } else {
      setLoadError(true)
    }
  }

  if (!host || loadError || sources.length === 0) {
    return (
      <div
        className={`${className} bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white ${textClassName} shadow-lg select-none`}
      >
        <span>{initial}</span>
      </div>
    )
  }

  return (
    <div
      className={`${className} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden shadow-lg p-2 relative select-none`}
    >
      <img
        src={sources[fallbackIndex]}
        alt={`${name} icon`}
        className="w-full h-full object-contain"
        loading="lazy"
        onError={handleImageError}
      />
    </div>
  )
}
