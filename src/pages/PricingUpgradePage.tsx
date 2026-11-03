import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import confetti from "canvas-confetti"
import QRCode from "qrcode"
import {
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Copy,
  ExternalLink,
  Tag,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  Crown,
  Flame,
  Star,
  Users,
  X
} from "lucide-react"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { networkApi, type UserProfile, type CouponValidationResult } from "@/services/networkApi"
import { usePageMeta } from "@/hooks/usePageMeta"

export function PricingUpgradePage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null)
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = React.useState<"pro" | "founder">("pro")
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false)

  // Coupon State
  const [couponInput, setCouponInput] = React.useState("")
  const [validatingCoupon, setValidatingCoupon] = React.useState(false)
  const [couponResult, setCouponResult] = React.useState<CouponValidationResult | null>(null)
  const [couponError, setCouponError] = React.useState("")

  // Payment state
  const [paymentMethod, setPaymentMethod] = React.useState<"razorpay" | "upi">("razorpay")
  const [loadingPay, setLoadingPay] = React.useState(false)
  const [payError, setPayError] = React.useState("")
  const [paySuccess, setPaySuccess] = React.useState(false)
  const [copiedUpi, setCopiedUpi] = React.useState(false)
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("")

  const upiId = "devadibxr@okaxis"

  usePageMeta({
    title: "Pricing & Verified Pro Upgrade | Reco Labs",
    description: "Get the official Blue Tick verification, pin your startups to #1, and join the verified builder collective.",
  })

  // Load User on Mount
  React.useEffect(() => {
    const user = networkApi.getCurrentUser()
    setCurrentUser(user)
    if (networkApi.getToken()) {
      networkApi.getProfile().then((u) => {
        if (u) setCurrentUser(u)
      }).catch(() => {})
    }
  }, [])

  // Pricing Matrix
  const pricing = {
    pro: {
      name: "Verified Pro Builder",
      badgeLabel: "Verified Pro",
      monthly: { amountNum: 199, display: "₹199", period: "/month", savings: null },
      yearly: { amountNum: 1999, display: "₹1,999", period: "/year", savings: "Save ₹389 (16% OFF)" },
      features: [
        "Official 12-Scalloped Seal Blue Tick on your profile",
        "1 Free Startup / Project Spotlight Pin to #1 Feed monthly",
        "Highlighted ranking in Founder Network 3D avatar cloud",
        "Verified badge on all your project showcase cards",
        "Direct verified builder messaging badge",
        "Access to Verified Founders Directory",
      ],
    },
    founder: {
      name: "Pro Founder Pass",
      badgeLabel: "Pro Founder",
      monthly: { amountNum: 499, display: "₹499", period: "/month", savings: null },
      yearly: { amountNum: 4999, display: "₹4,999", period: "/year", savings: "Save ₹989 (17% OFF)" },
      features: [
        "Exclusive Pro Founder Seal (Gold/Blue badge)",
        "Unlimited Startup & Project Pinning to #1 on Feed",
        "Top Priority Listing for your open Jobs & Bounties",
        "Direct Investor & Mentor Introductions",
        "Private VIP Discord Guild role & alpha channel",
        "Hardware Lab grant and compute credit priority",
        "Feature highlight on @adibxr Twitter/X network",
      ],
    },
  }

  const activePlan = pricing[selectedPlan]
  const basePriceNum = billing === "monthly" ? activePlan.monthly.amountNum : activePlan.yearly.amountNum
  
  // Compute final discounted price
  let discountNum = 0
  if (couponResult?.valid && couponResult.coupon) {
    if (couponResult.coupon.discount_type === "percentage") {
      discountNum = Math.round((basePriceNum * couponResult.coupon.discount_value) / 100)
    } else {
      discountNum = Math.min(basePriceNum, Number(couponResult.coupon.discount_value))
    }
  }
  const finalPriceNum = Math.max(0, basePriceNum - discountNum)

  // Generate UPI URI & QR Code client-side
  const usernameForNote = currentUser?.username || "builder"
  const upiPaymentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Reco Labs")}&am=${finalPriceNum}&cu=INR&tn=${encodeURIComponent(`Reco_${selectedPlan}_${usernameForNote}`)}`

  React.useEffect(() => {
    let isMounted = true
    QRCode.toDataURL(upiPaymentUri, {
      width: 260,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url)
      })
      .catch((err) => {
        console.error("QR render error:", err)
        if (isMounted) {
          setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(upiPaymentUri)}`)
        }
      })
    return () => {
      isMounted = false
    }
  }, [upiPaymentUri])

  // Handle Coupon Validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setValidatingCoupon(true)
    setCouponError("")
    setCouponResult(null)
    try {
      const res = await networkApi.validateCoupon(code, basePriceNum)
      if (res.valid) {
        setCouponResult(res)
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } })
      } else {
        setCouponError(res.error || "Invalid coupon code.")
      }
    } catch (err: any) {
      setCouponError(err.message || "Failed to validate coupon code.")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponResult(null)
    setCouponInput("")
    setCouponError("")
  }

  // Load Razorpay Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
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

  // Handle Online Payment (Razorpay)
  const handleRazorpayCheckout = async () => {
    if (!currentUser) {
      navigate(`/network?auth=login&redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setLoadingPay(true)
    setPayError("")
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout. Please use the UPI QR code below.")
      }

      const amountPaise = finalPriceNum * 100
      const orderData = await networkApi.createRazorpayOrder(amountPaise, {
        user_id: currentUser.id,
        username: currentUser.username,
        plan: selectedPlan,
        billing,
        coupon_code: couponResult?.valid ? couponResult.coupon?.code : undefined,
      })

      const options = {
        key: orderData.keyId || "rzp_live_default",
        amount: amountPaise,
        currency: "INR",
        name: "Reco Labs",
        description: `${activePlan.name} (${billing}) for @${currentUser.username}`,
        image: "https://recolabs.in/logo-black.png",
        order_id:
          orderData.order?.id?.startsWith("order_") && !orderData.order?.id?.includes("mock")
            ? orderData.order.id
            : undefined,
        prefill: {
          name: currentUser.name || currentUser.username,
          email: currentUser.email || "builder@recolabs.in",
          contact: currentUser.phone || "",
        },
        notes: {
          user_id: currentUser.id,
          username: currentUser.username,
          plan: selectedPlan,
          billing,
          coupon_code: couponResult?.valid ? couponResult.coupon?.code : undefined,
        },
        theme: {
          color: "#FA5D00",
        },
        handler: async (response: any) => {
          try {
            await networkApi.upgradeProfile(
              selectedPlan,
              billing,
              couponResult?.valid ? couponResult.coupon?.code : undefined,
              response
            )
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
            setPaySuccess(true)
            setTimeout(() => {
              navigate(`/builder/${currentUser.username}`)
            }, 2500)
          } catch (upgradeErr: any) {
            console.error("Post-payment upgrade sync error:", upgradeErr)
            setPaySuccess(true)
            setTimeout(() => {
              navigate(`/builder/${currentUser.username}`)
            }, 3000)
          }
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", (resp: any) => {
        setPayError(resp.error?.description || "Payment failed. Please try again or use direct UPI QR.")
      })
      rzp.open()
    } catch (err: any) {
      setPayError(err.message || "Failed to initiate payment.")
    } finally {
      setLoadingPay(false)
    }
  }

  // Handle UPI Confirmation
  const handleConfirmUpiPaid = async () => {
    if (!currentUser) {
      navigate(`/network?auth=login&redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setLoadingPay(true)
    setPayError("")
    try {
      await networkApi.upgradeProfile(
        selectedPlan,
        billing,
        couponResult?.valid ? couponResult.coupon?.code : undefined,
        { method: "upi_qr", upiId, amount: finalPriceNum }
      )
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
      setPaySuccess(true)
      setTimeout(() => {
        navigate(`/builder/${currentUser.username}`)
      }, 2500)
    } catch (err: any) {
      setPayError(err.message || "Failed to confirm upgrade. Please reach out to @adibxr on Twitter/X.")
    } finally {
      setLoadingPay(false)
    }
  }

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const isAlreadyVerified = currentUser?.is_verified || currentUser?.is_pro

  return (
    <div className="min-h-screen bg-white dark:bg-[#08080a] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-[#FA5D00] selection:text-black">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#08080a]/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-[#FA5D00] transition-colors">
              Reco Labs
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Pricing
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
            <Link to="/projects" className="hidden sm:inline text-zinc-600 dark:text-zinc-400 hover:text-[#FA5D00] transition-colors">
              Projects
            </Link>
            <Link to="/network" className="hidden sm:inline text-zinc-600 dark:text-zinc-400 hover:text-[#FA5D00] transition-colors">
              Founder Network
            </Link>
            <Link to="/jobs" className="hidden sm:inline text-zinc-600 dark:text-zinc-400 hover:text-[#FA5D00] transition-colors">
              Jobs
            </Link>

            {currentUser ? (
              <Link
                to={`/builder/${currentUser.username}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#FA5D00] text-black font-bold flex items-center justify-center text-[10px]">
                    {currentUser.name?.charAt(0) || "B"}
                  </div>
                )}
                <span className="font-bold">@{currentUser.username}</span>
                {currentUser.is_verified && <VerifiedBadge size="xs" />}
              </Link>
            ) : (
              <Link
                to="/network"
                className="px-3.5 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Already Verified Banner */}
        {isAlreadyVerified && (
          <div className="mb-10 p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <VerifiedBadge size="lg" />
              <div>
                <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span>Your profile is currently Verified Pro!</span>
                </h3>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Plan: <span className="text-[#FA5D00] font-bold uppercase">{currentUser?.plan || "Pro"}</span>
                  {currentUser?.plan_billing && ` · ${currentUser.plan_billing} billing`}
                  {currentUser?.subscription_end && (
                    <span> · Active until {new Date(currentUser.subscription_end).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/builder/${currentUser?.username}`}
                className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono text-xs font-bold hover:opacity-90 transition-opacity"
              >
                View Live Profile ↗
              </Link>
              <Link
                to="/network"
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 font-mono text-xs font-semibold hover:border-[#FA5D00] transition-colors"
              >
                Pin Startup #1
              </Link>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#FA5D00] border border-orange-200 dark:border-orange-900/60 font-mono text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 fill-[#FA5D00]" />
            <span>AUTHENTIC BUILDER CREDIBILITY</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.1]">
            Build in Public. <br />
            <span className="font-bold underline decoration-[#FA5D00] decoration-wavy decoration-2">
              Get Verified & Boosted.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Stand out in the global developer guild. Claim your official 12-scalloped seal Blue Tick, pin your startups to #1 on the Founder Network, and gain immediate founder authority.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs font-bold shadow-inner">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                billing === "monthly"
                  ? "bg-white dark:bg-[#18181b] text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                billing === "yearly"
                  ? "bg-[#FA5D00] text-black shadow-md font-bold"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span>Yearly Pass</span>
              <span className="px-2 py-0.5 rounded-full bg-black text-[#FA5D00] text-[10px] font-mono tracking-tight uppercase font-extrabold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Free Starter */}
          <div className="rounded-3xl p-6 sm:p-8 bg-zinc-50 dark:bg-[#0f0f12] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2">
                Hobby / Explorer
              </div>
              <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Community Builder
              </h3>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                Essential tools to showcase code, explore high-school hackathons, and connect with peers.
              </p>

              <div className="mt-6 font-mono">
                <span className="text-4xl font-extrabold text-zinc-950 dark:text-zinc-50">₹0</span>
                <span className="text-xs text-zinc-400 ml-1">/forever</span>
              </div>

              <div className="mt-8 space-y-3 font-mono text-xs">
                {[
                  "Public Builder Profile & custom URL",
                  "Submit startups to Founder Network",
                  "Browse 190+ open-source tools & rigs",
                  "Join hackathons & view student jobs",
                  "Community Discord member role",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-zinc-400 flex-none mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <span className="block text-center py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-400">
                Current Default Tier
              </span>
            </div>
          </div>

          {/* Card 2: Verified Pro Builder (Highlighted) */}
          <div
            onClick={() => setSelectedPlan("pro")}
            className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
              selectedPlan === "pro"
                ? "bg-white dark:bg-[#121216] border-2 border-[#FA5D00] shadow-2xl scale-[1.02] ring-4 ring-orange-500/10"
                : "bg-zinc-50/80 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
            }`}
          >
            {/* Pill Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FA5D00] text-black font-mono text-[10px] font-extrabold uppercase tracking-widest shadow-md">
              MOST POPULAR FOR BUILDERS
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-xs uppercase tracking-wider text-[#FA5D00] font-bold">
                  Indie & Solo Founders
                </div>
                <VerifiedBadge size="md" />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>Verified Pro</span>
              </h3>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                Everything you need to prove authentic credibility, earn trust, and get your prototypes discovered.
              </p>

              <div className="mt-6 font-mono flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-zinc-950 dark:text-zinc-50">
                  {billing === "monthly" ? pricing.pro.monthly.display : pricing.pro.yearly.display}
                </span>
                <span className="text-xs text-zinc-400">
                  {billing === "monthly" ? pricing.pro.monthly.period : pricing.pro.yearly.period}
                </span>
                {billing === "yearly" && pricing.pro.yearly.savings && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">
                    {pricing.pro.yearly.savings}
                  </span>
                )}
              </div>

              <div className="mt-8 space-y-3 font-mono text-xs">
                {pricing.pro.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-zinc-800 dark:text-zinc-200">
                    <Check className="w-4 h-4 text-[#FA5D00] flex-none mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPlan("pro")
                  setShowCheckoutModal(true)
                }}
                className="w-full py-3.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-[#FA5D00] text-black hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Get Verified Pro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Pro Founder Pass */}
          <div
            onClick={() => setSelectedPlan("founder")}
            className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
              selectedPlan === "founder"
                ? "bg-white dark:bg-[#121216] border-2 border-amber-500 shadow-2xl scale-[1.02] ring-4 ring-amber-500/10"
                : "bg-zinc-50/80 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-xs uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP Collective</span>
                </div>
                <VerifiedBadge size="md" label="Pro Founder" />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Founder Pass
              </h3>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                Maximum launch exposure, unlimited product pinning, hardware lab grants, and investor access.
              </p>

              <div className="mt-6 font-mono flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-zinc-950 dark:text-zinc-50">
                  {billing === "monthly" ? pricing.founder.monthly.display : pricing.founder.yearly.display}
                </span>
                <span className="text-xs text-zinc-400">
                  {billing === "monthly" ? pricing.founder.monthly.period : pricing.founder.yearly.period}
                </span>
                {billing === "yearly" && pricing.founder.yearly.savings && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">
                    {pricing.founder.yearly.savings}
                  </span>
                )}
              </div>

              <div className="mt-8 space-y-3 font-mono text-xs">
                {pricing.founder.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-zinc-800 dark:text-zinc-200">
                    <Check className="w-4 h-4 text-amber-500 flex-none mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPlan("founder")
                  setShowCheckoutModal(true)
                }}
                className="w-full py-3.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-black" />
                <span>Get Founder Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Payment & Checkout Modal (Zero Scroll Required) */}
        {showCheckoutModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
            onClick={() => setShowCheckoutModal(false)}
          >
            <div
              className="relative max-w-lg w-full max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 pb-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-none">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#FA5D00] uppercase font-bold tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>STEP 2 · INSTANT CHECKOUT</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                    {activePlan.name} ({billing})
                  </h3>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable if small phone) */}
              <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
            <div>
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                Step 2 · Confirm & Checkout
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 mt-1">
                {activePlan.name} ({billing})
              </h2>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-zinc-400">Total payable</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#FA5D00]">
                ₹{finalPriceNum}
              </div>
              {discountNum > 0 && (
                <div className="text-[10px] text-emerald-500 font-bold line-through">
                  ₹{basePriceNum}
                </div>
              )}
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="my-6 p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <Tag className="w-3.5 h-3.5 text-[#FA5D00]" />
                <span>Have a discount coupon?</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-400">
                Try <code className="text-[#FA5D00] font-bold">BUILDER50</code> or <code className="text-[#FA5D00] font-bold">RECO100</code>
              </span>
            </div>

            {couponResult?.valid && couponResult.coupon ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>
                    <strong>{couponResult.coupon.code}</strong> applied — Saved ₹{discountNum}!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-zinc-400 hover:text-rose-500 cursor-pointer font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. BUILDER50)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs text-zinc-900 dark:text-zinc-100 uppercase focus:outline-none focus:border-[#FA5D00]"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponInput.trim()}
                  className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono text-xs font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {validatingCoupon ? "Checking..." : "Apply Code"}
                </button>
              </form>
            )}

            {couponError && (
              <p className="mt-2 text-xs font-mono text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{couponError}</span>
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => setPaymentMethod("razorpay")}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                paymentMethod === "razorpay"
                  ? "bg-white dark:bg-[#18181b] border-[#FA5D00] text-[#FA5D00] shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400"
              }`}
            >
              <div className="font-sans font-bold text-sm">Instant Online</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Cards / UPI / NetBanking</div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                paymentMethod === "upi"
                  ? "bg-white dark:bg-[#18181b] border-[#FA5D00] text-[#FA5D00] shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400"
              }`}
            >
              <div className="font-sans font-bold text-sm">Scan UPI QR</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">GPay / PhonePe / Paytm</div>
            </button>
          </div>

          {/* Checkout Screen 1: Razorpay Checkout */}
          {paymentMethod === "razorpay" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 space-y-2">
                <div className="flex justify-between">
                  <span>Selected Tier:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{activePlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing Frequency:</span>
                  <span className="capitalize font-bold text-zinc-900 dark:text-zinc-100">{billing}</span>
                </div>
                {discountNum > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Discount:</span>
                    <span>-₹{discountNum}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2 text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  <span>Total Amount:</span>
                  <span className="text-[#FA5D00]">₹{finalPriceNum}</span>
                </div>
              </div>

              {payError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" />
                  <span>{payError}</span>
                </div>
              )}

              {paySuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center font-mono space-y-2">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="text-base font-bold text-emerald-500">Upgrade Successful!</div>
                  <div className="text-xs text-zinc-400">Your Blue Tick is active. Redirecting to your builder profile...</div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRazorpayCheckout}
                  disabled={loadingPay}
                  className="w-full py-4 rounded-2xl bg-[#FA5D00] text-black font-mono text-sm font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>{loadingPay ? "Initializing Secure Gateway..." : `Proceed to Pay ₹${finalPriceNum}`}</span>
                </button>
              )}
            </div>
          )}

          {/* Checkout Screen 2: Direct Dynamic UPI QR */}
          {paymentMethod === "upi" && (
            <div className="space-y-4 text-center">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
                <div className="font-mono text-xs text-zinc-400 mb-3">
                  Scan with GPay, PhonePe, Paytm, or CRED
                </div>

                {/* Instant QR Image rendered client-side */}
                <div className="p-3 rounded-2xl bg-white shadow-md border border-zinc-200">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="UPI Payment QR" className="w-52 h-52 object-contain" />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center font-mono text-xs text-zinc-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div className="mt-4 font-mono text-xs text-zinc-500 flex items-center gap-2">
                  <span>UPI ID:</span>
                  <code className="text-[#FA5D00] font-bold">{upiId}</code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedUpi && <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>}
                </div>

                {/* Mobile Direct Pay Deep Link */}
                <a
                  href={upiPaymentUri}
                  className="mt-3 sm:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono text-xs font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in UPI App</span>
                </a>
              </div>

              {payError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mono text-left flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-none" />
                  <span>{payError}</span>
                </div>
              )}

              {paySuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center font-mono space-y-2">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="text-base font-bold text-emerald-500">Verified Pro Activated!</div>
                  <div className="text-xs text-zinc-400">Redirecting to your builder profile...</div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmUpiPaid}
                  disabled={loadingPay}
                  className="w-full py-4 rounded-2xl bg-[#FA5D00] text-black font-mono text-sm font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{loadingPay ? "Activating Profile..." : "I Have Paid / Activate My Blue Tick"}</span>
                </button>
              )}
            </div>
          )}
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-2xl mx-auto space-y-6">
          <h3 className="font-serif text-2xl font-bold text-center text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h3>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                How does the Blue Tick verification work?
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                Upon payment confirmation, your Reco Labs user record is permanently stamped with verified status. The official 12-scalloped seal badge renders instantly across your profile, network avatar cloud, and any project or startup you post.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Can I pin my startup to #1 on the Founder Network?
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                Yes! Both Verified Pro and Founder Pass members enjoy complimentary project spotlight pinning. You can pin your project directly from the startup card or modal with 0 extra charges.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                What if I pay using UPI QR code?
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                The dynamic UPI QR code encodes your exact builder reference. When you complete the transfer and tap "I Have Paid", your account is activated immediately. The webhook also verifies incoming transfers automatically.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
