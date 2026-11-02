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
} from "lucide-react"
import type { StartupItem } from "@/services/networkApi"

interface StartupScreenshotModalProps {
  startup: StartupItem | null
  onClose: () => void
}

/**
 * High-reliability offscreen canvas card generator as a guaranteed fallback
 * in case html2canvas fails due to browser security restrictions or cross-origin canvas tainting.
 */
function drawCardOnCanvas(startup: StartupItem, founderAvatarImg?: HTMLImageElement | null): string {
  const canvas = document.createElement("canvas")
  const W = 1200
  const H = 720
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  const founderName = startup.founder_name || "Anonymous Founder"
  const founderUsername =
    startup.founder_username ||
    (startup as any).author_username ||
    founderName.toLowerCase().replace(/[^a-z0-9_-]/g, "")
  const category = (startup.category || "Software").toUpperCase()
  const stage = (startup.stage || "Prototype").toUpperCase()
  const cleanUrl = (startup.url || "https://recolabs.in").replace(/^https?:\/\//, "").replace(/\/$/, "")

  // Outer dark background
  ctx.fillStyle = "#09090b"
  ctx.fillRect(0, 0, W, H)

  // Subtle ambient orange glow
  const glow = ctx.createRadialGradient(W - 120, 120, 20, W - 120, 120, 360)
  glow.addColorStop(0, "rgba(250, 93, 0, 0.14)")
  glow.addColorStop(1, "rgba(250, 93, 0, 0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Inner card bounds
  const cx = 80
  const cy = 60
  const cw = W - 160
  const ch = H - 120
  const cr = 28

  // Helper: rounded rectangle path
  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  // Draw inner card surface
  roundRect(cx, cy, cw, ch, cr)
  ctx.fillStyle = "#151518"
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"
  ctx.stroke()

  // Inner content area
  const pad = 44
  const startX = cx + pad
  let currY = cy + pad

  // 1. Founder Avatar (Circular)
  const avatarR = 34
  const avatarX = startX + avatarR
  const avatarY = currY + avatarR

  ctx.save()
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2)
  ctx.clip()
  if (founderAvatarImg && founderAvatarImg.complete && founderAvatarImg.naturalWidth > 0) {
    ctx.drawImage(founderAvatarImg, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2)
  } else {
    const avatarGrad = ctx.createLinearGradient(avatarX - avatarR, avatarY - avatarR, avatarX + avatarR, avatarY + avatarR)
    avatarGrad.addColorStop(0, "#FA5D00")
    avatarGrad.addColorStop(1, "#fbbf24")
    ctx.fillStyle = avatarGrad
    ctx.fill()
    ctx.fillStyle = "#000000"
    ctx.font = "bold 24px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText((founderName[0] || "B").toUpperCase(), avatarX, avatarY)
  }
  ctx.restore()

  // Founder avatar border
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2)
  ctx.lineWidth = 2
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
  ctx.stroke()

  // Reco Labs Brand Monogram (Upper Right of Card)
  const logoW = 52
  const logoH = 52
  const logoX = cx + cw - pad - logoW
  const logoY = currY
  roundRect(logoX, logoY, logoW, logoH, 14)
  ctx.fillStyle = "#FA5D00"
  ctx.fill()
  ctx.fillStyle = "#000000"
  ctx.font = "900 22px monospace"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("RL", logoX + logoW / 2, logoY + logoH / 2)

  // 2. Founder Name & Metadata
  const metaX = avatarX + avatarR + 18
  ctx.textAlign = "left"
  ctx.textBaseline = "alphabetic"
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillText(founderName, metaX, currY + 30)

  ctx.fillStyle = "#FA5D00"
  ctx.font = "bold 17px monospace"
  ctx.fillText(`@${founderUsername}`, metaX, currY + 58)

  const handleWidth = ctx.measureText(`@${founderUsername}`).width
  ctx.fillStyle = "#71717a"
  ctx.font = "16px monospace"
  ctx.fillText(` • #${category} • ${stage}`, metaX + handleWidth, currY + 58)

  // Divider line
  currY += avatarR * 2 + 28
  ctx.beginPath()
  ctx.moveTo(startX, currY)
  ctx.lineTo(cx + cw - pad, currY)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.lineWidth = 1
  ctx.stroke()

  // 3. Startup Title
  currY += 46
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.fillText(startup.name, startX, currY)

  // 4. Problem Solving Description (Word Wrapped)
  currY += 28
  ctx.fillStyle = "#d4d4d8"
  ctx.font = "20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  const maxTextWidth = cw - pad * 2
  const words = (startup.problem_solving || "").split(/\s+/)
  let line = ""
  let linesRendered = 0
  const maxLines = 4

  for (const word of words) {
    const testLine = line + (line ? " " : "") + word
    const testWidth = ctx.measureText(testLine).width
    if (testWidth > maxTextWidth && line) {
      ctx.fillText(line, startX, currY + 22)
      currY += 32
      line = word
      linesRendered++
      if (linesRendered >= maxLines) {
        line += "..."
        break
      }
    } else {
      line = testLine
    }
  }
  if (line && linesRendered < maxLines) {
    ctx.fillText(line, startX, currY + 22)
    currY += 32
  }

  // 5. Clean URL Pill
  currY += 24
  const pillText = cleanUrl
  ctx.font = "bold 16px monospace"
  const pillW = ctx.measureText(pillText).width + 36
  const pillH = 34
  roundRect(startX, currY, pillW, pillH, 17)
  ctx.fillStyle = "#27272a"
  ctx.fill()
  ctx.fillStyle = "#FA5D00"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("↗ " + pillText, startX + pillW / 2, currY + pillH / 2)

  // 6. Card Bottom Watermark
  const bottomY = cy + ch + 32
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "#71717a"
  ctx.font = "15px monospace"
  ctx.fillText(`Posted by @${founderUsername} on Reco Labs · recolabs.in`, W / 2, bottomY)

  return canvas.toDataURL("image/png")
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

  const cleanUrl = (startup.url || "https://recolabs.in").replace(/^https?:\/\//, "").replace(/\/$/, "")

  // Determine avatar pfp with automatic fallback
  const founderAvatar =
    startup.avatar_url ||
    (startup as any).author_avatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(founderUsername)}`

  // Helper to safely render card: tries html2canvas first, seamlessly falls back to 2D canvas
  const generateCardDataUrl = async (): Promise<string> => {
    // 1. Try html2canvas if available
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#09090b",
          logging: false,
          onclone: (clonedDoc) => {
            // Clean up any dynamic blur elements that can trip html2canvas
            const blurEls = clonedDoc.querySelectorAll(".blur-3xl")
            blurEls.forEach((el) => ((el as HTMLElement).style.display = "none"))
          },
        })
        const dataUrl = canvas.toDataURL("image/png")
        if (dataUrl && dataUrl.startsWith("data:image/png")) {
          return dataUrl
        }
      } catch (e) {
        console.warn("html2canvas fallback note, drawing on 2D canvas:", e)
      }
    }

    // 2. Direct high-res 2D Canvas rendering fallback
    let preloadedImg: HTMLImageElement | null = null
    try {
      preloadedImg = new Image()
      preloadedImg.crossOrigin = "anonymous"
      await new Promise((res) => {
        if (!preloadedImg) return res(null)
        preloadedImg.onload = () => res(null)
        preloadedImg.onerror = () => res(null)
        preloadedImg.src = founderAvatar
      })
    } catch {
      preloadedImg = null
    }

    return drawCardOnCanvas(startup, preloadedImg)
  }

  // Download snapshot as PNG
  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    setStatusMessage("Rendering screenshot...")
    try {
      const dataUrl = await generateCardDataUrl()
      if (!dataUrl) throw new Error("Could not create screenshot image")

      const link = document.createElement("a")
      const safeName = startup.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
      link.download = `${safeName}-recolabs.png`
      link.href = dataUrl
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
    if (copiedImage) return
    setStatusMessage("Generating image...")
    try {
      const dataUrl = await generateCardDataUrl()
      if (!dataUrl) throw new Error("Could not create screenshot image")

      // Fetch blob from dataURL
      const res = await fetch(dataUrl)
      const blob = await res.blob()

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
        // Fallback for browsers that block async clipboard writes
        const link = document.createElement("a")
        const safeName = startup.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
        link.download = `${safeName}-recolabs.png`
        link.href = dataUrl
        link.click()
        setStatusMessage("Downloaded screenshot to your device!")
        setTimeout(() => setStatusMessage(""), 3000)
      }
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
          data-screenshot-card="true"
          className="relative w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-[#09090b] border-2 border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Ambient corner glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FA5D00]/10 rounded-full pointer-events-none" />

          {/* INNER CARD */}
          <div className="relative z-10 w-full rounded-2xl bg-[#151518] border border-zinc-800 p-6 sm:p-7 shadow-lg">
            
            {/* Top Row: Founder info & Reco Monogram Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Founder Avatar PFP */}
                <div className="relative flex-none">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-[#FA5D00] to-amber-400 text-black font-mono font-bold flex items-center justify-center text-sm shadow-md border border-white/10">
                    <img
                      src={founderAvatar}
                      alt={founderName}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(founderUsername)}`
                      }}
                    />
                  </div>
                  {/* Verified Founder Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FA5D00] text-black flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                {/* Founder Meta */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-base leading-snug">
                      {founderName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 mt-0.5">
                    <span className="text-[#FA5D00] font-semibold">@{founderUsername}</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] tracking-wider font-semibold text-zinc-300">
                      #{startup.category.toLowerCase().replace(/[^a-z0-9]/g, "")}
                    </span>
                    <span>•</span>
                    <span className="text-[10px] uppercase text-zinc-400">{startup.stage}</span>
                  </div>
                </div>
              </div>

              {/* Reco Labs Brand Mark (Upper Right) */}
              <div
                className="w-10 h-10 rounded-xl bg-[#FA5D00] p-1.5 flex items-center justify-center shadow-sm flex-none select-none text-black font-mono font-black text-sm"
                title="Reco Labs Network"
              >
                RL
              </div>
            </div>

            {/* Middle Pitch Section */}
            <div className="mt-5 pt-4 border-t border-zinc-800">
              {/* Startup Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {startup.name}
              </h2>

              {/* Problem Solving Pitch Text */}
              <div className="mt-3 font-sans text-sm sm:text-[15px] text-zinc-300 leading-relaxed whitespace-pre-line">
                {startup.problem_solving}
              </div>

              {/* Startup URL Badge */}
              <div className="mt-4 pt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 font-mono text-xs font-semibold">
                  <ExternalLink className="w-3 h-3 text-[#FA5D00]" />
                  <span>{cleanUrl}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Card Footer Watermark */}
          <div className="relative z-10 mt-5 pt-1 text-center font-mono text-xs text-zinc-400 flex items-center justify-center gap-1.5">
            <span>Posted by</span>
            <span className="font-bold text-zinc-200">@{founderUsername}</span>
            <span>on</span>
            <span className="font-serif font-bold text-white text-sm tracking-tight flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#FA5D00]" />
              Reco Labs
            </span>
          </div>
        </div>

        {/* FLOATING ACTION TOOLBAR */}
        <div className="flex md:flex-col items-center gap-2.5 p-2 rounded-full md:rounded-2xl bg-zinc-900 border-2 border-zinc-700 shadow-2xl backdrop-blur-md">
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
            className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-800 text-zinc-200 hover:text-[#FA5D00] hover:border-[#FA5D00] border border-transparent active:scale-95 transition-all cursor-pointer"
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
            className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-800 text-zinc-200 hover:text-[#FA5D00] active:scale-95 transition-all cursor-pointer"
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
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer"
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

export default StartupScreenshotModal
