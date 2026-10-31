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
  BadgeCheck,
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
    .toUpperCase()

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
        allowTaint: true,
        backgroundColor: null,
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
      setTimeout(() => setStatusMessage(""), 2500)
    } catch (err: any) {
      console.error("Failed to render card:", err)
      setStatusMessage("Failed to render screenshot.")
      setTimeout(() => setStatusMessage(""), 3000)
    } finally {
      setDownloading(false)
    }
  }

  // Copy PNG image to clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current || copiedImage) return
    setStatusMessage("Generating image...")
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setStatusMessage("Clipboard export unavailable.")
          return
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])
          setCopiedImage(true)
          setStatusMessage("Image copied! Paste anywhere.")
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })
          setTimeout(() => {
            setCopiedImage(false)
            setStatusMessage("")
          }, 3000)
        } catch {
          // Fallback if write ClipboardItem fails
          const imgUrl = canvas.toDataURL("image/png")
          const win = window.open()
          if (win) {
            win.document.write(`<img src="${imgUrl}" style="max-width:100%" />`)
            setStatusMessage("Opened in new tab to copy!")
          } else {
            setStatusMessage("Copy not permitted by browser.")
          }
          setTimeout(() => setStatusMessage(""), 3000)
        }
      }, "image/png")
    } catch (err: any) {
      console.error("Failed to copy card image:", err)
      setStatusMessage("Error copying image.")
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      {/* Container holding Card + Floating Toolbar */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl w-full my-auto">
        
        {/* THE EXPORTABLE RECO LABS CARD */}
        <div
          ref={cardRef}
          className="relative w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-zinc-100 dark:bg-[#0c0c0e] border-2 border-zinc-300 dark:border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Subtle gradient vignette */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FA5D00]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#FA5D00]/10 rounded-full blur-3xl pointer-events-none" />

          {/* INNER WHITE / DARK CARD (Matching the Peerlist format, customized for Reco Labs) */}
          <div className="relative z-10 w-full rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-7 shadow-lg">
            
            {/* Top Row: Founder info & Reco Monogram Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Founder Avatar */}
                <div className="relative flex-none">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FA5D00] to-amber-400 text-black font-mono font-bold flex items-center justify-center text-sm shadow-md overflow-hidden">
                    {(startup as any).avatar_url ? (
                      <img
                        src={(startup as any).avatar_url}
                        alt={founderName}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  {/* Verified Founder Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FA5D00] text-black flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                {/* Founder Meta */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-zinc-950 dark:text-zinc-50 text-base leading-snug">
                      {founderName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span className="text-[#FA5D00] font-semibold">@{founderUsername}</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] tracking-wider font-semibold">
                      #{startup.category.toLowerCase().replace(/[^a-z0-9]/g, "")}
                    </span>
                    <span>•</span>
                    <span className="text-[10px] uppercase text-zinc-400">{startup.stage}</span>
                  </div>
                </div>
              </div>

              {/* Reco Labs Brand Mark (Upper Right) */}
              <div
                className="w-10 h-10 rounded-xl bg-[#FA5D00] p-1.5 flex items-center justify-center shadow-sm flex-none select-none overflow-hidden"
                title="Reco Labs Network"
              >
                <img src="/favicon.png" alt="Reco Labs" className="w-full h-full object-contain filter brightness-0" />
              </div>
            </div>

            {/* Middle Pitch Section */}
            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              {/* Startup Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
                {startup.name}
              </h2>

              {/* Problem Solving Pitch Text */}
              <div className="mt-3 font-sans text-sm sm:text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {startup.problem_solving}
              </div>

              {/* Startup URL Badge */}
              <div className="mt-4 pt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-xs font-semibold">
                  <ExternalLink className="w-3 h-3 text-[#FA5D00]" />
                  <span>{cleanUrl}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Card Footer Watermark (Matching the bottom caption in the screenshot) */}
          <div className="relative z-10 mt-5 pt-1 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <span>Posted by</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">@{founderUsername}</span>
            <span>on</span>
            <span className="font-serif font-bold text-zinc-950 dark:text-zinc-50 text-sm tracking-tight flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#FA5D00]" />
              Reco Labs
            </span>
          </div>
        </div>

        {/* FLOATING ACTION TOOLBAR (Right on desktop, bottom on mobile) */}
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
            className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-[#FA5D00] hover:border-[#FA5D00] border border-transparent active:scale-95 transition-all cursor-pointer"
          >
            {copiedImage ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold tracking-wider uppercase shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FA5D00]" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  )
}
