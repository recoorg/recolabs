"use client"

import * as React from "react"
import html2canvas from "html2canvas"
import confetti from "canvas-confetti"
import {
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Sun,
  Moon,
} from "lucide-react"
import type { StartupItem } from "@/services/networkApi"

interface StartupScreenshotModalProps {
  startup: StartupItem | null
  onClose: () => void
}

export function StartupScreenshotModal({ startup, onClose }: StartupScreenshotModalProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = React.useState(false)
  const [copiedImage, setCopiedImage] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)
  const [cardTheme, setCardTheme] = React.useState<"dark" | "light">("dark")
  const [statusMessage, setStatusMessage] = React.useState("")

  if (!startup) return null

  const founderName = startup.founder_name || "Anonymous Founder"
  const founderUsername =
    startup.founder_username ||
    (startup as any).author_username ||
    founderName.toLowerCase().replace(/[^a-z0-9_-]/g, "")
  const initials = founderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "RL"

  const cleanUrl = startup.url.replace(/^https?:\/\//, "").replace(/\/$/, "")

  // Download snapshot as PNG
  const handleDownload = async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    setStatusMessage("Rendering screenshot...")
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: cardTheme === "dark" ? "#09090b" : "#f4f4f5",
        logging: false,
      })

      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      const safeName = startup.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
      link.download = `${safeName}-recolabs.png`
      link.href = image
      link.click()

      setStatusMessage("Screenshot downloaded!")
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } })
      setTimeout(() => setStatusMessage(""), 3000)
    } catch (err: any) {
      console.error("Screenshot download error:", err)
      setStatusMessage("Render failed. Try again.")
      setTimeout(() => setStatusMessage(""), 3000)
    } finally {
      setDownloading(false)
    }
  }

  // Copy PNG image to clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current || copiedImage) return
    setStatusMessage("Rendering image...")
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: cardTheme === "dark" ? "#09090b" : "#f4f4f5",
        logging: false,
      })

      // Attempt clipboard copy
      try {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
        if (blob && navigator.clipboard && typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])
          setCopiedImage(true)
          setStatusMessage("Image copied! Paste in X or Discord.")
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })
          setTimeout(() => {
            setCopiedImage(false)
            setStatusMessage("")
          }, 3000)
          return
        }
      } catch (clipErr) {
        console.warn("Direct clipboard item write failed, trying fallback:", clipErr)
      }

      // Fallback: download automatically
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      const safeName = startup.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
      link.download = `${safeName}-recolabs.png`
      link.href = image
      link.click()
      setStatusMessage("Downloaded PNG! (Clipboard blocked by browser)")
      setTimeout(() => setStatusMessage(""), 3500)
    } catch (err: any) {
      console.error("Screenshot copy error:", err)
      setStatusMessage("Render error. Try download instead.")
      setTimeout(() => setStatusMessage(""), 3000)
    }
  }

  // Copy Profile / Startup Link
  const handleCopyLink = () => {
    const fullUrl = `https://recolabs.in/builder/${founderUsername}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedLink(true)
    setStatusMessage("Profile link copied!")
    setTimeout(() => {
      setCopiedLink(false)
      setStatusMessage("")
    }, 2500)
  }

  const isDark = cardTheme === "dark"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      {/* Container holding Card + Floating Toolbar */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl w-full my-auto">
        
        {/* THE EXPORTABLE RECO LABS CARD (Uses explicit inline styling for bulletproof html2canvas support) */}
        <div
          ref={cardRef}
          style={{
            backgroundColor: isDark ? "#09090b" : "#f4f4f5",
            borderColor: isDark ? "#27272a" : "#e4e4e7",
            color: isDark ? "#ffffff" : "#09090b",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
          className="relative w-full max-w-xl rounded-3xl p-6 sm:p-8 border-2 shadow-2xl flex flex-col justify-between overflow-hidden select-none"
        >
          {/* Subtle ambient gradient */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "250px",
              height: "250px",
              background: "radial-gradient(circle, rgba(250,93,0,0.15) 0%, rgba(0,0,0,0) 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          {/* INNER CARD */}
          <div
            style={{
              backgroundColor: isDark ? "#141417" : "#ffffff",
              borderColor: isDark ? "#27272a" : "#e4e4e7",
              color: isDark ? "#ffffff" : "#09090b",
            }}
            className="relative z-10 w-full rounded-2xl border p-6 sm:p-7 shadow-md"
          >
            {/* Top Row: Founder info & Reco Monogram Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Founder Avatar with Initials Fallback */}
                <div className="relative flex-none">
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FA5D00 0%, #f59e0b 100%)",
                      color: "#000000",
                    }}
                    className="w-12 h-12 rounded-full font-mono font-bold flex items-center justify-center text-sm shadow-md overflow-hidden"
                  >
                    <span>{initials}</span>
                  </div>
                  {/* Verified Founder Badge */}
                  <div
                    style={{ backgroundColor: "#FA5D00", color: "#000000" }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>

                {/* Founder Meta */}
                <div>
                  <h3
                    style={{ color: isDark ? "#ffffff" : "#09090b" }}
                    className="font-bold text-base leading-snug"
                  >
                    {founderName}
                  </h3>
                  <div
                    style={{ color: isDark ? "#a1a1aa" : "#71717a" }}
                    className="flex items-center gap-2 font-mono text-[11px] mt-0.5"
                  >
                    <span style={{ color: "#FA5D00" }} className="font-semibold">
                      @{founderUsername}
                    </span>
                    <span>•</span>
                    <span className="uppercase text-[10px] tracking-wider font-semibold">
                      #{startup.category.toLowerCase().replace(/[^a-z0-9]/g, "")}
                    </span>
                    <span>•</span>
                    <span className="text-[10px] uppercase font-semibold">{startup.stage}</span>
                  </div>
                </div>
              </div>

              {/* Reco Labs Brand Mark */}
              <div
                style={{
                  backgroundColor: "#FA5D00",
                  color: "#000000",
                  fontFamily: "serif",
                }}
                className="w-9 h-9 rounded-xl text-xl font-bold flex items-center justify-center shadow-sm flex-none select-none"
              >
                R
              </div>
            </div>

            {/* Middle Pitch Section */}
            <div
              style={{
                borderColor: isDark ? "#27272a" : "#f4f4f5",
              }}
              className="mt-5 pt-4 border-t"
            >
              {/* Startup Title */}
              <h2
                style={{
                  color: isDark ? "#ffffff" : "#09090b",
                  fontFamily: "serif",
                }}
                className="text-2xl sm:text-3xl font-normal tracking-tight leading-snug"
              >
                {startup.name}
              </h2>

              {/* Problem Solving Pitch Text */}
              <div
                style={{
                  color: isDark ? "#d4d4d8" : "#3f3f46",
                }}
                className="mt-3 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line"
              >
                {startup.problem_solving}
              </div>

              {/* Startup URL Badge */}
              <div className="mt-4 pt-2 flex items-center gap-2">
                <span
                  style={{
                    backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                    color: isDark ? "#e4e4e7" : "#18181b",
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-semibold"
                >
                  <ExternalLink className="w-3 h-3 text-[#FA5D00]" />
                  <span>{cleanUrl}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Card Footer Watermark */}
          <div
            style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
            className="relative z-10 mt-5 pt-1 text-center font-mono text-xs flex items-center justify-center gap-1.5"
          >
            <span>Posted by</span>
            <span
              style={{ color: isDark ? "#ffffff" : "#09090b" }}
              className="font-bold"
            >
              @{founderUsername}
            </span>
            <span>on</span>
            <span
              style={{ color: isDark ? "#ffffff" : "#09090b" }}
              className="font-bold text-sm tracking-tight flex items-center gap-1"
            >
              <span
                style={{ backgroundColor: "#FA5D00" }}
                className="inline-block w-2 h-2 rounded-full"
              />
              Reco Labs
            </span>
          </div>
        </div>

        {/* FLOATING ACTION TOOLBAR */}
        <div className="flex md:flex-col items-center gap-2.5 p-2 rounded-full md:rounded-2xl bg-white/95 dark:bg-zinc-900/95 border-2 border-black dark:border-zinc-700 shadow-2xl backdrop-blur-md">
          {/* Download Image Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download PNG Screenshot"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FA5D00] text-black hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Copy Image Button */}
          <button
            onClick={handleCopyImage}
            title="Copy PNG to Clipboard (Paste on X / Discord)"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-[#FA5D00] active:scale-95 transition-all cursor-pointer"
          >
            {copiedImage ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>

          {/* Toggle Dark / Light Theme on Card */}
          <button
            onClick={() => setCardTheme(cardTheme === "dark" ? "light" : "dark")}
            title={`Switch to ${cardTheme === "dark" ? "Light" : "Dark"} Card Theme`}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-[#FA5D00] active:scale-95 transition-all cursor-pointer"
          >
            {cardTheme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
          </button>

          {/* Copy Profile Link Button */}
          <button
            onClick={handleCopyLink}
            title="Copy Builder Profile Link"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-[#FA5D00] active:scale-95 transition-all cursor-pointer"
          >
            {copiedLink ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <LinkIcon className="w-5 h-5" />
            )}
          </button>

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            title="Close"
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Floating Status Notification Toast */}
      {statusMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold tracking-wider uppercase shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FA5D00]" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  )
}
