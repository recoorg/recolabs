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
  Sparkles,
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
  const [rzpQrId, setRzpQrId] = React.useState<string>("")
  const [rzpQrImage, setRzpQrImage] = React.useState<string>("")
  const [loadingQr, setLoadingQr] = React.useState(false)
  const [checkingPayment, setCheckingPayment] = React.useState(false)

  // Generate dynamic Razorpay QR via API
  React.useEffect(() => {
    let isMounted = true
    setLoadingQr(true)
    const currentUser = networkApi.getCurrentUser()
    networkApi
      .createRazorpayQr({
        amount: activePlanObj.amountNum,
        name: "Reco Labs",
        description: activePlanObj.name,
        notes: {
          purpose: "upgrade",
          username,
          user_id: currentUser?.id,
          plan: selectedPlan,
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
  }, [selectedPlan, username, activePlanObj.amountNum, activePlanObj.name])

  // Polling check for Razorpay QR Payment
  React.useEffect(() => {
    if (!rzpQrId || submitted || paymentMethod !== "upi") return
    const interval = setInterval(async () => {
      try {
        const check = await networkApi.checkRazorpayQr(rzpQrId)
        if (check.paid) {
          clearInterval(interval)
          finalizeActivation({ qr_id: rzpQrId, payment_id: check.payment?.id })
        }
      } catch (err) {
        // silent polling catch
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [rzpQrId, submitted, paymentMethod])

  const handleCheckQrPaid = async () => {
    if (!rzpQrId) return
    setCheckingPayment(true)
    setErrorMsg("")
    try {
      const check = await networkApi.checkRazorpayQr(rzpQrId)
      if (check.paid) {
        finalizeActivation({ qr_id: rzpQrId, payment_id: check.payment?.id })
      } else {
        setErrorMsg("Payment not detected yet. Please scan the Razorpay QR code and complete payment in your UPI app.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify Razorpay QR payment.")
    } finally {
      setCheckingPayment(false)
    }
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
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "",
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

                {/* UPI Box with Official Razorpay Dynamic QR */}
                {paymentMethod === "upi" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border editorial-hairline space-y-3 text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>Razorpay Official Dynamic QR</span>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="p-2 rounded-2xl bg-white border border-zinc-200 shadow-sm relative min-w-[150px] min-h-[150px] flex items-center justify-center">
                        {loadingQr ? (
                          <div className="flex flex-col items-center gap-1.5 text-zinc-400 text-[10px] py-6">
                            <Loader2 className="w-4 h-4 animate-spin text-[#FA5D00]" />
                            <span>Generating QR...</span>
                          </div>
                        ) : rzpQrImage ? (
                          <img
                            src={rzpQrImage}
                            alt="Razorpay Dynamic UPI QR"
                            className="w-36 h-36 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-[10px] text-rose-500 py-6">
                            Failed to generate QR. Please use Cards tab.
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                        Scan &amp; pay <strong>{activePlanObj.inr}</strong> with GPay, PhonePe, Paytm or any UPI app.
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Live detection active · Auto-activates on payment</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={checkingPayment || !rzpQrId}
                      onClick={handleCheckQrPaid}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
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
