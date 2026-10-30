import { BlogPost, GitHubConfig, GitHubCommitResult } from "@/types/blog"
import { SEED_BLOG_POSTS } from "@/data/seedPosts"

const GITHUB_CONFIG_STORAGE_KEY = "reco_blog_github_config"
const BLOG_POSTS_STORAGE_KEY = "reco_blog_posts"

const DEFAULT_CONFIG: GitHubConfig = {
  token: "",
  owner: "recoorg",
  repo: "blog",
  branch: "main",
  path: "posts",
}

// Helper to encode string to Base64 in UTF-8 safely
function utf8ToBase64(str: string): string {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16))
    })
  )
}

// Helper to decode Base64 to string in UTF-8 safely
function base64ToUtf8(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(window.atob(str), (c: string) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join("")
  )
}

export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200
  const cleanText = content.replace(/<[^>]*>/g, "").replace(/[#*`~_-]/g, " ")
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return `${minutes} min read`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function serializeFrontmatter(post: BlogPost): string {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `slug: ${JSON.stringify(post.slug)}`,
    `excerpt: ${JSON.stringify(post.excerpt)}`,
    `category: ${JSON.stringify(post.category)}`,
    `tags: ${JSON.stringify(post.tags)}`,
    post.coverImage ? `coverImage: ${JSON.stringify(post.coverImage)}` : null,
    "author:",
    `  name: ${JSON.stringify(post.author.name)}`,
    `  username: ${JSON.stringify(post.author.username)}`,
    `  avatarUrl: ${JSON.stringify(post.author.avatarUrl)}`,
    post.author.github ? `  github: ${JSON.stringify(post.author.github)}` : null,
    post.author.role ? `  role: ${JSON.stringify(post.author.role)}` : null,
    `createdAt: ${JSON.stringify(post.createdAt)}`,
    `updatedAt: ${JSON.stringify(post.updatedAt)}`,
    `readingTime: ${JSON.stringify(post.readingTime)}`,
    `isPublished: ${post.isPublished}`,
    "---",
    "",
    post.content.trim(),
  ]
    .filter(Boolean)
    .join("\n")

  return frontmatter
}

export function parseFrontmatter(rawContent: string): { frontmatter: Partial<BlogPost>; body: string } {
  const matches = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!matches) {
    return { frontmatter: {}, body: rawContent }
  }

  const yamlBlock = matches[1]
  const body = matches[2]
  const frontmatter: Partial<BlogPost> = {}

  yamlBlock.split("\n").forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return

    const colonIdx = trimmed.indexOf(":")
    if (colonIdx === -1) return

    const key = trimmed.slice(0, colonIdx).trim()
    let value = trimmed.slice(colonIdx + 1).trim()

    // Clean quotes or arrays
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1)
    }

    try {
      if (value.startsWith("[") && value.endsWith("]")) {
        ;(frontmatter as any)[key] = JSON.parse(value)
      } else if (value === "true") {
        ;(frontmatter as any)[key] = true
      } else if (value === "false") {
        ;(frontmatter as any)[key] = false
      } else {
        ;(frontmatter as any)[key] = value
      }
    } catch {
      ;(frontmatter as any)[key] = value
    }
  })

  return { frontmatter, body }
}

class GitHubBlogService {
  // Config Management
  getConfig(): GitHubConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG
    try {
      const stored = localStorage.getItem(GITHUB_CONFIG_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.repo === "recolabs") {
          parsed.repo = "blog"
          parsed.path = "posts"
          localStorage.setItem(GITHUB_CONFIG_STORAGE_KEY, JSON.stringify(parsed))
        }
        return { ...DEFAULT_CONFIG, ...parsed }
      }
    } catch (e) {
      console.error("Failed to read GitHub config from localStorage", e)
    }
    return DEFAULT_CONFIG
  }

  saveConfig(config: Partial<GitHubConfig>): GitHubConfig {
    const current = this.getConfig()
    const updated = { ...current, ...config }
    try {
      localStorage.setItem(GITHUB_CONFIG_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save GitHub config to localStorage", e)
    }
    return updated
  }

  // Posts Local Cache
  getAllPosts(): BlogPost[] {
    if (typeof window === "undefined") return SEED_BLOG_POSTS
    try {
      const stored = localStorage.getItem(BLOG_POSTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error("Failed to load blog posts from localStorage", e)
    }
    // Initialize with seed posts
    this.saveAllPosts(SEED_BLOG_POSTS)
    return SEED_BLOG_POSTS
  }

  saveAllPosts(posts: BlogPost[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(BLOG_POSTS_STORAGE_KEY, JSON.stringify(posts))
    } catch (e) {
      console.error("Failed to save blog posts to localStorage", e)
    }
  }

  getPostBySlug(slug: string): BlogPost | undefined {
    const posts = this.getAllPosts()
    return posts.find((p) => p.slug === slug || p.id === slug)
  }

  savePost(post: BlogPost): BlogPost {
    const posts = this.getAllPosts()
    const index = posts.findIndex((p) => p.id === post.id || p.slug === post.slug)
    const updatedPost = {
      ...post,
      updatedAt: new Date().toISOString(),
      readingTime: calculateReadingTime(post.content),
    }

    if (index >= 0) {
      posts[index] = updatedPost
    } else {
      posts.unshift(updatedPost)
    }

    this.saveAllPosts(posts)
    return updatedPost
  }

  deletePost(idOrSlug: string): void {
    const posts = this.getAllPosts().filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug)
    this.saveAllPosts(posts)
  }

  // Test GitHub Connection
  async testConnection(config: GitHubConfig): Promise<{ success: boolean; user?: any; repo?: any; error?: string }> {
    if (!config.token) {
      return { success: false, error: "Personal Access Token is missing." }
    }

    try {
      const headers = {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
      }

      // Check current user
      const userRes = await fetch("https://api.github.com/user", { headers })
      if (!userRes.ok) {
        const err = await userRes.json()
        return { success: false, error: err.message || "Invalid GitHub token" }
      }
      const user = await userRes.json()

      // Check repository access
      const repoRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, { headers })
      if (!repoRes.ok) {
        return {
          success: false,
          error: `Could not access repository ${config.owner}/${config.repo}. Ensure token has repo scope and repository exists.`,
        }
      }
      const repo = await repoRes.json()

      return { success: true, user, repo }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error checking GitHub connection" }
    }
  }

  // Publish / Save Post to GitHub Repository
  async savePostToGitHub(
    post: BlogPost,
    customCommitMsg?: string
  ): Promise<GitHubCommitResult> {
    const config = this.getConfig()
    if (!config.token) {
      return {
        success: false,
        error: "No GitHub Personal Access Token configured. Please open GitHub Settings in the top bar to connect your token.",
      }
    }

    const cleanPath = config.path.replace(/^\/+|\/+$/g, "")
    const filePath = `${cleanPath}/${post.slug}.md`
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`

    try {
      const headers = {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      }

      // Check if file already exists on GitHub to grab its SHA
      let currentSha = post.githubSha || undefined
      try {
        const checkRes = await fetch(`${url}?ref=${config.branch}`, { headers })
        if (checkRes.ok) {
          const fileData = await checkRes.json()
          currentSha = fileData.sha
        }
      } catch {
        // file doesn't exist yet, proceed with creation
      }

      // Prepare payload
      const serializedContent = serializeFrontmatter(post)
      const encodedContent = utf8ToBase64(serializedContent)
      const commitMessage =
        customCommitMsg ||
        (currentSha
          ? `chore(blog): update "${post.title}" by @${post.author.username}`
          : `feat(blog): publish "${post.title}" by @${post.author.username}`)

      const payload: any = {
        message: commitMessage,
        content: encodedContent,
        branch: config.branch,
      }
      if (currentSha) {
        payload.sha = currentSha
      }

      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errJson = await res.json()
        return {
          success: false,
          error: errJson.message || `GitHub API error (${res.status})`,
        }
      }

      const resData = await res.json()
      const newSha = resData.content?.sha || resData.commit?.sha
      const fileUrl = `https://github.com/${config.owner}/${config.repo}/blob/${config.branch}/${filePath}`
      const commitUrl = resData.commit?.html_url

      // Update post in local store with new GitHub metadata
      const updatedPost: BlogPost = {
        ...post,
        githubSha: newSha,
        githubUrl: fileUrl,
        isPublished: true,
      }
      this.savePost(updatedPost)

      return {
        success: true,
        sha: newSha,
        fileUrl,
        commitUrl,
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to commit post to GitHub",
      }
    }
  }

  // Pull existing markdown posts from the GitHub repository
  async pullPostsFromGitHub(): Promise<{ success: boolean; count: number; error?: string }> {
    const config = this.getConfig()
    if (!config.token) {
      return { success: false, count: 0, error: "GitHub token missing" }
    }

    const cleanPath = config.path.replace(/^\/+|\/+$/g, "")
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${cleanPath}?ref=${config.branch}`

    try {
      const headers = {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
      }

      const res = await fetch(url, { headers })
      if (!res.ok) {
        const err = await res.json()
        return { success: false, count: 0, error: err.message || "Failed to list repository contents" }
      }

      const items = await res.json()
      if (!Array.isArray(items)) {
        return { success: false, count: 0, error: "Specified path is not a directory" }
      }

      const mdFiles = items.filter((f) => f.name.endsWith(".md") || f.name.endsWith(".mdx"))
      let importedCount = 0

      for (const file of mdFiles) {
        try {
          const rawRes = await fetch(file.download_url)
          if (rawRes.ok) {
            const rawText = await rawRes.text()
            const { frontmatter, body } = parseFrontmatter(rawText)
            const slug = frontmatter.slug || file.name.replace(/\.(md|mdx)$/, "")
            const title = frontmatter.title || slug.replace(/-/g, " ")

            const importedPost: BlogPost = {
              id: slug,
              title,
              slug,
              excerpt: frontmatter.excerpt || "Imported from GitHub repository.",
              content: body,
              coverImage: frontmatter.coverImage,
              category: frontmatter.category || "Software",
              tags: frontmatter.tags || ["GitHub", "Engineering"],
              author: frontmatter.author || {
                name: "Reco Builder",
                username: "builder",
                avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                github: config.owner,
              },
              createdAt: frontmatter.createdAt || new Date().toISOString(),
              updatedAt: frontmatter.updatedAt || new Date().toISOString(),
              readingTime: calculateReadingTime(body),
              isPublished: true,
              githubSha: file.sha,
              githubUrl: file.html_url,
              views: 100,
            }

            this.savePost(importedPost)
            importedCount++
          }
        } catch (e) {
          console.warn(`Failed to import file ${file.name}`, e)
        }
      }

      return { success: true, count: importedCount }
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || "Network error fetching posts from GitHub" }
    }
  }
}

export const githubBlogService = new GitHubBlogService()
