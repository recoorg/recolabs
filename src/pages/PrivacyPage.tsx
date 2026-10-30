"use client"

import * as React from "react"
import { Shield, Lock, Eye, RefreshCw, Mail, MessageSquare, ArrowUpRight } from "lucide-react"
import { SEO } from "@/components/SEO"

export function PrivacyPage() {
  return (
    <div className="relative w-full pt-32 sm:pt-36 pb-24 px-6 sm:px-8 bg-transparent overflow-hidden">
      <SEO
        title="Privacy Policy · Reco Labs"
        description="Privacy policy and data protection terms for Reco Labs. Learn how we handle your account, OAuth authentication, and public startup listings."
      />

      {/* Seamless ambient blurred glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-orange-500/[0.02] dark:bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto pb-10 border-b editorial-hairline">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            LEGAL & TRANSPARENCY
          </span>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl lg:text-7xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            Privacy Policy<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-mono text-xs text-zinc-500 uppercase tracking-wider">
            LAST UPDATED: OCTOBER 30, 2026 · APPLIES GLOBALLY
          </p>
        </div>

        {/* Policy Content */}
        <div className="mt-12 space-y-12 font-sans text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
          
          {/* Section 1 */}
          <section className="p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#FA5D00] flex items-center justify-center flex-none">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
                1. Our Core Principle: Minimal Data & Total Transparency
              </h2>
            </div>
            <p>
              Reco Labs is an open hacker collective and toolchain workshop, not an advertising network. We collect only what is strictly required to provide authentication, let you showcase your builds on the Founder Network, and connect builders together. We never sell your personal data, run invasive trackers, or monetize your identity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 shadow-xs space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#FA5D00] flex items-center justify-center flex-none">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
                2. Information We Collect
              </h2>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-xl text-zinc-950 dark:text-zinc-100">A. Account Information</h3>
              <p>
                When you create a builder account directly, we collect your <strong>Name</strong>, unique <strong>@username</strong>, <strong>Email address</strong>, and an encrypted <strong>password hash</strong> (salted and hashed using industry-standard bcrypt). We never store raw passwords.
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t editorial-hairline">
              <h3 className="font-serif text-xl text-zinc-950 dark:text-zinc-100">B. Single Sign-On (Google & GitHub OAuth)</h3>
              <p>
                When you sign in via Google or GitHub, we receive standard authenticated profile claims provided by those platforms via Supabase Auth: verified email, full name, profile avatar URL, and OAuth provider identifier. We do not require or create a password for OAuth accounts.
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t editorial-hairline">
              <h3 className="font-serif text-xl text-zinc-950 dark:text-zinc-100">C. Public Founder Registry Listings & Social Links</h3>
              <p>
                When you post a startup or edit your profile, you may optionally provide:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                <li>Startup Name, URL, Problem Statement, Category, Stage</li>
                <li>Phone / WhatsApp number (publicly displayed for direct founder reach-out)</li>
                <li>Personal Website or Portfolio URL</li>
                <li>Discord handle or GitHub handle</li>
                <li>Short biography</li>
              </ul>
              <p className="text-xs text-zinc-500 italic mt-2">
                * Note: Information submitted to the Founder Directory (`/network`) and your Builder Profile (`/builder/:username`) is published publicly to enable community members, users, and mentors to contact you directly.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 shadow-xs space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#FA5D00] flex items-center justify-center flex-none">
                <Eye className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
                3. How Your Information is Used
              </h2>
            </div>
            <p>We use your information exclusively for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Authenticating your session and issuing secure JWT authentication tokens.</li>
              <li>Displaying your verified public builder showcase profile at <code>recolabs.in/builder/:username</code>.</li>
              <li>Displaying your projects on the public <code>/network</code> startup directory.</li>
              <li>Allowing you to edit, update, or remove your listings at any time.</li>
              <li>Preventing spam, abuse, and impersonation across the guild.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 shadow-xs space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#FA5D00] flex items-center justify-center flex-none">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
                4. Cookies & Client-Side Storage
              </h2>
            </div>
            <p>
              We do not use third-party tracking or advertising cookies. We use browser <code>localStorage</code> solely to preserve your active authentication session:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
              <li><code>reco_network_token</code>: Your signed JWT session bearer token.</li>
              <li><code>reco_network_user</code>: Cached profile JSON to provide instant UI rendering.</li>
            </ul>
            <p className="text-sm">
              Logging out via the interface immediately removes these keys from your local browser storage.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 shadow-xs space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 font-normal">
              5. Your Rights & Data Deletion
            </h2>
            <p>
              You maintain full ownership of your data. You may edit your profile information at any time from your builder profile or the network modal.
            </p>
            <p>
              If you wish to permanently delete your account, remove your startups, or wipe all records associated with your email from our PostgreSQL database, you can message our founder directly on Discord or email us. We will execute full removal within 48 hours without hassle.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="p-8 rounded-3xl bg-zinc-950 text-white dark:bg-[#121215] border-2 border-black dark:border-zinc-800 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal">
              6. Contact & Questions
            </h2>
            <p className="text-sm text-zinc-400">
              If you have any questions about our privacy practices, security, or data handling, reach out directly:
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="mailto:devadibxr@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FA5D00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>devadibxr@gmail.com</span>
              </a>
              <a
                href="https://discord.com/invite/7dk4w37BhP"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discord Guild</span>
              </a>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}

export default PrivacyPage
