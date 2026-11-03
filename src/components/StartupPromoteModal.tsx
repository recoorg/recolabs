"use client"

import * as React from "react"
import { Zap, Flame, Check, X, ArrowUpRight, Sparkles, ShieldCheck, Mail, Copy, CreditCard } from "lucide-react"
import confetti from "canvas-confetti"
import type { StartupItem } from "@/services/networkApi"

interface StartupPromoteModalProps {
  startup: StartupItem | null
  onClose: () => void
}

export function StartupPromoteModal({ startup, onClose }: StartupPromoteModalProps) {
  const [selectedTier, setSelectedTier] = React.useState<"spotlight" | "surge">("surge")
  const [copiedUpi, setCopiedUpi] = React.useState(false)
  const [paymentMode, setPaymentMode] = React.useState<"card" | "upi" | "invoice">("card")

  if (!startup) return null

  const sponsorEmail = "devadibxr@gmail.com"
  const upiId = "devadibxr@okaxis"

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handleSelectBoost = () => {
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } })
    const subject = encodeURIComponent(`[Spotlight Request] ${startup.name} (${selectedTier === "surge" ? "$49 Launch Surge" : "$29 Spotlight"})`)
    const body = encodeURIComponent(
      `Hi Aditya,\n\nI would like to boost my startup on Reco Labs Founder Network:\n\n` +
      `Startup Name: ${startup.name}\n` +
      `Website: ${startup.url}\n` +
      `Tier Selected: ${selectedTier === "surge" ? "Launch Surge ($49 / 14 Days + Social Blast)" : "Spotlight Boost ($29 / 7 Days)"}\n` +
      `Founder: ${startup.founder_name} (@${startup.founder_username || ""})\n` +
      `Preferred Payment Method: ${paymentMode.toUpperCase()}\n\n` +
      `Please send over the payment link / invoice to get our card pinned.`
    )
    window.open(`mailto:${sponsorEmail}?subject=${subject}&body=${body}`, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-sans">
      <div className="relative max-w-2xl w-full my-auto rounded-3xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-[#FA5D00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#FA5D00] border border-orange-200 dark:border-orange-900/60 font-mono text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 fill-[#FA5D00]" />
            <span>FOUNDER SPOTLIGHT &amp; BOOST</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            Put <span className="font-bold underline decoration-[#FA5D00] underline-offset-4">{startup.name}</span> in front of 5,000+ builders<span className="text-[#FA5D00]">.</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Boost your product to the top of the feed, get peer feedback, and launch with high-authority backlink distribution.
          </p>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          
          {/* Tier 1: Spotlight Boost ($29) */}
          <div
            onClick={() => setSelectedTier("spotlight")}
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedTier === "spotlight"
                ? "border-[#FA5D00] bg-orange-50/40 dark:bg-orange-950/20 shadow-md"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  7-DAY PINNED
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold">
                  Basic
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-3xl font-bold text-zinc-950 dark:text-zinc-50">$29</span>
                <span className="font-mono text-xs text-zinc-400">/ one-time</span>
              </div>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pinned at the top of the startup directory with priority reviews.
              </p>
              
              <ul className="mt-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span>Pinned top row for 7 days</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span>Official SPOTLIGHT badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span>Weekly Discord builder digest</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span>Permanent indexed backlink</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tier 2: Launch Surge ($49) - Featured */}
          <div
            onClick={() => setSelectedTier("surge")}
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedTier === "surge"
                ? "border-[#FA5D00] bg-orange-50/50 dark:bg-orange-950/25 shadow-lg shadow-[#FA5D00]/10"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            {/* Top Recommended Tag */}
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#FA5D00] text-black font-mono text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3 fill-black" />
              <span>POPULAR</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-[#FA5D00] uppercase tracking-wider">
                  14-DAY PINNED + SOCIALS
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-3xl font-bold text-zinc-950 dark:text-zinc-50">$49</span>
                <span className="font-mono text-xs text-zinc-400">/ one-time</span>
              </div>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Full-throttle launch promotion across Reco Labs web, Discord &amp; Twitter.
              </p>
              
              <ul className="mt-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span className="font-bold">14 Days pinned top placement</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span>Glowing orange priority card</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span>X / Twitter post (@adibxr)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span>Dedicated Discord @everyone ping</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none" />
                  <span>Guaranteed 10+ peer ratings</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Payment Method Switcher */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-zinc-500 font-semibold uppercase">Choose Payment Option:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode("card")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  paymentMode === "card"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Card / Stripe
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("upi")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  paymentMode === "upi"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                UPI (India ₹)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("invoice")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  paymentMode === "invoice"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Invoice
              </button>
            </div>
          </div>

          {/* Payment Detail Details Box */}
          {paymentMode === "upi" ? (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px]">PAY VIA ANY UPI APP (GPAY / PAYTM / PHONEPE):</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{upiId}</span>
                <span className="text-emerald-500 font-semibold block text-[11px]">
                  Amount: {selectedTier === "surge" ? "₹3,999" : "₹2,499"}
                </span>
              </div>
              <button
                onClick={handleCopyUpi}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-85 transition-opacity cursor-pointer"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUpi ? "Copied" : "Copy UPI"}</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <CreditCard className="w-4 h-4 text-[#FA5D00]" />
                <span>Secure payment handled directly via Stripe / Invoice with instant activation.</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleSelectBoost}
            className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#FA5D00] hover:bg-[#e05300] active:scale-98 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Lock in {selectedTier === "surge" ? "$49 Launch Surge" : "$29 Spotlight"}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

        <div className="mt-3.5 text-center font-mono text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Manual editorial review within 4 hours. 100% money-back guarantee if unapproved.</span>
        </div>

      </div>
    </div>
  )
}

export default StartupPromoteModal
