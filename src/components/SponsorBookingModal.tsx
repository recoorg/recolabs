"use client"

import * as React from "react"
import { Heart, Check, X, ArrowUpRight, ShieldCheck, Mail, Sparkles, Building, Globe } from "lucide-react"
import confetti from "canvas-confetti"

interface SponsorBookingModalProps {
  isOpen?: boolean
  initialTierKey?: string
  onClose: () => void
}

export function SponsorBookingModal({ isOpen = true, initialTierKey = "home_sponsor_1", onClose }: SponsorBookingModalProps) {
  if (!isOpen) return null
  const [tier, setTier] = React.useState(initialTierKey)
  const [companyName, setCompanyName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const sponsorEmail = "devadibxr@gmail.com"

  const tiers = [
    {
      key: "home_sponsor_1",
      name: "Tier 01 · Founding Partner",
      price: "$500 / month",
      desc: "Permanent homepage brand placement, logo on all 190+ project pages, dedicated Discord role, and monthly technical newsletter feature.",
    },
    {
      key: "home_sponsor_2",
      name: "Tier 02 · Hardware Lab Sponsor",
      price: "$250 / month",
      desc: "Branding on microcontroller kits (ESP32/RP2040), PCB fabrication grants, and hands-on beginner engineering workshops.",
    },
    {
      key: "home_sponsor_3",
      name: "Tier 03 · Cloud & Compute Sponsor",
      price: "$350 / month",
      desc: "Branding across developer toolkits, server deployment grants, and database infrastructure credits for young hackers.",
    },
    {
      key: "home_sponsor_4",
      name: "Tier 04 · Community Sponsor",
      price: "$150 / month",
      desc: "Direct sponsorship of high school hackathon prize bounties, student shipping allowances, and guild bounties.",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } })
    setSubmitted(true)

    const selectedTierObj = tiers.find((t) => t.key === tier) || tiers[0]
    const subject = encodeURIComponent(`[Sponsorship Inquiry] ${companyName} — ${selectedTierObj.name}`)
    const body = encodeURIComponent(
      `Hi Aditya,\n\nWe would like to book a sponsorship slot with Reco Labs:\n\n` +
      `Company / Brand: ${companyName}\n` +
      `Website: ${website}\n` +
      `Contact Email: ${email}\n` +
      `Selected Package: ${selectedTierObj.name} (${selectedTierObj.price})\n` +
      `Additional Notes / Assets: ${message}\n\n` +
      `Please send over the sponsorship agreement and invoice details.`
    )
    window.open(`mailto:${sponsorEmail}?subject=${subject}&body=${body}`, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-sans">
      <div className="relative max-w-2xl w-full my-auto rounded-3xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-[#FA5D00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#FA5D00] border border-orange-200 dark:border-orange-900/60 font-mono text-xs font-bold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 fill-[#FA5D00]" />
            <span>PARTNER WITH RECO LABS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            Sponsor builder hardware &amp; grants<span className="text-[#FA5D00]">.</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Reach thousands of young makers, teenage engineers, and university founders. 100% of proceeds go directly to student hardware rigs and prize bounties.
          </p>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-serif text-2xl text-zinc-950 dark:text-zinc-50 font-bold">
              Sponsorship Inquiry Sent!
            </h3>
            <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              We opened your email client to send the details directly to <strong>{sponsorEmail}</strong>. We reply with invoice details and asset specs within 4 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold hover:opacity-85 transition-opacity cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Tier Selector Carousel / Grid */}
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Select Sponsorship Tier:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tiers.map((t) => (
                  <div
                    key={t.key}
                    onClick={() => setTier(t.key)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      tier === t.key
                        ? "border-[#FA5D00] bg-orange-50/50 dark:bg-orange-950/30 shadow-xs"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-zinc-950 dark:text-zinc-50 truncate">
                          {t.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#FA5D00] block mb-1">
                        {t.price}
                      </span>
                      <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields: Company, Email, URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-mono text-[11px] font-bold text-zinc-500 uppercase mb-1">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Supabase, PCBWay, Neon"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-zinc-500 uppercase mb-1">
                  Business Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sponsor@company.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] font-bold text-zinc-500 uppercase mb-1">
                  Company Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-zinc-500 uppercase mb-1">
                  Message / Goal (Optional)
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Sponsoring hackathons with free API credits"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#FA5D00]"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#FA5D00] hover:bg-[#e05300] active:scale-98 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Request Sponsorship Agreement &amp; Invoice</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="pt-2 text-center font-mono text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Invoices provided with tax documentation. Custom enterprise tier available upon request.</span>
            </div>

          </form>
        )}

      </div>
    </div>
  )
}

export default SponsorBookingModal
