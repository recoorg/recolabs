"use client"

import * as React from "react"
import {
  Zap,
  Flame,
  Check,
  X,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Mail,
  Copy,
  CreditCard,
  QrCode,
  Smartphone,
  Lock,
  Loader2,
  CheckCircle2,
  Crown,
} from "lucide-react"
import confetti from "canvas-confetti"
import QRCode from "qrcode"
import type { StartupItem } from "@/services/networkApi"
import { networkApi } from "@/services/networkApi"

interface StartupPromoteModalProps {
  startup: StartupItem | null
  onClose: () => void
  onBoostSuccess?: (startupId: number) => void
}

export function StartupPromoteModal({ startup, onClose, onBoostSuccess }: StartupPromoteModalProps) {
  const [selectedTier, setSelectedTier] = React.useState<"spotlight" | "surge">("surge")
  const [paymentMode, setPaymentMode] = React.useState<"upi" | "card" | "instant">("instant")
  const [copiedUpi, setCopiedUpi] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)

  if (!startup) return null

  const upiId = "devadibxr@okaxis"
  const adminEmail = "devadibxr@gmail.com"

  const tiers = {
    spotlight: {
      name: "Spotlight Pin",
      price: "$3",
      inr: "₹199",
      amountNum: 199,
      duration: "7 Days Pinned #1",
      features: [
        "Pinned to #1 spot on Founder Network feed",
        "Vibrant orange halo border",
        "Direct link to your live product",
      ],
    },
    surge: {
      name: "Launch Surge Pin",
      price: "$5",
      inr: "₹399",
      amountNum: 399,
      duration: "14 Days Pinned #1",
      features: [
        "Top #1 priority placement above all other listings",
        "Featured spotlight glow and badge",
        "Permanent Founder Network index priority",
        "Social shoutout on @adibxr Twitter/X",
      ],
    },
  }

  const activeTier = tiers[selectedTier]
  const currentUser = networkApi.getCurrentUser()
  const isUserPro = Boolean(currentUser?.is_verified || currentUser?.is_pro)

  const upiPaymentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Reco Labs")}&am=${activeTier.amountNum}&cu=INR&tn=${encodeURIComponent(`Boost_${startup.name.replace(/[^a-zA-Z0-9]/g, "")}`)}`
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("")

  React.useEffect(() => {
    let active = true
    QRCode.toDataURL(upiPaymentUri, {
      width: 220,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" }
    }).then(url => {
      if (active) setQrCodeUrl(url)
    }).catch(err => {
      console.error("QR render error:", err)
      if (active) setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPaymentUri)}`)
    })
    return () => { active = false }
  }, [upiPaymentUri])

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handleExecutePin = async () => {
    setLoading(true)
    try {
      await networkApi.boostStartup(startup.id)
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } })
      setPinned(true)
      if (onBoostSuccess) onBoostSuccess(startup.id)
    } catch (e) {
      // Optimistic pin
      confetti({ particleCount: 80, spread: 75, origin: { y: 0.55 } })
      setPinned(true)
      if (onBoostSuccess) onBoostSuccess(startup.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b editorial-hairline flex items-start justify-between gap-3 flex-none">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#FA5D00] border border-orange-200 dark:border-orange-900/60 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 fill-[#FA5D00]" />
              <span>STARTUP SPOTLIGHT PIN</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              Pin <span className="font-bold underline decoration-[#FA5D00]">{startup.name}</span> to #1
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex-none mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
          {pinned ? (
            <div className="py-8 text-center font-mono space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
                {startup.name} Pinned to Top!
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your startup now holds the #1 featured placement across the Founder Network directory.
              </p>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 shadow-md cursor-pointer"
                >
                  View Feed
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Pro Founder Complimentary Pin Banner */}
              {isUserPro && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 animate-in fade-in">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>PRO BUILDER BENEFIT ACTIVE</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
                      Complimentary startup pinning is included with your Verified Pro membership!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExecutePin}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md flex-none disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>{loading ? "Pinning..." : "Pin Free"}</span>
                  </button>
                </div>
              )}

              {/* Tier Selection */}
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                {(["spotlight", "surge"] as const).map((t) => {
                  const item = tiers[t]
                  const isSelected = selectedTier === t
                  return (
                    <div
                      key={t}
                      onClick={() => setSelectedTier(t)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-[#FA5D00] bg-orange-500/[0.05] dark:bg-orange-500/[0.08] shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100">{item.name}</span>
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-[#FA5D00] bg-[#FA5D00]" : "border-zinc-400"
                            }`}
                          >
                            {isSelected && <Check className="w-2 h-2 text-black" />}
                          </div>
                        </div>

                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl font-black text-zinc-950 dark:text-zinc-50">{item.inr}</span>
                          <span className="text-[10px] text-zinc-400 font-bold">({item.price})</span>
                        </div>
                        <div className="text-[9px] text-[#FA5D00] font-bold">{item.duration}</div>

                        <ul className="mt-2 space-y-1 text-[10px] font-sans text-zinc-600 dark:text-zinc-400">
                          {item.features.slice(0, 2).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1 leading-tight">
                              <Check className="w-3 h-3 text-[#FA5D00] flex-none mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Tabs: Instant Pin / UPI QR */}
              <div className="space-y-2 font-mono">
                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  Select Action
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("instant")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      paymentMode === "instant"
                        ? "border-[#FA5D00] bg-orange-50 dark:bg-orange-950/40 text-[#FA5D00]"
                        : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Instant Pin #1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("upi")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      paymentMode === "upi"
                        ? "border-[#FA5D00] bg-orange-50 dark:bg-orange-950/40 text-[#FA5D00]"
                        : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <QrCode className="w-3 h-3" />
                    <span>UPI QR Code</span>
                  </button>
                </div>

                {paymentMode === "instant" && (
                  <div className="p-3.5 rounded-2xl bg-orange-500/[0.04] dark:bg-orange-500/[0.08] border border-orange-500/20 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                    <p className="leading-relaxed">
                      Pin <strong>{startup.name}</strong> to the top position on the feed immediately. Your card will gain priority backlink indexing and top visibility.
                    </p>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleExecutePin}
                      className="w-full py-2.5 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5" />}
                      <span>Pin to Top of Feed Now ({activeTier.inr})</span>
                    </button>
                  </div>
                )}

                {paymentMode === "upi" && (
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-lg bg-white border border-zinc-200 flex-none">
                        <img src={qrCodeUrl} alt="UPI QR" className="w-20 h-20 object-contain rounded" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[9px] text-zinc-400 uppercase block">UPI ID: {upiId}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold"
                          >
                            {copiedUpi ? "Copied" : "Copy UPI"}
                          </button>
                          <a
                            href={upiPaymentUri}
                            className="px-2 py-0.5 rounded-full bg-[#FA5D00]/20 text-[#FA5D00] text-[10px] font-bold"
                          >
                            Open App
                          </a>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleExecutePin}
                      className="w-full mt-2 py-2 rounded-xl bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider"
                    >
                      Confirm Payment &amp; Pin #1
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!pinned && (
          <div className="p-3.5 sm:px-5 bg-zinc-50/90 dark:bg-zinc-900/90 border-t editorial-hairline flex items-center justify-between font-mono flex-none">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Total: {activeTier.inr} <span className="text-[10px] text-zinc-400 font-normal">({activeTier.price})</span>
            </span>
            <button
              type="button"
              disabled={loading}
              onClick={handleExecutePin}
              className="px-5 py-2 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>Pin to #1 Feed</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StartupPromoteModal
