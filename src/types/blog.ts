export interface BlogPostAuthor {
  name: string
  username: string
  avatarUrl: string
  github?: string
  bio?: string
  role?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string // Markdown with embedded HTML, custom <style>, and iframe embeds
  coverImage?: string
  tags: string[]
  category: string
  author: BlogPostAuthor
  createdAt: string
  updatedAt: string
  readingTime: string
  isPublished: boolean
  githubSha?: string
  githubUrl?: string
  views?: number
}

export interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch: string
  path: string
}

export interface GitHubCommitResult {
  success: boolean
  sha?: string
  commitUrl?: string
  fileUrl?: string
  error?: string
}

export interface TableOfContentsItem {
  id: string
  text: string
  level: number
}
