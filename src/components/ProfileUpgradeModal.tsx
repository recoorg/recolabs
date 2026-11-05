"use client"

import * as React from "react"
import {
  Check,
  X,
  ArrowUpRight,
  Zap,
  Copy,
  Mail,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  Smartphone,
  Loader2,
} from "lucide-react"
import confetti from "canvas-confetti"
import QRCode from "qrcode"
import { Link } from "react-router-dom" 
import { networkApi } from "@/services/networkApi"
import { VerifiedBadge } from "@/components/VerifiedBadge"

interface ProfileUpgradeModalProps {
  username: string
  name: string
  onClose: () => void
  onUpgradeSuccess?: () => void
}

declare global {
  interface Window {
    Razorpay?: any
  }
}

export function ProfileUpgradeModal({
  username,
  name,
  onClose,
  onUpgradeSuccess,
}: ProfileUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<"lifetime" | "annual">("lifetime")
  const [paymentMethod, setPaymentMethod] = React.useState<"upi" | "card" | "invoice">("upi")
  const [copiedUpi, setCopiedUpi] = React.useState(false)
  const [upiRef, setUpiRef] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")

  const upiId = "devadibxr@okaxis"
  const adminEmail = "devadibxr@gmail.com"

  const plans = [
    {
      id: "lifetime" as const,
      name: "Lifetime Verified Pro",
      price: "$6",
      inr: "₹499",
      amountNum: 499,
      amountPaise: 49900,
      period: "one-time payment",
      popular: true,
      features: [
        "Permanent blue checkmark badge across all pages",
        "Top-tier placement in Founder Network & Directory",
        "Direct Contact & Hire Me trigger on profile",
        "Priority indexing in Google SEO crawl shell",
        "Lifetime access — never expires",
      ],
    },
    {
      id: "annual" as const,
      name: "Pro Founder Pass",
      price: "$12",
      inr: "₹999",
      amountNum: 999,
      amountPaise: 99900,
      period: "per year",
      popular: false,
      features: [
        "Everything in Lifetime Verified Pro",
        "1 Free Startup Pin to #1 Feed ($29 value)",
        "Featured Recruiter badge on posted jobs",
        "VIP Discord Guild role & private channel",
        "Social spotlight on @adibxr Twitter/X",
      ],
    },
  ]

  const activePlanObj = plans.find((p) => p.id === selectedPlan)!

  const upiPaymentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Reco Labs")}&am=${activePlanObj.amountNum}&cu=INR&tn=${encodeURIComponent(`VerifiedPro_${username}`)}`
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("")

  React.useEffect(() => {
    let active = true
    QRCode.toDataURL(upiPaymentUri, {
      width: 240,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" }
    }).then(url => {
      if (active) setQrCodeUrl(url)
    }).catch(err => {
      console.error("QR render error:", err)
      if (active) setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPaymentUri)}`)
    })
    return () => { active = false }
  }, [upiPaymentUri])

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  // Load Razorpay Script Dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Real Razorpay Checkout trigger
  const handleRazorpayPay = async () => {
    setLoading(true)
    setErrorMsg("")
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        throw new Error("Unable to initialize Razorpay checkout script. Please scan UPI QR code instead.")
      }

      const orderData = await networkApi.createRazorpayOrder(activePlanObj.amountPaise, {
        username,
        plan: selectedPlan,
      })

      const currentUser = networkApi.getCurrentUser()
      const options = {
        key: orderData.keyId || "rzp_live_TwVFw0ACQFDbKn",
        amount: activePlanObj.amountPaise,
        currency: "INR",
        name: "Reco Labs",
        description: `${activePlanObj.name} for @${username}`,
        image: "https://recolabs.in/logo-black.png",
        order_id: orderData.order?.id?.startsWith("order_") && !orderData.order?.id?.includes("mock") ? orderData.order.id : undefined,
        prefill: {
          name: name || username,
          email: currentUser?.email || "devadibxr@gmail.com",
          contact: currentUser?.phone || "",
        },
        notes: {
          username,
          plan: selectedPlan,
        },
        theme: {
          color: "#FA5D00",
        },
        handler: async function (response: any) {
          await finalizeActivation({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          })
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        setErrorMsg(response.error?.description || "Payment failed. Try UPI QR code below.")
        setLoading(false)
      })
      rzp.open()
    } catch (err: any) {
      console.warn("Razorpay standard note:", err)
      setErrorMsg(err.message || "Failed to start Razorpay. Please use direct UPI QR below.")
      setPaymentMethod("upi")
    } finally {
      setLoading(false)
    }
  }

  // Finalize activation on client & database
  const finalizeActivation = async (paymentMeta?: any) => {
    setLoading(true)
    setErrorMsg("")
    try {
      await networkApi.upgradeProfile(
        selectedPlan,
        "monthly",
        undefined,
        {
          method: paymentMethod,
          ref: upiRef || "verified_client",
          ...paymentMeta,
        }
      )
      confetti({ particleCount: 80, spread: 75, origin: { y: 0.5 } })
      setSubmitted(true)
      if (onUpgradeSuccess) onUpgradeSuccess()
    } catch (err: any) {
      console.warn("Upgrade verification error:", err)
      setErrorMsg(err.message || "Payment verification failed. Please complete transfer first.")
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
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Top Header */}
        <div className="p-5 sm:p-6 pb-3 border-b editorial-hairline flex items-start justify-between gap-4 flex-none bg-white dark:bg-[#111113]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 font-mono text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <VerifiedBadge size="xs" />
              <span>OFFICIAL BUILDER PASS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              Get Blue Tick · @{username}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full border editorial-hairline hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer flex-none mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Center Body (Guaranteed to fit on any screen) */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-left">
          {submitted ? (
            <div className="py-6 text-center font-mono space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <VerifiedBadge size="lg" />
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <span>BLUE TICK VERIFIED</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
                @{username} is Verified Pro!
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your official blue checkmark is active across directory listings, startup cards, and comments.
              </p>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md cursor-pointer"
                >
                  Done &amp; View Profile
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Plan Cards */}
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                {plans.map((p) => {
                  const isSelected = selectedPlan === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-[#FA5D00] bg-orange-500/[0.04] dark:bg-orange-500/[0.08] shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-400"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2 right-3 px-1.5 py-0.5 rounded-full bg-[#FA5D00] text-black text-[8px] font-black uppercase tracking-wider">
                          POPULAR
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100 truncate">{p.name}</span>
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-none ${
                              isSelected ? "border-[#FA5D00] bg-[#FA5D00]" : "border-zinc-400"
                            }`}
                          >
                            {isSelected && <Check className="w-2 h-2 text-black" />}
                          </div>
                        </div>

                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl font-black text-zinc-950 dark:text-zinc-50">{p.inr}</span>
                          <span className="text-[10px] text-zinc-400 font-bold">({p.price})</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 font-normal">{p.period}</div>

                        <ul className="mt-2 space-y-1 text-[10px] font-sans text-zinc-600 dark:text-zinc-400">
                          {p.features.slice(0, 3).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1 leading-tight">
                              <Check className="w-3 h-3 text-[#FA5D00] flex-none mt-0.5" />
                              <span className="line-clamp-2">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 font-mono">
                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  Payment Method
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === "upi"
                        ? "border-[#FA5D00] bg-orange-50 dark:bg-orange-950/40 text-[#FA5D00]"
                        : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <QrCode className="w-3 h-3" />
                    <span>UPI QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-[#FA5D00] bg-orange-50 dark:bg-orange-950/40 text-[#FA5D00]"
                        : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("invoice")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === "invoice"
                        ? "border-[#FA5D00] bg-orange-50 dark:bg-orange-950/40 text-[#FA5D00]"
                        : "editorial-hairline text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>Invoice</span>
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* UPI Box with Compact QR */}
                {paymentMethod === "upi" && (
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs flex-none">
                        <img
                          src={qrCodeUrl}
                          alt="UPI QR Code"
                          className="w-24 h-24 object-contain rounded-md"
                        />
                      </div>

                      <div className="space-y-1.5 text-left flex-1 min-w-0">
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Official UPI VPA</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{upiId}</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-[#FA5D00] hover:text-black font-bold text-[10px] transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            {copiedUpi ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedUpi ? "Copied" : "Copy UPI"}</span>
                          </button>

                          <a
                            href={upiPaymentUri}
                            className="px-2.5 py-1 rounded-full bg-[#FA5D00]/20 text-[#FA5D00] hover:bg-[#FA5D00] hover:text-black font-bold text-[10px] transition-colors inline-flex items-center gap-1"
                          >
                            <Smartphone className="w-3 h-3" />
                            <span>Open App</span>
                          </a>
                        </div>

                        <p className="text-[10px] text-zinc-500 leading-tight">
                          Pay <strong>{activePlanObj.inr}</strong> via GPay, PhonePe, Paytm.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t editorial-hairline flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="UPI UTR / Ref (optional)"
                        value={upiRef}
                        onChange={(e) => setUpiRef(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[11px]"
                      />
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => finalizeActivation({ upiRef })}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                      >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>I Paid</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Card / Razorpay Box */}
                {paymentMethod === "card" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline space-y-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Razorpay accepts Visa, Mastercard, RuPay, Netbanking, and Wallets.
                    </p>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRazorpayPay}
                      className="w-full py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>Pay {activePlanObj.inr} via Razorpay</span>
                    </button>
                  </div>
                )}

                {/* Invoice Box */}
                {paymentMethod === "invoice" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline space-y-1.5 text-xs">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Official invoice dispatched to your email for corporate reimbursement.
                    </p>
                    <a
                      href={`mailto:${adminEmail}?subject=Invoice%20Request%20-%20Verified%20Pro%20Upgrade%20@${encodeURIComponent(username)}&body=Hi%20Aditya%2C%0A%0APlease%20generate%20an%20invoice%20for%20Verified%20Pro%20upgrade%20(${activePlanObj.name}%20-%20${activePlanObj.inr})%20for%20builder%20@${encodeURIComponent(username)}.`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border editorial-hairline bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-[#FA5D00] font-bold text-[11px]"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Request Invoice</span>
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Fixed Bottom Footer (Always visible) */}
        {!submitted && (
          <div className="p-4 sm:px-6 bg-zinc-50/90 dark:bg-zinc-900/90 border-t editorial-hairline flex items-center justify-between gap-3 font-mono flex-none">
            <div>
              <span className="text-[9px] text-zinc-400 block uppercase">Total:</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                {activePlanObj.inr}{" "}
                <span className="text-[10px] font-mono font-normal text-zinc-400">({activePlanObj.price})</span>
              </span>
            </div>

            <div>
              {paymentMethod === "card" ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRazorpayPay}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Pay Now</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => finalizeActivation({ upiRef })}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>Activate Blue Tick</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileUpgradeModal
