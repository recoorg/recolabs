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
  Loader2,
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
import PixelCard from "@/components/ui/PixelCard"

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
  const [rzpQrId, setRzpQrId] = React.useState<string>("")
  const [rzpQrImage, setRzpQrImage] = React.useState<string>("")
  const [loadingQr, setLoadingQr] = React.useState(false)
  const [checkingPayment, setCheckingPayment] = React.useState(false)

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
      name: "Verified Builder Pass",
      badgeLabel: "Verified",
      monthly: { amountNum: 199, display: "₹199", period: "/month", savings: null },
      yearly: { amountNum: 1999, display: "₹1,999", period: "/year", savings: "Save ₹389 (16% OFF)" },
      features: [
        "Official 12-Scalloped Seal Blue Tick on your profile",
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

  // Create dynamic Razorpay QR via API
  React.useEffect(() => {
    if (finalPriceNum <= 0) return
    let isMounted = true
    setLoadingQr(true)
    networkApi
      .createRazorpayQr({
        amount: finalPriceNum,
        name: "Reco Labs",
        description: `${activePlan.name} (${billing})`,
        notes: {
          purpose: "upgrade",
          user_id: currentUser?.id,
          username: currentUser?.username,
          plan: selectedPlan,
          billing,
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
  }, [finalPriceNum, selectedPlan, billing, currentUser?.id])

  // Polling check for Razorpay QR Payment
  React.useEffect(() => {
    if (!rzpQrId || paySuccess || paymentMethod !== "upi") return
    const interval = setInterval(async () => {
      try {
        const check = await networkApi.checkRazorpayQr(rzpQrId)
        if (check.paid) {
          clearInterval(interval)
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
          setPaySuccess(true)
          setTimeout(() => {
            navigate(`/builder/${currentUser?.username || "profile"}`)
          }, 2500)
        }
      } catch (err) {
        // silent polling catch
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [rzpQrId, paySuccess, paymentMethod, currentUser?.username, navigate])

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
    if (finalPriceNum <= 0) {
      await handleConfirmZeroCostUpgrade()
      return
    }
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
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "",
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
            setPayError(upgradeErr.message || "Failed to verify payment with server. Please try again.")
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

  // Handle 100% Free Coupon Activation
  const handleConfirmZeroCostUpgrade = async () => {
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
        { method: "coupon_free", coupon_code: couponResult?.coupon?.code, amount: 0 }
      )
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
      setPaySuccess(true)
      setTimeout(() => {
        navigate(`/builder/${currentUser.username}`)
      }, 2200)
    } catch (err: any) {
      setPayError(err.message || "Failed to activate zero-cost upgrade.")
    } finally {
      setLoadingPay(false)
    }
  }

  // Handle manual Check Razorpay QR Payment
  const handleCheckQrPaid = async () => {
    if (!rzpQrId) return
    setCheckingPayment(true)
    setPayError("")
    try {
      const check = await networkApi.checkRazorpayQr(rzpQrId)
      if (check.paid) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
        setPaySuccess(true)
        setTimeout(() => {
          navigate(`/builder/${currentUser?.username || "profile"}`)
        }, 2200)
      } else {
        setPayError("Payment not detected yet. Please scan the Razorpay QR code and complete payment in your UPI app.")
      }
    } catch (err: any) {
      setPayError(err.message || "Failed to verify Razorpay QR payment.")
    } finally {
      setCheckingPayment(false)
    }
  }

  const isAlreadyVerified = currentUser?.is_verified || currentUser?.is_pro

  return (
    <div className="min-h-screen bg-white dark:bg-[#08080a] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-[#FA5D00] selection:text-black">
      {/* Top Navbar */}
      

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
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

        {/* Pricing Cards Grid with PixelCard */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Free Starter */}
          <PixelCard
            variant="default"
            colors={["#94a3b8", "#64748b", "#475569"]}
            glowColor="#94a3b8"
            gap={8}
            speed={25}
            className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-zinc-800/90 bg-[#0f0f13] text-zinc-100 shadow-2xl"
          >
            <div className="relative z-10">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2">
                Hobby / Explorer
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">
                Community Builder
              </h3>
              <p className="mt-2 text-xs text-zinc-400 font-sans leading-relaxed">
                Essential tools to showcase code, explore high-school hackathons, and connect with peers.
              </p>

              <div className="mt-6 font-mono">
                <span className="text-4xl font-extrabold text-white">₹0</span>
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
                  <div key={idx} className="flex items-start gap-2 text-zinc-200">
                    <Check className="w-4 h-4 text-zinc-400 flex-none mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800">
              <span className="block text-center py-2.5 rounded-full border border-zinc-700/80 bg-zinc-900/60 font-mono text-xs text-zinc-300 font-semibold">
                Current Default Tier
              </span>
            </div>
          </PixelCard>

          {/* Card 2: Verified Pro Builder (Highlighted) */}
          <div
            onClick={() => setSelectedPlan("pro")}
            className="relative h-full cursor-pointer"
          >
            {/* Pill Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-[#FA5D00] text-black font-mono text-[10px] font-extrabold uppercase tracking-widest shadow-md">
              MOST POPULAR FOR BUILDERS
            </div>

            <PixelCard
              variant="default"
              colors={["#FA5D00", "#FF8C42", "#ffa65c"]}
              glowColor="#FA5D00"
              gap={6}
              speed={30}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 text-zinc-100 shadow-2xl ${
                selectedPlan === "pro"
                  ? "bg-[#121216] border-2 border-[#FA5D00] ring-4 ring-orange-500/20"
                  : "bg-[#0f0f13] border border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-xs uppercase tracking-wider text-[#FA5D00] font-bold">
                    Indie & Solo Founders
                  </div>
                  <VerifiedBadge size="md" />
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                  <span>Verified Pro</span>
                </h3>
                <p className="mt-2 text-xs text-zinc-300 font-sans leading-relaxed">
                  Everything you need to prove authentic credibility, earn trust, and get your prototypes discovered.
                </p>

                <div className="mt-6 font-mono flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    {billing === "monthly" ? pricing.pro.monthly.display : pricing.pro.yearly.display}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {billing === "monthly" ? pricing.pro.monthly.period : pricing.pro.yearly.period}
                  </span>
                  {billing === "yearly" && pricing.pro.yearly.savings && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full ml-auto">
                      {pricing.pro.yearly.savings}
                    </span>
                  )}
                </div>

                <div className="mt-8 space-y-3 font-mono text-xs">
                  {pricing.pro.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-zinc-200">
                      <Check className="w-4 h-4 text-[#FA5D00] flex-none mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800">
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
            </PixelCard>
          </div>

          {/* Card 3: Pro Founder Pass */}
          <div
            onClick={() => setSelectedPlan("founder")}
            className="relative h-full cursor-pointer"
          >
            <PixelCard
              variant="yellow"
              colors={["#fbbf24", "#f59e0b", "#d97706"]}
              glowColor="#f59e0b"
              gap={6}
              speed={30}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 text-zinc-100 shadow-2xl ${
                selectedPlan === "founder"
                  ? "bg-[#121216] border-2 border-amber-500 ring-4 ring-amber-500/20"
                  : "bg-[#0f0f13] border border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" />
                    <span>VIP Collective</span>
                  </div>
                  <VerifiedBadge size="md" label="Pro Founder" />
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Founder Pass
                </h3>
                <p className="mt-2 text-xs text-zinc-300 font-sans leading-relaxed">
                  Maximum launch exposure, unlimited product pinning, hardware lab grants, and investor access.
                </p>

                <div className="mt-6 font-mono flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    {billing === "monthly" ? pricing.founder.monthly.display : pricing.founder.yearly.display}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {billing === "monthly" ? pricing.founder.monthly.period : pricing.founder.yearly.period}
                  </span>
                  {billing === "yearly" && pricing.founder.yearly.savings && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full ml-auto">
                      {pricing.founder.yearly.savings}
                    </span>
                  )}
                </div>

                <div className="mt-8 space-y-3 font-mono text-xs">
                  {pricing.founder.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-zinc-200">
                      <Check className="w-4 h-4 text-amber-400 flex-none mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800">
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
            </PixelCard>
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
                {/* Billing Switcher in Modal */}
                <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBilling("monthly")}
                    className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                      billing === "monthly" ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs" : "text-zinc-500"
                    }`}
                  >
                    Monthly (₹{activePlan.monthly.amountNum})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilling("yearly")}
                    className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      billing === "yearly" ? "bg-[#FA5D00] text-black shadow-xs font-bold" : "text-zinc-500"
                    }`}
                  >
                    <span>Yearly (₹{activePlan.yearly.amountNum})</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-black text-[#FA5D00] text-[9px] font-black uppercase">
                      SAVE 16%
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <div>
                    <div className="font-serif text-xl font-bold text-zinc-950 dark:text-zinc-50">
                      {activePlan.name}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500">
                      {billing === "yearly" ? "Billed annually (₹166/month equivalent)" : "Billed monthly"}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Total payable</div>
                    <div className="text-2xl font-extrabold text-[#FA5D00]">
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

          {/* Free Coupon 100% Zero-Cost Activation */}
          {finalPriceNum <= 0 ? (
            <div className="space-y-4 my-2">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Check className="w-4 h-4" />
                  <span>100% Promo Code Applied!</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  Your coupon covered the entire cost. Total payable is ₹0. No payment or bank card required!
                </p>
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
                  <div className="text-base font-bold text-emerald-500">Verified Badge Activated!</div>
                  <div className="text-xs text-zinc-400">Redirecting to your builder profile...</div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmZeroCostUpgrade}
                  disabled={loadingPay}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>{loadingPay ? "Activating Verified Badge..." : "Claim Verified Badge (₹0 Free)"}</span>
                </button>
              )}
            </div>
          ) : (
            <>
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

          {/* Checkout Screen 2: Official Razorpay Dynamic QR via API */}
          {paymentMethod === "upi" && (
            <div className="space-y-4 text-center font-mono">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[11px] font-bold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official Razorpay Dynamic QR API</span>
                </div>

                {/* Razorpay Dynamic QR Image */}
                <div className="p-3.5 rounded-2xl bg-white shadow-md border border-zinc-200 relative min-w-[220px] min-h-[220px] flex items-center justify-center">
                  {loadingQr ? (
                    <div className="flex flex-col items-center gap-2 text-zinc-400 text-xs py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FA5D00]" />
                      <span>Generating Razorpay QR...</span>
                    </div>
                  ) : rzpQrImage ? (
                    <img
                      src={rzpQrImage}
                      alt="Razorpay Dynamic UPI QR"
                      className="w-56 h-56 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="text-xs text-rose-500 py-10">
                      Failed to load dynamic QR. Please use Instant Online gateway.
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="font-bold text-sm text-[#FA5D00]">₹{finalPriceNum}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Scan with Google Pay, PhonePe, Paytm, CRED or any UPI app
                  </div>
                </div>

                {/* Live verification status indicator */}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Listening for Razorpay payment... Auto-activates on transfer</span>
                </div>
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
                  <div className="text-base font-bold text-emerald-500">Payment Confirmed &amp; Blue Tick Activated!</div>
                  <div className="text-xs text-zinc-400">Redirecting to your builder profile...</div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckQrPaid}
                  disabled={checkingPayment || !rzpQrId}
                  className="w-full py-4 rounded-2xl bg-[#FA5D00] text-black font-mono text-sm font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {checkingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking with Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Check Payment Status</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
            </>
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
