import * as React from "react"
import { Link } from "react-router-dom"
import { Plus, Eye, PenTool, Trash2, Download, Search } from "lucide-react"
import { BlogNavbar } from "@/components/blog/BlogNavbar"
import { BlogFooter } from "@/components/blog/BlogFooter"
import { DashboardAnalytics } from "@/components/blog/DashboardAnalytics"
import { githubBlogService, serializeFrontmatter } from "@/services/githubBlogService"
import { BlogPost } from "@/types/blog"
import { trackEvent } from "@/lib/analytics"

export function BlogDashboardPage() {
  const [posts, setPosts] = React.useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")

  const refreshData = () => {
    setPosts(githubBlogService.getAllPosts())
  }

  React.useEffect(() => {
    refreshData()
  }, [])

  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
  }, [posts, searchQuery])

  const handleExport = (post: BlogPost) => {
    trackEvent("dispatch_exported", {
      slug: post.slug,
      format: "markdown",
    })
    const serialized = serializeFrontmatter(post)
    const blob = new Blob([serialized], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${post.slug}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = (post: BlogPost) => {
    if (confirm(`Delete "${post.title}"?`)) {
      trackEvent("dispatch_deleted", {
        slug: post.slug,
      })
      githubBlogService.deletePost(post.id)
      refreshData()
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-[#FA5D00] selection:text-white">
      <BlogNavbar />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16 flex-grow">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800/80 mb-6">
          <div>
            <h1 className="text-3xl font-serif text-zinc-950 dark:text-white">Blog Dashboard</h1>
            <p className="text-xs font-mono text-zinc-500 mt-1">Manage all engineering dispatches, drafts, and analytics telemetry.</p>
          </div>

          <Link
            to="/write"
            className="px-4 py-2 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Post</span>
          </Link>
        </div>

        {/* Analytics Telemetry Widget */}
        <DashboardAnalytics />

        {/* Search */}
        <div className="my-6">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
            />
          </div>
        </div>

        {/* Posts Table */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-zinc-500">
                No posts found.
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 mb-1">
                      <span className="text-[#FA5D00] font-bold uppercase">{post.category}</span>
                      <span>&bull;</span>
                      <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <Link
                      to={`/post/${post.slug}`}
                      className="font-serif text-lg text-zinc-950 dark:text-white hover:text-[#FA5D00] transition-colors truncate block"
                    >
                      {post.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/post/${post.slug}`}
                      className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      title="View post"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/write/${post.slug}`}
                      className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      title="Edit post"
                    >
                      <PenTool className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleExport(post)}
                      className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      title="Download markdown"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-500"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      <BlogFooter />
    </div>
  )
}
