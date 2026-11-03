"use client"

import * as React from "react"
import {
  ShieldCheck,
  Check,
  X,
  ArrowUpRight,
  Sparkles,
  Zap,
  Copy,
  Mail,
  CreditCard,
  QrCode,
  Star,
  CheckCircle2,
} from "lucide-react"
import confetti from "canvas-confetti"

interface ProfileUpgradeModalProps {
  username: string
  name: string
  onClose: () => void
}

export function ProfileUpgradeModal({ username, name, onClose }: ProfileUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<"lifetime" | "annual">("lifetime")
  const [paymentMethod, setPaymentMethod] = React.useState<"upi" | "card" | "invoice">("upi")
  const [copiedUpi, setCopiedUpi] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const upiId = "devadibxr@okaxis"
  const adminEmail = "devadibxr@gmail.com"

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handleConfirmUpgrade = () => {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } })
    setSubmitted(true)
  }

  const plans = [
    {
      id: "lifetime",
      name: "Lifetime Verified Pro",
      price: "$19",
      inr: "₹999",
      period: "one-time payment",
      popular: true,
      features: [
        "Verified Pro blue checkmark badge across all pages",
        "Top-tier placement in Founder Network & Directory",
        "Direct Contact & Hire Me trigger on your profile",
        "Priority indexing in Google SEO crawl shell",
        "Lifetime access — never expires",
      ],
    },
    {
      id: "annual",
      name: "Pro Founder Pass",
      price: "$49",
      inr: "₹2,499",
      period: "per year",
      popular: false,
      features: [
        "Everything in Lifetime Verified Pro",
        "1 Free Startup Spotlight Pin ($49 value)",
        "Featured Recruiter badge on all posted jobs",
        "VIP Discord Guild role & private alpha channel",
        "Personal social shoutout on @adibxr Twitter/X",
      ],
    },
  ]

  const activePlanObj = plans.find((p) => p.id === selectedPlan)!

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-6 sm:p-8 shadow-2xl text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full border editorial-hairline hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-10 text-center font-mono space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              Upgrade Order Initiated!
            </h3>
            <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              We received your request to upgrade <strong>@{username}</strong> to{" "}
              <strong>{activePlanObj.name}</strong>. Verification checkmarks activate automatically upon payment confirmation.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`mailto:${adminEmail}?subject=Payment%20Confirmation%20-%20Verified%20Pro%20Upgrade%20@${encodeURIComponent(username)}&body=Hi%20Aditya%2C%0A%0AI%20have%20initiated%20the%20payment%20for%20Verified%20Pro%20upgrade%20for%20@${encodeURIComponent(username)}%20(${activePlanObj.price}%20/%20${activePlanObj.inr}).%20Please%20verify%20and%20activate%20my%20badge.`}
                className="px-6 py-2.5 rounded-full bg-[#FA5D00] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#e05300] transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Payment Proof</span>
              </a>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full border editorial-hairline text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>VERIFIED PRO PASS</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
                Upgrade @{username}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Establish builder authority with permanent verification marks, top ranking, and direct recruiter reach.
              </p>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id as any)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? "border-[#FA5D00] bg-orange-500/[0.05] dark:bg-orange-500/[0.08] shadow-md shadow-[#FA5D00]/10"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-400"
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#FA5D00] text-black text-[9px] font-black uppercase tracking-wider">
                        POPULAR
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{p.name}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#FA5D00] bg-[#FA5D00]" : "border-zinc-400"}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-black" />}
                        </div>
                      </div>

                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{p.price}</span>
                        <span className="text-xs text-zinc-400 font-bold">({p.inr})</span>
                        <span className="text-[10px] text-zinc-400 font-normal">· {p.period}</span>
                      </div>

                      <ul className="mt-3 space-y-1.5 text-[11px] font-sans text-zinc-600 dark:text-zinc-400">
                        {p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <Check className="w-3.5 h-3.5 text-[#FA5D00] flex-none mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Payment Options */}
            <div className="space-y-3 font-mono">
              <span className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                Select Payment Method
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-[#FA5D00] bg-orange-50 dark:bg-orange-950/40 text-[#FA5D00]"
                      : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-[#FA5D00] bg-orange-50 dark:bg-orange-950/40 text-[#FA5D00]"
                      : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card / Net</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("invoice")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "invoice"
                      ? "border-[#FA5D00] bg-orange-50 dark:bg-orange-950/40 text-[#FA5D00]"
                      : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              </div>

              {/* UPI Box */}
              {paymentMethod === "upi" && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Official UPI VPA</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-[#FA5D00] hover:text-black font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUpi ? "Copied" : "Copy UPI"}</span>
                  </button>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Direct Razorpay card &amp; international checkout. Razorpay accepts Visa, Mastercard, RuPay, and American Express.
                </div>
              )}

              {paymentMethod === "invoice" && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  An official GST invoice will be generated and dispatched to your email for corporate tax reimbursement.
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-2 flex items-center justify-between gap-4 font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Total Due:</span>
                <span className="font-serif text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                  {activePlanObj.price}{" "}
                  <span className="text-xs font-mono font-normal text-zinc-400">({activePlanObj.inr})</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${adminEmail}?subject=Verified%20Pro%20Upgrade%20Order%20-%20@${encodeURIComponent(username)}&body=Hi%20Aditya%2C%0A%0AI%20am%20upgrading%20@${encodeURIComponent(username)}%20(${name})%20to%20${encodeURIComponent(activePlanObj.name)}%20(${activePlanObj.price}%20/%20${activePlanObj.inr}).%0A%0APayment%20Method%3A%20${paymentMethod.toUpperCase()}%0APlease%20confirm%20my%20verification%20badge.`}
                  onClick={handleConfirmUpgrade}
                  className="px-6 py-3 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-black font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Activate</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileUpgradeModal
