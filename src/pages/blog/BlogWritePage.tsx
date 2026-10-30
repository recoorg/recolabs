import * as React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Save,
  Eye,
  Columns2,
  Edit3,
  Sliders,
  Settings,
  Download,
  Share2,
  Check,
  AlertCircle,
  HelpCircle,
  Code,
  Palette,
  Table,
  Sparkles,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  Quote,
  Link2,
  Image as ImageIcon,
  FileCode,
  GitCommit,
  X,
  ExternalLink
} from "lucide-react"
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"
import { EmbedModal, EmbedType } from "@/components/blog/EmbedModal"
import { trackEvent } from "@/lib/analytics"
import { GitHubSettingsModal } from "@/components/blog/GitHubSettingsModal"
import { BuilderSignInModal } from "@/components/blog/BuilderSignInModal"
import { BlogNavbar } from "@/components/blog/BlogNavbar"
import { BlogFooter } from "@/components/blog/BlogFooter"
import { githubBlogService, slugify, calculateReadingTime, serializeFrontmatter } from "@/services/githubBlogService"
import { BlogPost, GitHubConfig } from "@/types/blog"
import { networkApi, UserProfile } from "@/services/networkApi"
import { GithubIcon, YoutubeIcon } from "@/components/icons"

interface BlogWritePageProps {
  isSubdomain?: boolean
}

