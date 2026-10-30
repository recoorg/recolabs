import * as React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, Calendar, Share2, Check } from "lucide-react"
import { BlogNavbar } from "@/components/blog/BlogNavbar"
import { BlogFooter } from "@/components/blog/BlogFooter"
import { AdPlaceholder } from "@/components/blog/AdPlaceholder"
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"
import { RightScrollRail, SectionRailItem } from "@/components/blog/RightScrollRail"
import { githubBlogService } from "@/services/githubBlogService"
import { BlogPost } from "@/types/blog"
import { trackEvent } from "@/lib/analytics"

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = React.useState<BlogPost | null>(null)
  const [copiedLink, setCopiedLink] = React.useState(false)
  const [sections, setSections] = React.useState<SectionRailItem[]>([])

  React.useEffect(() => {
    if (!slug) return
    const found = githubBlogService.getPostBySlug(slug)
    if (found) {
      setPost(found)
      window.scrollTo(0, 0)
    } else {
      navigate("/")
    }
  }, [slug, navigate])

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-mono text-xs text-zinc-500">
        Loading dispatch...
      </div>
    )
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    trackEvent("post_link_copied", { slug: post.slug, category: post.category })
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-[#FA5D00] selection:text-white">
      <BlogNavbar />

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 flex-grow">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-[#FA5D00] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ALL DISPATCHES</span>
          </Link>
        </div>

        {/* Post Header */}
        <header className="pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 mb-3">
            <span className="text-[#FA5D00] font-bold uppercase">{post.category}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-zinc-950 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 font-mono text-xs">
            <a
              href={`https://www.recolabs.in/builder/${post.author.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 group/author transition-colors"
            >
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="w-7 h-7 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 group-hover/author:border-[#FA5D00]"
              />
              <span className="text-zinc-800 dark:text-zinc-200 font-semibold group-hover/author:text-[#FA5D00]">{post.author.name}</span>
              <span className="text-zinc-400 group-hover/author:text-[#FA5D00]">(@{post.author.username})</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied" : "Share"}</span>
            </button>
          </div>
        </header>

        {/* Medium Interactive Cover Image (Never Full Screen) */}
        {post.coverImage && (
          <div className="my-8 max-w-lg mx-auto">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-56 sm:h-64 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
            />
          </div>
        )}

        {/* Content Body (Markdown + HTML + CSS) */}
        <article className="mt-8">
          <MarkdownRenderer
            content={post.content}
            onSectionsExtracted={(s) => setSections(s)}
          />
        </article>

        {/* Ad Placeholder Slot */}
        <AdPlaceholder slotName="DISPATCH-ARTICLE-BOTTOM" className="mt-12" />

        {/* Tags */}
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap gap-1.5 font-mono text-xs">
          {post.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              #{t}
            </span>
          ))}
        </div>

      </main>

      {/* Floating Right Scroll Spy Rail (Vertical Dots with Title + Paragraph popover) */}
      <RightScrollRail sections={sections} />

      <BlogFooter />
    </div>
  )
}
