"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { ShieldCheck, Lock, Eye, Database, FileText, ArrowLeft, Mail, MessageSquare } from "lucide-react"

export function PrivacyPage() {
  return (
    <div className="relative w-full pt-32 sm:pt-36 pb-24 px-5 sm:px-8 bg-transparent overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#FA5D00]/[0.025] dark:bg-[#FA5D00]/[0.035] rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-[#FA5D00] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b-2 border-black dark:border-zinc-800 pb-8 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FA5D00]/10 border border-[#FA5D00]/30 text-[#FA5D00] font-mono text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Legal & Data Transparency</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-zinc-950 dark:text-zinc-50 font-normal leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 font-mono text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Effective Date: October 2026 · Reco Labs Open Collective (recolabs.in)
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-10 text-zinc-800 dark:text-zinc-200">
          
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-2xl border-2 border-black dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FA5D00] text-black font-mono font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-zinc-950 dark:text-zinc-50">
                Our Core Privacy Philosophy
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
              Reco Labs is an open-source collective built by students and hackers for the global builder community. We do not sell your personal data, monetize user attention, or embed third-party surveillance trackers. We only collect the minimal information necessary to authenticate your builder identity and publish your startup or project in our public directory.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-2xl border-2 border-black dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FA5D00] text-black font-mono font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-zinc-950 dark:text-zinc-50">
                Information We Collect
              </h2>
            </div>
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold block mb-1">
                  A. Authentication via Google & GitHub OAuth:
                </strong>
                When you sign in using Google or GitHub OAuth, we receive basic public profile information: your email address, full name, avatar URL, and preferred username. We do not request or access private repositories, Google Drive documents, or confidential account scopes.
              </div>
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold block mb-1">
                  B. Founder Profile & Startup Submissions:
                </strong>
                When you list a project in the Founder Network, you voluntarily submit your startup name, stage, category, problem statement, demo URL, and public contact coordinates (Discord handle, website, or social links). This information is intentionally public so mentors, collaborators, and early users can discover and test your product.
              </div>
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold block mb-1">
                  C. Local Browser Storage:
                </strong>
                We store your cryptographic session token in standard browser <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">localStorage</code> strictly to keep you authenticated across page navigation.
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 rounded-2xl border-2 border-black dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FA5D00] text-black font-mono font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-zinc-950 dark:text-zinc-50">
                How We Use Your Data
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans">
              <li>To create and maintain your unique Builder Profile at <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">recolabs.in/builder/[username]</code>.</li>
              <li>To index your startup in the public Reco Labs Network registry.</li>
              <li>To allow community members to contact you for collaborations, hackathons, or feedback.</li>
              <li>To prevent platform abuse, duplicate submissions, and spam.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-2xl border-2 border-black dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FA5D00] text-black font-mono font-bold flex items-center justify-center text-sm">
                04
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-zinc-950 dark:text-zinc-50">
                Security & Infrastructure
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
              Our data tier is hosted on Supabase managed PostgreSQL instances with encrypted connections (SSL/TLS). Passwords are never stored in plaintext — local authentication is hashed with bcrypt and OAuth uses standard JSON Web Tokens. Production hosting and edge caching are delivered by Vercel.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-2xl border-2 border-black dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FA5D00] text-black font-mono font-bold flex items-center justify-center text-sm">
                05
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-zinc-950 dark:text-zinc-50">
                Your Rights & Data Deletion
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans mb-4">
              You own your data. You may update your bio, social handles, and listed startups at any time through your Network dashboard. If you wish to completely wipe your account, listed projects, or founder records, contact us directly and your records will be purged immediately from the database.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:founder@recolabs.in"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-xs font-bold hover:bg-[#FA5D00] dark:hover:bg-[#FA5D00] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Data Request (founder@recolabs.in)</span>
              </a>
              <a
                href="https://discord.com/invite/7dk4w37BhP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-bold hover:border-[#FA5D00] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discord Support</span>
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
