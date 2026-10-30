import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Clock, ArrowUpRight } from "lucide-react"
import { BlogNavbar } from "@/components/blog/BlogNavbar"
import { BlogFooter } from "@/components/blog/BlogFooter"
import { AdPlaceholder } from "@/components/blog/AdPlaceholder"
import { githubBlogService } from "@/services/githubBlogService"
import { BlogPost } from "@/types/blog"
import { trackEvent } from "@/lib/analytics"

export function BlogHomePage() {
  const [posts, setPosts] = React.useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("ALL")

  React.useEffect(() => {
    setPosts(githubBlogService.getAllPosts())
  }, [])

  const categories = ["ALL", "Reverse Engineering", "Hardware", "Systems", "Security", "Software"]

  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === "ALL" || post.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [posts, searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-[#FA5D00] selection:text-white">
      <BlogNavbar />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16 flex-grow">
        
        {/* Masthead */}
        <div className="pb-8 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="font-mono text-[11px] font-bold text-[#FA5D00] uppercase tracking-wider mb-2">
            Reco Labs · Engineering Notes
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-zinc-950 dark:text-white leading-tight">
            Dispatches
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans max-w-xl">
            Technical notes, hardware fault-injection rigs, and low-level systems documentation.
          </p>

          {/* Search & Categories */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    trackEvent("feed_category_selected", { category: cat })
                  }}
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    selectedCategory.toUpperCase() === cat.toUpperCase()
                      ? "bg-[#FA5D00] text-white font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>
          </div>
        </div>

        {/* Post List */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center font-mono text-xs text-zinc-500">
              No dispatches found.
            </div>
          ) : (
            filteredPosts.map((post, index) => (
              <article key={post.id} className="py-7 group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  
                  {/* Left: Text Details */}
                  <div className="space-y-2 flex-grow min-w-0">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                      <span className="text-[#FA5D00] font-bold uppercase">{post.category}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTime}
                      </span>
                      <span>&bull;</span>
                      <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>

                    <Link to={`/post/${post.slug}`}>
                      <h2 className="text-xl sm:text-2xl font-serif text-zinc-950 dark:text-white group-hover:text-[#FA5D00] transition-colors leading-snug">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-2 pt-1 font-mono text-xs text-zinc-500">
                      <span>by</span>
                      <a
                        href={`https://www.recolabs.in/builder/${post.author.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#FA5D00] dark:hover:text-[#FA5D00] hover:underline transition-colors"
                      >
                        @{post.author.username}
                      </a>
                    </div>
                  </div>

                  {/* Right: Medium Interactive Thumbnail (Never Full Screen) */}
                  {post.coverImage && (
                    <Link
                      to={`/post/${post.slug}`}
                      className="w-full sm:w-48 h-32 shrink-0 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative block group/img"
                    >
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                      />
                    </Link>
                  )}

                </div>

                {/* Ads Placeholder slot after second article */}
                {index === 1 && (
                  <AdPlaceholder slotName="FEED-SLOT-01" className="mt-8 mb-2" />
                )}
              </article>
            ))
          )}
        </div>

        {/* Bottom Feed Ads Placeholder */}
        {filteredPosts.length > 2 && (
          <AdPlaceholder slotName="BOTTOM-LEADERBOARD" className="mt-10" />
        )}

      </main>

      <BlogFooter />
    </div>
  )
}
