"use client"

import * as React from "react"
import {
  Zap,
  Flame,
  Check,
  X,
  CreditCard,
  QrCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
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
  const [paymentMode, setPaymentMode] = React.useState<"instant" | "upi">("instant")
  const [loading, setLoading] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  const [boostError, setBoostError] = React.useState("")
  const [quota, setQuota] = React.useState<{ activeCount: number; limit: number; startups: any[] } | null>(null)
  const [loadingQuota, setLoadingQuota] = React.useState(true)
  const [rzpQrId, setRzpQrId] = React.useState<string>("")
  const [rzpQrImage, setRzpQrImage] = React.useState<string>("")
  const [loadingQr, setLoadingQr] = React.useState(false)
  const [checkingPayment, setCheckingPayment] = React.useState(false)

  if (!startup) return null

  const priceInr = "₹199"
  const amountNum = 199

  // Fetch Quota on mount
  React.useEffect(() => {
    let active = true
    networkApi
      .getBoostQuota()
      .then((data) => {
        if (active) {
          setQuota(data)
          setLoadingQuota(false)
        }
      })
      .catch((err) => {
        console.error("Failed to fetch boost quota:", err)
        if (active) setLoadingQuota(false)
      })
    return () => {
      active = false
    }
  }, [])

  const activeCount = quota?.activeCount ?? 0
  const limit = quota?.limit ?? 3
  const isCurrentlyBoosted = Boolean(startup.is_featured)
  const isQuotaFull = !isCurrentlyBoosted && activeCount >= limit
  const slotsRemaining = Math.max(0, limit - activeCount)

  // Generate dynamic Razorpay QR via API
  React.useEffect(() => {
    let isMounted = true
    setLoadingQr(true)
    const currentUser = networkApi.getCurrentUser()
    networkApi
      .createRazorpayQr({
        amount: amountNum,
        name: "Reco Labs",
        description: `Boost: ${startup.name}`.slice(0, 30),
        notes: {
          purpose: "startup_boost",
          startup_id: startup.id,
          user_id: currentUser?.id,
        },
      })
      .then((res) => {
        if (isMounted && res.image_url) {
          setRzpQrImage(res.image_url)
          setRzpQrId(res.qr_id)
        }
      })
      .catch((err) => {
        console.error("Razorpay QR generation error:", err)
      })
      .finally(() => {
        if (isMounted) setLoadingQr(false)
      })

    return () => {
      isMounted = false
    }
  }, [startup.id, startup.name])

  // Polling for QR payment
  React.useEffect(() => {
    if (!rzpQrId || pinned || paymentMode !== "upi") return
    const interval = setInterval(async () => {
      try {
        const check = await networkApi.checkRazorpayQr(rzpQrId)
        if (check.paid) {
          clearInterval(interval)
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } })
          setPinned(true)
          if (onBoostSuccess) onBoostSuccess(startup.id)
        }
      } catch (err) {
        // silent polling catch
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [rzpQrId, pinned, paymentMode, startup.id, onBoostSuccess])

  const handleCheckQrPaid = async () => {
    if (!rzpQrId) return
    setCheckingPayment(true)
    setBoostError("")
    try {
      const check = await networkApi.checkRazorpayQr(rzpQrId)
      if (check.paid) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } })
        setPinned(true)
        if (onBoostSuccess) onBoostSuccess(startup.id)
      } else {
        setBoostError("Payment not detected yet. Please scan the Razorpay QR code and complete payment in your UPI app.")
      }
    } catch (err: any) {
      setBoostError(err.message || "Failed to verify Razorpay QR payment.")
    } finally {
      setCheckingPayment(false)
    }
  }

  const handleExecutePin = async () => {
    if (isQuotaFull) {
      setBoostError("Weekly boost quota is full (3/3 active). Please wait for a slot to expire.")
      return
    }
    setLoading(true)
    setBoostError("")
    try {
      await networkApi.boostStartup(startup.id)
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } })
      setPinned(true)
      if (onBoostSuccess) onBoostSuccess(startup.id)
    } catch (e: any) {
      setBoostError(e?.message || "Failed to boost startup. Quota may be full.")
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ccff00] text-black border border-black/20 font-mono text-[10px] font-black uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5 fill-black text-black" />
              <span>1-WEEK SPOTLIGHT PIN</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              Boost <span className="font-bold underline decoration-[#ccff00]">{startup.name}</span> to #1
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
              <div className="w-14 h-14 mx-auto rounded-full bg-[#ccff00]/20 border border-[#ccff00] flex items-center justify-center text-black dark:text-[#ccff00]">
                <CheckCircle2 className="w-8 h-8 text-[#a3cc00]" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
                {startup.name} Boosted to #1!
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your startup holds the <strong>Lime Yellow Spotlight Pin</strong> at the top of the Founder Network feed for 7 days.
              </p>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#ccff00] text-black font-mono text-xs font-black uppercase tracking-wider hover:opacity-90 shadow-md cursor-pointer border border-black/20"
                >
                  View Feed
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quota Tracker Banner */}
              <div
                className={`p-4 rounded-2xl border font-mono text-xs space-y-1 ${
                  isQuotaFull
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                    : "bg-[#ccff00]/10 border-[#ccff00]/40 text-zinc-900 dark:text-zinc-100"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>WEEKLY PIN QUOTA</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isQuotaFull ? "bg-rose-500 text-white" : "bg-[#ccff00] text-black"
                    }`}
                  >
                    {loadingQuota ? "Checking..." : `${activeCount} / ${limit} ACTIVE`}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {isQuotaFull
                    ? "All 3 weekly spotlight slots are currently taken. To prevent feed spam, new boosts are locked until an active slot expires."
                    : `Strict limit of 3 boosted startups simultaneously across the platform. ${slotsRemaining} slot${slotsRemaining === 1 ? "" : "s"} open this week.`}
                </p>
              </div>

              {/* Error banner */}
              {boostError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" />
                  <span>{boostError}</span>
                </div>
              )}

              {/* Tier Details Card */}
              <div className="p-4 rounded-2xl border-2 border-[#ccff00] bg-lime-400/[0.04] dark:bg-lime-950/20 font-mono space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-wider">
                      1-Week Spotlight Boost
                    </span>
                    <div className="text-[10px] text-zinc-500">Pinned at #1 position for 7 days</div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{priceInr}</span>
                    <span className="text-[10px] text-zinc-400 block font-sans">($3.00 USD)</span>
                  </div>
                </div>

                <ul className="space-y-1.5 text-[11px] font-sans text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-lime-500 flex-none" />
                    <span>
                      High-visibility <strong>Lime Yellow (#ccff00)</strong> glowing border &amp; badge
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-lime-500 flex-none" />
                    <span>Fixed #1 placement on the Founder Network directory feed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-lime-500 flex-none" />
                    <span>Automatic expiration after 7 full days (168 hours)</span>
                  </li>
                </ul>
              </div>

              {/* Action Tabs: Instant Pin / UPI QR */}
              <div className="space-y-2 font-mono">
                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  Payment Method
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("instant")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      paymentMode === "instant"
                        ? "border-[#ccff00] bg-lime-400/10 text-zinc-900 dark:text-[#ccff00]"
                        : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Instant Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("upi")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      paymentMode === "upi"
                        ? "border-[#ccff00] bg-lime-400/10 text-zinc-900 dark:text-[#ccff00]"
                        : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <QrCode className="w-3 h-3" />
                    <span>UPI QR Code</span>
                  </button>
                </div>

                {paymentMode === "instant" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border editorial-hairline text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                    <p className="leading-relaxed">
                      Instant activation via payment gateway. Your startup <strong>{startup.name}</strong> will immediately claim the #1 spotlight slot for 7 days.
                    </p>
                    <button
                      type="button"
                      disabled={loading || isQuotaFull}
                      onClick={handleExecutePin}
                      className="w-full py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed border border-black/20"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5 fill-black" />}
                      <span>{isQuotaFull ? "Quota Full (3/3 Active)" : `Pin for 1 Week (${priceInr})`}</span>
                    </button>
                  </div>
                )}

                {paymentMode === "upi" && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline space-y-3 text-xs text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>Razorpay Official Dynamic QR</span>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="p-2.5 rounded-2xl bg-white border border-zinc-200 shadow-sm relative min-w-[180px] min-h-[180px] flex items-center justify-center">
                        {loadingQr ? (
                          <div className="flex flex-col items-center gap-2 text-zinc-400 text-[11px] py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-[#ccff00]" />
                            <span>Generating Razorpay QR...</span>
                          </div>
                        ) : rzpQrImage ? (
                          <img
                            src={rzpQrImage}
                            alt="Razorpay Dynamic UPI QR"
                            className="w-44 h-44 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-[11px] text-rose-500 py-8">
                            Failed to load dynamic QR. Please use Instant Gateway.
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-[11px] text-zinc-500 leading-tight">
                        Scan &amp; pay <strong>{priceInr}</strong> with GPay, PhonePe, Paytm, CRED or any UPI app.
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Live detection active · Auto-pins upon payment</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={checkingPayment || !rzpQrId || isQuotaFull}
                      onClick={handleCheckQrPaid}
                      className="w-full py-2.5 rounded-xl bg-[#ccff00] text-black font-mono text-xs font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed border border-black/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      {checkingPayment ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking with Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Check Payment Status</span>
                        </>
                      )}
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
              Total: {priceInr} <span className="text-[10px] text-zinc-400 font-normal">($3.00 USD)</span>
            </span>
            <button
              type="button"
              disabled={loading || isQuotaFull}
              onClick={handleExecutePin}
              className="px-5 py-2 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-black/20"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5 fill-black" />}
              <span>{isQuotaFull ? "Quota Full" : "Pin to #1"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StartupPromoteModal
