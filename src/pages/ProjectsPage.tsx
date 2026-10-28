"use client"

import * as React from "react"
import { RepoShowcase } from "@/components/RepoShowcase"
import { ExternalLink, Terminal, GitBranch, Star, Code2, FolderGit2, Search, Check, Copy } from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { api, type ProjectItem } from "@/services/api"

export function ProjectsPage() {
  const [projects, setProjects] = React.useState<ProjectItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    async function loadProjects() {
      try {
        setLoading(true)
        const data = await api.getProjects()
        if (mounted) setProjects(data)
      } catch (err) {
        console.error("Failed to load projects:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadProjects()
    return () => {
      mounted = false
    }
  }, [])

  const handleCopyClone = (id: string, gitUrl?: string) => {
    const cmd = gitUrl ? `git clone ${gitUrl}` : `git clone https://github.com/recoorg/${id}.git`
    navigator.clipboard.writeText(cmd)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lang.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="w-full pt-32 sm:pt-36 pb-24 px-6 sm:px-8 bg-white dark:bg-[#09090b]">
      <div className="mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto pb-12 border-b editorial-hairline">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
            OPEN ARTIFACTS & CODEBASES
          </span>
          <h1 className="mt-4 font-serif text-5xl sm:text-7xl lg:text-8xl text-zinc-950 dark:text-zinc-50 font-normal tracking-tight">
            Projects & Vaults<span className="text-[#FA5D00]">.</span>
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Every repository created under Reco Labs is hosted public on GitHub. We believe software and hardware should be transparent, forkable, and hackable.
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <a
              href="https://github.com/recoorg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-wider hover:opacity-85 transition-opacity shadow-sm"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Explore @recoorg on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Featured Interactive 3D Showcase */}
        <div className="mt-12">
          <RepoShowcase />
        </div>

        {/* Extended Repository Vaults Catalog */}
        <div className="mt-20 pt-16 border-t editorial-hairline">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#FA5D00] font-semibold">
                REPOSITORY ARCHIVES
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 font-normal">
                All Repositories & Modules
              </h2>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter repositories..."
                  className="pl-8 pr-3 py-1.5 rounded-full border editorial-hairline bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-[#FA5D00] w-[180px] sm:w-[220px]"
                />
              </div>

              <div className="inline-flex rounded-full border editorial-hairline p-0.5 bg-zinc-100 dark:bg-zinc-900 font-mono text-xs">
                {(["all", "flagship", "hardware", "tools", "tutorials"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer uppercase text-[11px] ${
                      activeCategory === cat
                        ? "bg-[#FA5D00] text-black font-bold shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="py-16 text-center font-mono text-xs text-zinc-500">
              Loading repositories from endpoint...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center border rounded-2xl editorial-hairline font-mono text-xs text-zinc-500">
              No repositories matched your search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col justify-between p-6 rounded-2xl border editorial-hairline bg-white dark:bg-zinc-900/40 hover:border-[#FA5D00] transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 pb-3 border-b editorial-hairline">
                      <span className="text-[#FA5D00] font-bold">{p.tag}</span>
                      <span>{p.lang}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <h3 className="font-serif text-2xl text-zinc-950 dark:text-zinc-50 font-normal group-hover:text-[#FA5D00] transition-colors">
                        {p.name}
                      </h3>
                      <FolderGit2 className="w-4 h-4 text-zinc-400 group-hover:text-[#FA5D00] transition-colors" />
                    </div>

                    <p className="mt-3 font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t editorial-hairline flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3 text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>{p.stars}</span>
                      </span>
                      {p.forks && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{p.forks}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyClone(p.id, p.gitUrl)}
                        title="Copy git clone command"
                        className="p-1.5 rounded-lg border editorial-hairline hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {copiedId === p.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={p.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#FA5D00] font-bold hover:underline"
                      >
                        <span>Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ProjectsPage