export function BlogWritePage({ isSubdomain = false }: BlogWritePageProps) {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const prefix = isSubdomain ? "" : "/blog"
  const dashboardPath = `${prefix}/dashboard`

  // Editor View Mode: "edit" | "split" | "preview"
  const [viewMode, setViewMode] = React.useState<"edit" | "split" | "preview">("split")

  // Post State
  const [postId, setPostId] = React.useState<string>(slug || `post-${Date.now()}`)
  const [title, setTitle] = React.useState("New Engineering Dispatch")
  const [postSlug, setPostSlug] = React.useState("new-engineering-dispatch")
  const [excerpt, setExcerpt] = React.useState("Technical summary of the engineering problem and implementation.")
  const [content, setContent] = React.useState(`
# Engineering Problem Statement

Document your architecture, hardware schematic, or reversing analysis here.

<style>
  .custom-dispatch-highlight {
    background: #09090b;
    border: 1px solid rgba(250, 93, 0, 0.4);
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
    color: #fff;
    font-family: 'Geist Mono', monospace;
  }
</style>

<div class="custom-dispatch-highlight">
  <strong>[RECO LABS HARDWARE DISPATCH]</strong><br/>
  Full custom HTML, embedded CSS styles, and responsive widgets are rendered live.
</div>

> [!NOTE]
> All posts are saved directly as versioned Markdown and committed to GitHub.

## Implementation Details

\`\`\`cpp
// language: C++, target: Windows 11 / Linux
#include <iostream>

int main() {
    std::cout << "Bench is live." << std::endl;
    return 0;
}
\`\`\`
`)
  const [category, setCategory] = React.useState("Reverse Engineering")
  const [tags, setTags] = React.useState<string[]>(["Systems", "C++", "Reco Labs"])
  const [coverImage, setCoverImage] = React.useState("")
  const [authorName, setAuthorName] = React.useState("Aditya Prasad")
  const [authorUsername, setAuthorUsername] = React.useState("aditya")
  const [authorAvatar, setAuthorAvatar] = React.useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
  const [authorGithub, setAuthorGithub] = React.useState("adibxr")
  const [authorRole, setAuthorRole] = React.useState("Founder, Reco Labs")
  const [isPublished, setIsPublished] = React.useState(false)
  const [githubSha, setGithubSha] = React.useState<string | undefined>(undefined)
  const [githubUrl, setGithubUrl] = React.useState<string | undefined>(undefined)

  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(() => networkApi.getCurrentUser())
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)

  // Drawer & Modals
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isEmbedModalOpen, setIsEmbedModalOpen] = React.useState(false)
  const [embedModalType, setEmbedModalType] = React.useState<EmbedType>("youtube")
  const [isGitHubConfigOpen, setIsGitHubConfigOpen] = React.useState(false)
  const [isCommitModalOpen, setIsCommitModalOpen] = React.useState(false)

  // Feedback states
  const [lastSaved, setLastSaved] = React.useState<string>("Just now")
  const [isSavingLocal, setIsSavingLocal] = React.useState(false)
  const [isCommitting, setIsCommitting] = React.useState(false)
  const [commitResult, setCommitResult] = React.useState<{ success?: boolean; sha?: string; url?: string; error?: string } | null>(null)
  const [customCommitMessage, setCustomCommitMessage] = React.useState("")

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Load existing post if slug is provided
  React.useEffect(() => {
    if (slug) {
      const existing = githubBlogService.getPostBySlug(slug)
      if (existing) {
        setPostId(existing.id)
        setTitle(existing.title)
        setPostSlug(existing.slug)
        setExcerpt(existing.excerpt)
        setContent(existing.content)
        setCategory(existing.category)
        setTags(existing.tags)
        setCoverImage(existing.coverImage || "")
        setAuthorName(existing.author.name)
        setAuthorUsername(existing.author.username)
        setAuthorAvatar(existing.author.avatarUrl)
        setAuthorGithub(existing.author.github || "")
        setAuthorRole(existing.author.role || "")
        setIsPublished(existing.isPublished)
        setGithubSha(existing.githubSha)
        setGithubUrl(existing.githubUrl)
      }
    }
  }, [slug])

  // Current Post Object Constructor
  const currentPost: BlogPost = React.useMemo(() => {
    return {
      id: postId,
      title,
      slug: postSlug,
      excerpt,
      content,
      category,
      tags,
      coverImage: coverImage || undefined,
      author: {
        name: authorName,
        username: authorUsername,
        avatarUrl: authorAvatar,
        github: authorGithub || undefined,
        role: authorRole || undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: calculateReadingTime(content),
      isPublished,
      githubSha,
      githubUrl,
      views: 0,
    }
  }, [
    postId,
    title,
    postSlug,
    excerpt,
    content,
    category,
    tags,
    coverImage,
    authorName,
    authorUsername,
    authorAvatar,
    authorGithub,
    authorRole,
    isPublished,
    githubSha,
    githubUrl,
  ])

  // Autosave to localStorage on changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      githubBlogService.savePost(currentPost)
      setIsSavingLocal(true)
      const now = new Date()
      setLastSaved(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setTimeout(() => setIsSavingLocal(false), 800)
    }, 1200)

    return () => clearTimeout(timer)
  }, [currentPost])

  // Title change syncs slug if slug hasn't been manually diverged
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slug) {
      setPostSlug(slugify(val))
    }
  }

  // Insert tool at cursor position in textarea
  const insertTextAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const replacement = before + (selected || "") + after

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 10)
  }

  // Handle Commit to GitHub
  const handleCommitToGitHub = async () => {
    const config = githubBlogService.getConfig()
    if (!config.token) {
      setIsCommitModalOpen(false)
      setIsGitHubConfigOpen(true)
      return
    }

    setIsCommitting(true)
    setCommitResult(null)

    const res = await githubBlogService.savePostToGitHub(currentPost, customCommitMessage.trim() || undefined)
    setIsCommitting(false)

    if (res.success) {
      setIsPublished(true)
      setGithubSha(res.sha)
      setGithubUrl(res.fileUrl)
      setCommitResult({
        success: true,
        sha: res.sha,
        url: res.fileUrl,
      })
      trackEvent("dispatch_published", {
        slug: currentPost.slug,
        category: currentPost.category,
        reading_time: currentPost.readingTime,
        has_cover: Boolean(currentPost.coverImage),
        tags_count: currentPost.tags?.length || 0,
      })
    } else {
      setCommitResult({
        success: false,
        error: res.error || "Failed to commit post to GitHub repository.",
      })
    }
  }

  React.useEffect(() => {
    if (currentUser) {
      setAuthorName(currentUser.name || "Reco Builder")
      setAuthorUsername(currentUser.username || "builder")
      if (currentUser.avatar_url) setAuthorAvatar(currentUser.avatar_url)
      if (currentUser.github) setAuthorGithub(currentUser.github)
    }
  }, [currentUser])

  const handleExportMarkdown = () => {
    trackEvent("dispatch_exported", {
      slug: postSlug,
      format: "markdown",
    })
    const serialized = serializeFrontmatter(currentPost)
    const blob = new Blob([serialized], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${postSlug}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-[#FA5D00] selection:text-white">
        <BlogNavbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 text-center shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#FA5D00]/10 border border-[#FA5D00]/30 text-[#FA5D00] flex items-center justify-center mx-auto mb-4">
              <FileCode className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-serif text-zinc-950 dark:text-white">Builder Access Required</h2>
            <p className="mt-2 text-xs font-mono text-zinc-500 leading-relaxed">
              Only verified Reco Labs builders can write and publish engineering dispatches to <code className="text-[#FA5D00]">github.com/recoorg/blog</code>.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 font-mono text-xs">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#FA5D00] hover:bg-[#e05300] text-white font-bold tracking-wider uppercase transition-all shadow-md active:scale-95"
              >
                Sign In with Email & Password
              </button>
              <Link
                to="/"
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                Return to Dispatches
              </Link>
            </div>
          </div>
        </div>
        <BlogFooter />
        <BuilderSignInModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user)
            setIsAuthModalOpen(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-[#FA5D00] selection:text-white">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full px-4 sm:px-6 py-2.5 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
        {/* Left: Back & Title Slug */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={dashboardPath}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="bg-transparent font-serif text-lg sm:text-xl font-bold text-zinc-950 dark:text-white focus:outline-none w-full truncate border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-[#FA5D00]"
              placeholder="Post Title..."
            />
            <div className="font-mono text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
              <span>slug:</span>
              <code className="text-[#FA5D00] truncate">{postSlug}.md</code>
              <span className="text-zinc-500">&bull;</span>
              <span className="text-zinc-500">{calculateReadingTime(content)}</span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-xs shrink-0">
          <button
            onClick={() => setViewMode("edit")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === "edit"
                ? "bg-white dark:bg-[#18181b] text-zinc-950 dark:text-white font-bold shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => setViewMode("split")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === "split"
                ? "bg-white dark:bg-[#18181b] text-zinc-950 dark:text-white font-bold shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === "preview"
                ? "bg-white dark:bg-[#18181b] text-zinc-950 dark:text-white font-bold shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Autosave status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mr-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSavingLocal ? "bg-[#FA5D00] animate-ping" : "bg-[#10B981]"
              }`}
            />
            <span>Saved {lastSaved}</span>
          </div>

          {/* Export Markdown */}
          <button
            onClick={handleExportMarkdown}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Download .md file"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Metadata Settings Drawer Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Post Metadata & Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Save to GitHub CTA Button */}
          <button
            onClick={() => setIsCommitModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Save to GitHub</span>
          </button>
        </div>
      </header>

      {/* Toolbar for Markdown & HTML / CSS Formatting */}
      <div className="sticky top-[53px] z-20 w-full px-4 sm:px-6 py-2 bg-zinc-50 dark:bg-[#111114] border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none font-mono text-xs">
        
        {/* Markdown Helpers */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => insertTextAtCursor("**", "**")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("*", "*")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("# ")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("## ")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("### ")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("- ")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Unordered List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("> ")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("`", "`")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("```cpp\n// code here\n", "\n```")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Code Block"
          >
            <FileCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertTextAtCursor("[", "](https://)")}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Link"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 shrink-0" />

        {/* HTML & CSS Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setEmbedModalType("style")
              setIsEmbedModalOpen(true)
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#FA5D00]/10 hover:bg-[#FA5D00]/20 text-[#FA5D00] font-bold transition-colors"
            title="Insert scoped CSS <style> block"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>&lt;style&gt;</span>
          </button>

          <button
            onClick={() => {
              setEmbedModalType("youtube")
              setIsEmbedModalOpen(true)
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Embed YouTube Video"
          >
            <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
            <span>Embed Video</span>
          </button>

          <button
            onClick={() => {
              setEmbedModalType("alert")
              setIsEmbedModalOpen(true)
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Insert Callout Alert"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Callout Box</span>
          </button>

          <button
            onClick={() => {
              setEmbedModalType("table")
              setIsEmbedModalOpen(true)
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Insert Data Table"
          >
            <Table className="w-3.5 h-3.5 text-blue-500" />
            <span>Table</span>
          </button>
        </div>

      </div>

      {/* Main Workspace (Editor / Preview) */}
      <main className="flex-grow flex w-full relative overflow-hidden h-[calc(100vh-105px)]">
        
        {/* Left Pane: Code & Markdown Editor */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className={`h-full flex flex-col bg-zinc-50 dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-zinc-800 ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault()
                  insertTextAtCursor("  ")
                }
              }}
              className="w-full flex-grow p-6 font-mono text-[13px] leading-relaxed bg-transparent text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none selection:bg-[#FA5D00] selection:text-white overflow-y-auto"
              placeholder="Write your blog post in Markdown, raw HTML tags, and custom <style> blocks..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Right Pane: Live Rendered Output */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`h-full overflow-y-auto p-6 sm:p-10 bg-white dark:bg-[#09090b] ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
          >
            <div className="max-w-3xl mx-auto">
              
              {/* Preview Header */}
              <div className="pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
                <span className="px-2.5 py-1 rounded bg-[#FA5D00]/10 border border-[#FA5D00]/30 text-[#FA5D00] font-mono text-xs font-bold uppercase">
                  {category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif text-zinc-950 dark:text-white mt-3 mb-4 leading-tight">
                  {title}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 font-sans text-sm leading-relaxed">
                  {excerpt}
                </p>
                {coverImage && (
                  <div className="my-6 max-w-md mx-auto">
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-48 sm:h-56 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs font-mono text-zinc-500">
                  <span>Author: @{authorUsername}</span>
                  <span>&bull;</span>
                  <span>{calculateReadingTime(content)}</span>
                  {githubSha && (
                    <>
                      <span>&bull;</span>
                      <span className="text-[#10B981]">SHA: {githubSha.slice(0, 7)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Rendered Body with HTML & CSS execution */}
              <MarkdownRenderer content={content} />
            </div>
          </div>
        )}
      </main>

      {/* Embed Modal */}
      <EmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        defaultType={embedModalType}
        onInsert={(snippet) => insertTextAtCursor(snippet)}
      />

      {/* GitHub Settings Modal */}
      <GitHubSettingsModal
        isOpen={isGitHubConfigOpen}
        onClose={() => setIsGitHubConfigOpen(false)}
      />

      {/* GitHub Commit Dialog Modal */}
      {isCommitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-zinc-900 dark:text-zinc-100">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <GithubIcon className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold font-sans">Save & Commit to GitHub</h2>
              </div>
              <button
                onClick={() => setIsCommitModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div>Target Repo: <code className="text-[#FA5D00]">{githubBlogService.getConfig().owner}/{githubBlogService.getConfig().repo}</code></div>
                <div>Target Branch: <code className="text-[#FA5D00]">{githubBlogService.getConfig().branch}</code></div>
                <div>File Path: <code className="text-[#FA5D00]">{githubBlogService.getConfig().path}/{postSlug}.md</code></div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Commit Message (optional)
                </label>
                <input
                  type="text"
                  value={customCommitMessage}
                  onChange={(e) => setCustomCommitMessage(e.target.value)}
                  placeholder={`feat(blog): publish "${title}" by @${authorUsername}`}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs focus:outline-none focus:border-[#FA5D00]"
                />
              </div>

              {commitResult && (
                <div
                  className={`p-3 rounded-lg flex items-start gap-2 ${
                    commitResult.success
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                  }`}
                >
                  {commitResult.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <div className="space-y-1">
                    <div>{commitResult.success ? "Post committed to GitHub successfully!" : commitResult.error}</div>
                    {commitResult.sha && <div>SHA: {commitResult.sha}</div>}
                    {commitResult.url && (
                      <a
                        href={commitResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline flex items-center gap-1 text-[#FA5D00]"
                      >
                        View file on GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setIsCommitModalOpen(false)}
                className="px-4 py-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Close
              </button>
              <button
                onClick={handleCommitToGitHub}
                disabled={isCommitting}
                className="px-5 py-2 rounded-lg bg-[#FA5D00] hover:bg-[#e05300] text-white font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 transition-all shadow-md"
              >
                <GitCommit className={`w-4 h-4 ${isCommitting ? "animate-spin" : ""}`} />
                <span>{isCommitting ? "Committing..." : "Push to GitHub"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Metadata Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-white dark:bg-[#09090b] border-l border-zinc-200 dark:border-zinc-800 p-6 overflow-y-auto space-y-5 text-zinc-900 dark:text-zinc-100 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="font-sans font-bold text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FA5D00]" />
                Dispatch Metadata
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                value={postSlug}
                onChange={(e) => setPostSlug(slugify(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Excerpt / Summary
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-sans text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              >
                <option value="Reverse Engineering">Reverse Engineering</option>
                <option value="Hardware">Hardware</option>
                <option value="Systems">Systems</option>
                <option value="Security">Security</option>
                <option value="Software">Software</option>
                <option value="AI">AI</option>
                <option value="Tutorials">Tutorials</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags.join(", ")}
                onChange={(e) => setTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Cover Image URL (optional)
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-[#FA5D00]"
              />
            </div>

            {/* Author Settings */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-[#FA5D00]">
                Author Attribution
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">Reco Username (@handle)</label>
                <input
                  type="text"
                  value={authorUsername}
                  onChange={(e) => setAuthorUsername(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">GitHub Handle</label>
                <input
                  type="text"
                  value={authorGithub}
                  onChange={(e) => setAuthorGithub(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">Role / Guild Title</label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#FA5D00] hover:bg-[#e05300] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
              >
                Apply Metadata
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
