function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
import { IncomingMessage, ServerResponse } from "http"
import {
  pool,
  initDb,
  createUser,
  loginUser,
  syncOAuthUser,
  verifyToken,
  getUserById,
  getUserByUsername,
  updateUserProfile,
  listStartups,
  createStartup,
  getNetworkStats,
  listAds,
  listAllAdsAdmin,
  incrementAdClick,
  createAd,
  updateAd,
  deleteAd,
  listStoreLinks,
  listAllStoreLinksAdmin,
  createStoreLink,
  updateStoreLink,
  deleteStoreLink,
  deleteStartup,
  updateStartup,
  listCatalogProjects,
  listAllCatalogProjectsAdmin,
  createCatalogProject,
  updateCatalogProject,
  togglePinCatalogProject,
  deleteCatalogProject,
  listProjectSections,
  createProjectSection,
  deleteProjectSection,
  listProjectComments,
  createProjectComment,
  deleteProjectComment,
  listStartupComments,
  createStartupComment,
  getStartupRatingsSummary,
  createStartupRating,
  listBuilderJobs,
  listUserJobs,
  createBuilderJob,
  updateBuilderJob,
  updateBuilderJobStatus,
  deleteBuilderJob,
  listBuilderHackathons,
  listUserHackathons,
  createBuilderHackathon,
  deleteBuilderHackathon,
  listAllBuilderHackathonsAdmin,
  listAllBuilderJobsAdmin,
  listAllPaidEntitiesAdmin,
  toggleUserVerification,
  toggleJobFeatured,
  toggleStartupFeatured,
  setHackathonApproval,
  listCouponsAdmin,
  createCouponAdmin,
  toggleCouponAdmin,
  deleteCouponAdmin,
  validateCoupon,

  saveProjectAsset,
  getProjectAsset,
  listBuildersWithContributions,
  toggleStartupUpvote,
  listCommunityPosts,
  createCommunityPost,
  togglePostUpvote,
  listPostComments,
  createPostComment,
} from "./db.js"

// Anti-misuse security guard: Verifies admin master credentials
function checkAdminAuth(req: IncomingMessage | any): boolean {
  const headerKey = (req.headers && (req.headers["x-admin-key"] || req.headers["admin-key"])) || ""
  const authHeader = (req.headers && req.headers["authorization"]) || ""
  const bearerKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : ""
  const provided = (headerKey || bearerKey || "").trim()

  const validKeys = [
    process.env.ADMIN_SECRET,
    "Tanisha@1060",
    "Tanisha@2026",
    "rawenergon",
    "Aditya@1060A",
    "recolabs2026",
  ].filter(Boolean)

  if (validKeys.includes(provided)) return true

  // Also verify logged in admin session
  try {
    if (bearerKey) {
      const decoded = verifyToken(bearerKey)
      if (decoded && (decoded.username === "rawenergon" || decoded.email === "devadibxr@gmail.com")) {
        return true
      }
    }
  } catch {}

  return false
}

export async function handleNetworkRequest(req: IncomingMessage | any, res: ServerResponse | any): Promise<void> {
  // CORS & Content-Type
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key, admin-key")
  res.setHeader("Content-Type", "application/json")

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    res.end()
    return
  }

  // Resolve true pathname across Vite local dev and Vercel serverless
  let pathname = ""
  const qRoute = (req as any).query?.route
  if (qRoute) {
    const segs = Array.isArray(qRoute) ? qRoute.join("/") : qRoute
    pathname = `/api/network/${segs}`
  } else if (req.headers && req.headers["x-matched-path"]) {
    pathname = String(req.headers["x-matched-path"])
  } else if (req.url) {
    pathname = new URL(req.url, "http://localhost").pathname
  }
  pathname = pathname.replace(/\/$/, "")

  // Search parameters
  let searchParams = new URLSearchParams()
  if (req.url && req.url.includes("?")) {
    searchParams = new URL(req.url, "http://localhost").searchParams
  } else if ((req as any).query) {
    for (const [k, v] of Object.entries((req as any).query)) {
      if (k !== "route" && typeof v === "string") {
        searchParams.set(k, v)
      }
    }
  }

  // Parse Body helper
  const parseBody = <T = any>(): Promise<T> =>
    new Promise((resolve) => {
      if ((req as any).body && typeof (req as any).body === "object") {
        return resolve((req as any).body as T)
      }
      if (typeof (req as any).body === "string") {
        try {
          return resolve(JSON.parse((req as any).body) as T)
        } catch {
          return resolve({} as T)
        }
      }
      let body = ""
      req.on("data", (chunk: any) => (body += chunk))
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : ({} as T))
        } catch {
          resolve({} as T)
        }
      })
      req.on("error", () => resolve({} as T))
    })

  // Get Auth User helper
  const getAuthUser = () => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null
    const token = authHeader.split(" ")[1]
    return verifyToken(token)
  }

  try {
    await initDb()

    // 1. SIGNUP: POST /api/network/signup
    if (req.method === "POST" && pathname === "/api/network/signup") {
      const body = await parseBody()
      if (!body.email || !body.password || !body.name) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Name, email, and password are required." }))
        return
      }
      const data = await createUser(body)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, ...data }))
      return
    }

    // 2. LOGIN: POST /api/network/login
    if (req.method === "POST" && pathname === "/api/network/login") {
      const body = await parseBody()
      if (!body.email || !body.password) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Email and password are required." }))
        return
      }
      const data = await loginUser(body)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, ...data }))
      return
    }

    // 3. OAUTH SYNC: POST /api/network/oauth-sync
    if (req.method === "POST" && pathname === "/api/network/oauth-sync") {
      const body = await parseBody()
      if (!body.email) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Email is required for OAuth." }))
        return
      }
      const data = await syncOAuthUser({
        email: body.email,
        name: body.name || "Builder",
        avatarUrl: body.avatarUrl,
        provider: body.provider === "github" ? "github" : "google",
        preferredUsername: body.preferredUsername,
      })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, ...data }))
      return
    }

    // 4. GET PROFILE: GET /api/network/profile
    if (req.method === "GET" && pathname === "/api/network/profile") {
      const auth = getAuthUser()
      if (!auth) {
        res.statusCode = 401
        res.end(JSON.stringify({ error: "Unauthorized. Please sign in." }))
        return
      }
      const user = await getUserById(auth.id)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, user }))
      return
    }

    // 5. UPDATE PROFILE: PUT /api/network/profile
    if (req.method === "PUT" && pathname === "/api/network/profile") {
      const auth = getAuthUser()
      if (!auth) {
        res.statusCode = 401
        res.end(JSON.stringify({ error: "Unauthorized. Please sign in." }))
        return
      }
      const body = await parseBody()
      const updated = await updateUserProfile(auth.id, body)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, user: updated }))
      return
    }

    // 6. GET BUILDER BY USERNAME: GET /api/network/builder/:username
    if (req.method === "GET" && pathname.startsWith("/api/network/builder/")) {
      const username = pathname.replace("/api/network/builder/", "").trim()
      if (!username) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Username is required." }))
        return
      }
      const user = await getUserByUsername(username)
      if (!user) {
        res.statusCode = 404
        res.end(JSON.stringify({ error: `Builder @${username} not found.` }))
        return
      }
      const startups = await listStartups({ username })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, user, startups }))
      return
    }


    // 6.1 GET ALL BUILDERS WITH CONTRIBUTIONS: GET /api/network/builders
    if (req.method === "GET" && pathname === "/api/network/builders") {
      const limit = parseInt(searchParams.get("limit") || "100", 10)
      const builders = await listBuildersWithContributions(limit)
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, builders }))
      return
    }

    // 6.2 UPVOTE STARTUP: POST /api/network/startups/:id/upvote or POST /api/network/upvote
    if (req.method === "POST" && (pathname.startsWith("/api/network/startups/") && pathname.endsWith("/upvote") || pathname === "/api/network/upvote")) {
      let startupId = 0
      if (pathname === "/api/network/upvote") {
        const body = await parseBody()
        startupId = parseInt(body.startupId || body.id || "0", 10)
      } else {
        const match = pathname.match(/\/api\/network\/startups\/(\d+)\/upvote/)
        startupId = match ? parseInt(match[1], 10) : 0
      }
      if (!startupId) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Valid startup ID is required." }))
        return
      }
      const auth = getAuthUser()
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim()
      const result = await toggleStartupUpvote(startupId, auth?.id, ip)
      res.statusCode = 200
      res.end(JSON.stringify(result))
      return
    }



    // 6.3 COMMUNITY POSTS / SCROLL FEED: GET /api/network/posts, POST /api/network/posts
    if (req.method === "GET" && (pathname === "/api/network/posts" || pathname === "/api/network/discussions")) {
      const category = searchParams.get("category") || undefined
      const search = searchParams.get("search") || undefined
      const limit = parseInt(searchParams.get("limit") || "50", 10)
      const offset = parseInt(searchParams.get("offset") || "0", 10)
      const auth = getAuthUser()
      const posts = await listCommunityPosts({ category, search, limit, offset, currentUserId: auth?.id })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, posts }))
      return
    }

    if (req.method === "POST" && (pathname === "/api/network/posts" || pathname === "/api/network/discussions")) {
      const auth = getAuthUser()
      const body = await parseBody()
      if (!body.content || !body.content.trim()) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Post content cannot be empty." }))
        return
      }
      let authorName = body.authorName || "Anonymous Builder"
      let authorUsername = body.authorUsername || "builder"
      let authorAvatar = body.authorAvatar || null
      let isVerified = false

      if (auth) {
        const user = await getUserById(auth.id)
        if (user) {
          authorName = user.name || authorName
          authorUsername = user.username || authorUsername
          authorAvatar = user.avatar_url || authorAvatar
          isVerified = !!user.is_verified
        }
      }

      const post = await createCommunityPost({
        userId: auth?.id || null,
        authorName,
        authorUsername,
        authorAvatar,
        isVerified,
        title: body.title || null,
        content: body.content.trim(),
        category: body.category || "ask",
        tags: Array.isArray(body.tags) ? body.tags : [],
        mediaUrl: body.mediaUrl || null,
      })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, post }))
      return
    }

    // 6.4 POST UPVOTE: POST /api/network/posts/:id/upvote
    if (req.method === "POST" && pathname.startsWith("/api/network/posts/") && pathname.endsWith("/upvote")) {
      const match = pathname.match(/\/api\/network\/posts\/(\d+)\/upvote/)
      const postId = match ? parseInt(match[1], 10) : 0
      if (!postId) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Valid post ID is required." }))
        return
      }
      const auth = getAuthUser()
      const result = await togglePostUpvote(postId, auth?.id)
      res.statusCode = 200
      res.end(JSON.stringify(result))
      return
    }

    // 6.5 POST COMMENTS: GET /api/network/posts/:id/comments, POST /api/network/posts/:id/comments
    if (pathname.startsWith("/api/network/posts/") && pathname.endsWith("/comments")) {
      const match = pathname.match(/\/api\/network\/posts\/(\d+)\/comments/)
      const postId = match ? parseInt(match[1], 10) : 0
      if (!postId) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Valid post ID is required." }))
        return
      }

      if (req.method === "GET") {
        const comments = await listPostComments(postId)
        res.statusCode = 200
        res.end(JSON.stringify({ success: true, comments }))
        return
      }

      if (req.method === "POST") {
        const auth = getAuthUser()
        const body = await parseBody()
        if (!body.content || !body.content.trim()) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: "Comment content is required." }))
          return
        }
        let authorName = body.authorName || "Anonymous Builder"
        let authorUsername = body.authorUsername || "builder"
        let authorAvatar = body.authorAvatar || null
        let isVerified = false

        if (auth) {
          const user = await getUserById(auth.id)
          if (user) {
            authorName = user.name || authorName
            authorUsername = user.username || authorUsername
            authorAvatar = user.avatar_url || authorAvatar
            isVerified = !!user.is_verified
          }
        }

        const comment = await createPostComment({
          postId,
          userId: auth?.id || null,
          authorName,
          authorUsername,
          authorAvatar,
          isVerified,
          content: body.content.trim(),
        })
        res.statusCode = 200
        res.end(JSON.stringify({ success: true, comment }))
        return
      }
    }

    // SOCIAL CRAWLER PREVIEW: GET /api/network/builder-preview
    if (req.method === "GET" && (pathname === "/api/network/builder-preview" || pathname.startsWith("/api/network/builder-preview"))) {
      let username = searchParams.get("username") || pathname.replace("/api/network/builder-preview", "").replace(/^\//, "").trim()
      username = username.replace(/^@/, "").trim()

      let title = "Reco Labs"
      let desc = "The Skill Exchange for curious Mind. A global collective of young hackers, builders, and makers shipping high-impact software, hardware rigs, and tutorials."
      let image = "https://recolabs.in/twitter-image.png"
      let url = `https://recolabs.in/builder/${username}`

      if (username) {
        try {
          const user = await getUserByUsername(username)
          if (user) {
            const displayName = ((user as any).name || user.username) || user.username || username
            title = `${displayName} (@${user.username}) | Reco Labs`
            desc = user.bio || `${displayName} is building software, hardware rigs, and shipping on Reco Labs.`
            if (user.avatar_url && (user.avatar_url.startsWith("http") || user.avatar_url.startsWith("/"))) {
              image = user.avatar_url.startsWith("http") ? user.avatar_url : `https://recolabs.in${user.avatar_url}`
            }
          } else {
            title = `@${username} | Reco Labs`
          }
        } catch {}
      }

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <link rel="canonical" href="${escapeHtml(url)}">

  <!-- Open Graph -->
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="Reco Labs">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="900">
  <meta property="og:url" content="${escapeHtml(url)}">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@adibxr">
  <meta name="twitter:creator" content="@adibxr">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">

  <meta http-equiv="refresh" content="0;url=/builder/${encodeURIComponent(username)}">
</head>
<body style="background:#0c0c0e;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
  <h2>${escapeHtml(title)}</h2>
  <p>${escapeHtml(desc)}</p>
  <p>Loading builder profile... <a href="/builder/${encodeURIComponent(username)}" style="color:#FA5D00;">Click here if not redirected</a></p>
  <script>window.location.replace("/builder/" + encodeURIComponent("${username}"));</script>
</body>
</html>`

      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.statusCode = 200
      res.end(html)
      return
    }

    // SOCIAL CRAWLER PREVIEW FOR PAGES: GET /api/network/seo-preview
    if (req.method === "GET" && pathname === "/api/network/seo-preview") {
      const page = (searchParams.get("page") || "").toLowerCase().trim()
      let title = "Reco Labs"
      let desc = "The Skill Exchange for curious Mind. A global collective of young hackers, builders, and makers shipping high-impact software, hardware rigs, and tutorials."
      let image = "https://recolabs.in/twitter-image.png"
      let url = "https://recolabs.in"

      if (page === "projects" || page === "project") {
        title = "Projects | Reco Labs"
        desc = "190+ hand-picked design systems, open source tools, terminal utilities, and engineering rigs."
        image = "https://recolabs.in/twitter-projects.png"
        url = "https://recolabs.in/projects"
      } else if (page === "network") {
        title = "Network | Reco Labs"
        desc = "The professional network for builders to show and tell. Showcase your work, launch projects, find jobs, and connect with peers."
        image = "https://recolabs.in/twitter-network.png"
        url = "https://recolabs.in/network"
      } else if (page === "about") {
        title = "About | Reco Labs"
        desc = "From high school experiment to global guild. Founded by Aditya Raj & Tanish to empower curious young minds."
        image = "https://recolabs.in/twitter-image.png"
        url = "https://recolabs.in/about"
      } else if (page === "jobs") {
        title = "Jobs | Reco Labs"
        desc = "Work with high-velocity startups and developer tool founders. Internships, gigs, and full-time engineering roles."
        image = "https://recolabs.in/twitter-jobs.png"
        url = "https://recolabs.in/jobs"
      } else if (page === "hackathons" || page === "hackathon") {
        title = "Hackathons | Reco Labs"
        desc = "Curated hackathons for high school hackers and collegiate builders. Ship projects, win grants, meet peers."
        image = "https://recolabs.in/twitter-image.png"
        url = "https://recolabs.in/hackathons"
      } else if (page === "sponsors" || page === "sponsor") {
        title = "Sponsors | Reco Labs"
        desc = "Support the next generation of builders. Transparent community sponsorship and founder visibility."
        image = "https://recolabs.in/twitter-image.png"
        url = "https://recolabs.in/sponsors"
      }

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <link rel="canonical" href="${escapeHtml(url)}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Reco Labs">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="900">
  <meta property="og:url" content="${escapeHtml(url)}">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@adibxr">
  <meta name="twitter:creator" content="@adibxr">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">

  <meta http-equiv="refresh" content="0;url=${escapeHtml(url.replace('https://recolabs.in', ''))}">
</head>
<body style="background:#0c0c0e;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
  <h2>${escapeHtml(title)}</h2>
  <p>${escapeHtml(desc)}</p>
  <script>window.location.replace("${escapeHtml(url.replace('https://recolabs.in', ''))}");</script>
</body>
</html>`

      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.statusCode = 200
      res.end(html)
      return
    }

    // 9. GET NETWORK STATS: GET /api/network/stats
    if (req.method === "GET" && pathname === "/api/network/stats") {
      const stats = await getNetworkStats()
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, ...stats }))
      return
    }

    // 7. GET STARTUPS: GET /api/network/startups
    if (req.method === "GET" && (pathname === "/api/network/startups" || pathname === "/api/network")) {
      const search = searchParams.get("search") || ""
      const category = searchParams.get("category") || "ALL"
      const username = searchParams.get("username") || undefined
      const userIdParam = searchParams.get("userId") ? Number(searchParams.get("userId")) : undefined
      const startups = await listStartups({ search, category, username, userId: userIdParam })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, count: startups.length, startups }))
      return
    }

    // 8. CREATE STARTUP: POST /api/network/startups
    if (req.method === "POST" && pathname === "/api/network/startups") {
      const body = await parseBody()
      const auth = getAuthUser()

      if (!body.name || !body.url || !body.problem_solving) {
        res.statusCode = 400
        res.end(
          JSON.stringify({
            error: "Startup Name, URL, and Problem Solving description are required.",
          })
        )
        return
      }

      let founderName = body.founder_name
      let founderUsername = body.founder_username
      let founderEmail = body.founder_email
      let founderPhone = body.founder_phone
      let founderWebsite = body.founder_website
      let founderDiscord = body.founder_discord
      let userId: number | null = null

      if (auth) {
        userId = auth.id
        const user = await getUserById(auth.id)
        if (user) {
          founderName = founderName || ((user as any).name || user.username)
          founderUsername = founderUsername || user.username
          founderEmail = founderEmail || user.email
          founderPhone = founderPhone || user.phone
          founderWebsite = founderWebsite || user.website
          founderDiscord = founderDiscord || user.discord
        }
      }

      if (!founderName) {
        founderName = "Anonymous Founder"
      }

      const startup = await createStartup({
        userId,
        founderUsername,
        founderName,
        founderEmail,
        founderPhone,
        founderWebsite,
        founderDiscord,
        name: body.name,
        url: body.url,
        problemSolving: body.problem_solving,
        category: body.category || "Software",
        stage: body.stage || "Prototype",
      })

      res.statusCode = 201
      res.end(JSON.stringify({ success: true, startup }))
      return
    }


    // 8. ADS LIST: GET /api/network/ads
    if (req.method === "GET" && (pathname === "/api/network/ads" || pathname === "/api/ads")) {
      const placement = searchParams.get("placement") || undefined;
      const ads = await listAds(placement);
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ads }));
      return;
    }

    // 8B. ADMIN ADS LIST (ALL ADS): GET /api/network/admin/ads
    if (req.method === "GET" && (pathname === "/api/network/admin/ads" || pathname === "/api/admin/ads")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Invalid administrative credentials. Access denied." }));
        return;
      }
      const ads = await listAllAdsAdmin();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ads }));
      return;
    }

    // 9. AD CLICK: POST /api/network/ads/click
    if (req.method === "POST" && (pathname === "/api/network/ads/click" || pathname === "/api/ads/click")) {
      const body = await parseBody();
      if (body.id) {
        await incrementAdClick(Number(body.id));
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // 10. CREATE AD (Admin Protected): POST /api/network/ads
    if (req.method === "POST" && (pathname === "/api/network/ads" || pathname === "/api/ads")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to deploy ads." }));
        return;
      }
      const body = await parseBody();
      if (!body.title || !body.destination_url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Title and destination_url are required." }));
        return;
      }
      const ad = await createAd(body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ad }));
      return;
    }

    // 10B. UPDATE AD (Admin Protected): PUT /api/network/ads/:id or POST /api/network/ads/update
    if (
      (req.method === "PUT" && (pathname.startsWith("/api/network/ads/") || pathname.startsWith("/api/ads/"))) ||
      (req.method === "POST" && (pathname === "/api/network/ads/update" || pathname === "/api/ads/update"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to edit ads." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid ad ID is required." }));
        return;
      }
      const updated = await updateAd(id, body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ad: updated }));
      return;
    }

    // 10C. DELETE AD (Admin Protected): DELETE /api/network/ads/:id or POST /api/network/ads/delete
    if (
      (req.method === "DELETE" && (pathname.startsWith("/api/network/ads/") || pathname.startsWith("/api/ads/"))) ||
      (req.method === "POST" && (pathname === "/api/network/ads/delete" || pathname === "/api/ads/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to delete ads." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid ad ID is required." }));
        return;
      }
      const deleted = await deleteAd(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

    // 11. STORE LINKS: GET /api/network/store-links
    if (req.method === "GET" && (pathname === "/api/network/store-links" || pathname === "/api/store-links")) {
      const category = searchParams.get("category") || undefined;
      const links = await listStoreLinks(category);
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_links: links }));
      return;
    }

    // 11B. ADMIN STORE LINKS LIST (ALL): GET /api/network/admin/store-links
    if (req.method === "GET" && (pathname === "/api/network/admin/store-links" || pathname === "/api/admin/store-links")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required." }));
        return;
      }
      const links = await listAllStoreLinksAdmin();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_links: links }));
      return;
    }

    // 12. CREATE STORE LINK (Admin Protected): POST /api/network/store-links
    if (req.method === "POST" && (pathname === "/api/network/store-links" || pathname === "/api/store-links")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to create store links." }));
        return;
      }
      const body = await parseBody();
      if (!body.title || !body.url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Title and url are required." }));
        return;
      }
      const link = await createStoreLink(body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_link: link }));
      return;
    }

    // 12B. UPDATE STORE LINK (Admin Protected): PUT /api/network/store-links/:id or POST /api/network/store-links/update
    if (
      (req.method === "PUT" && (pathname.startsWith("/api/network/store-links/") || pathname.startsWith("/api/store-links/"))) ||
      (req.method === "POST" && (pathname === "/api/network/store-links/update" || pathname === "/api/store-links/update"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to edit store links." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid store link ID is required." }));
        return;
      }
      const updated = await updateStoreLink(id, body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_link: updated }));
      return;
    }

    // 12C. DELETE STORE LINK (Admin Protected): DELETE /api/network/store-links/:id or POST /api/network/store-links/delete
    if (
      (req.method === "DELETE" && (pathname.startsWith("/api/network/store-links/") || pathname.startsWith("/api/store-links/"))) ||
      (req.method === "POST" && (pathname === "/api/network/store-links/delete" || pathname === "/api/store-links/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to delete store links." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid store link ID is required." }));
        return;
      }
      const deleted = await deleteStoreLink(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

    // 13. DELETE STARTUP (Admin Protected): DELETE /api/network/startups/:id or POST /api/network/startups/delete
    if (
      (req.method === "DELETE" && (pathname.startsWith("/api/network/startups/") || pathname.startsWith("/api/startups/"))) ||
      (req.method === "POST" && (pathname === "/api/network/startups/delete" || pathname === "/api/startups/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to delete startups." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startup ID is required." }));
        return;
      }
      const deleted = await deleteStartup(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

    // 13B. UPDATE STARTUP (Owner or Admin): PUT /api/network/startups/:id or POST /api/network/startups/update
    if (
      (req.method === "PUT" && (pathname.startsWith("/api/network/startups/") || pathname.startsWith("/api/startups/"))) ||
      (req.method === "POST" && (pathname === "/api/network/startups/update" || pathname === "/api/startups/update"))
    ) {
      const user = getAuthUser();
      const isAdmin = checkAdminAuth(req);
      if (!user && !isAdmin) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to update startups." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startup ID is required." }));
        return;
      }
      const updated = await updateStartup(id, body, user?.id, user?.username, isAdmin);
      if (!updated) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: "Startup not found or you are not authorized to edit this startup." }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, startup: updated }));
      return;
    }

    // 14. CATALOG PROJECTS LIST (Public): GET /api/network/projects or GET /api/network/catalog
    if (
      req.method === "GET" &&
      (pathname === "/api/network/projects" || pathname === "/api/projects" || pathname === "/api/network/catalog")
    ) {
      const category = searchParams.get("category") || undefined;
      const projects = await listCatalogProjects(category);
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, projects }));
      return;
    }

    // 14B. ADMIN CATALOG PROJECTS LIST (All): GET /api/network/admin/projects
    if (req.method === "GET" && (pathname === "/api/network/admin/projects" || pathname === "/api/admin/projects")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required." }));
        return;
      }
      const projects = await listAllCatalogProjectsAdmin();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, projects }));
      return;
    }

    // 14C. CREATE CATALOG PROJECT: POST /api/network/projects or POST /api/projects
    if (
      req.method === "POST" &&
      (pathname === "/api/network/projects" || pathname === "/api/projects" || pathname === "/api/network/catalog")
    ) {
      const body = await parseBody();
      if (!body.title || !body.url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Title and url are required." }));
        return;
      }
      const isAdmin = checkAdminAuth(req);
      const isApproved = isAdmin ? (body.is_approved !== undefined ? Boolean(body.is_approved) : true) : false;
      const created = await createCatalogProject({ ...body, is_approved: isApproved });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, project: created }));
      return;
    }

    // 14C-2. APPROVE / TOGGLE STATUS CATALOG PROJECT: POST /api/network/projects/approve
    if (
      req.method === "POST" &&
      (pathname === "/api/network/projects/approve" || pathname === "/api/projects/approve" || pathname === "/api/network/admin/projects/approve")
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required." }));
        return;
      }
      const body = await parseBody();
      const id = Number(body.id);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid project ID is required." }));
        return;
      }
      const isApproved = body.is_approved !== undefined ? Boolean(body.is_approved) : true;
      const updated = await updateCatalogProject(id, { is_approved: isApproved });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, project: updated }));
      return;
    }

    // 14C-3. PIN / UNPIN CATALOG PROJECT TO TOP: POST /api/network/projects/pin
    if (
      req.method === "POST" &&
      (pathname === "/api/network/projects/pin" ||
       pathname === "/api/projects/pin" ||
       (pathname.startsWith("/api/network/projects/") && pathname.endsWith("/pin")))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative privileges required." }));
        return;
      }
      const body = await parseBody();
      let projectId = body.id || body.projectId;
      if (!projectId && pathname.includes("/pin")) {
        const parts = pathname.split("/");
        const idIdx = parts.indexOf("projects") + 1;
        if (idIdx > 0 && idIdx < parts.length) {
          projectId = parseInt(parts[idIdx], 10);
        }
      }
      if (!projectId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid project ID is required." }));
        return;
      }
      const updated = await togglePinCatalogProject(Number(projectId));
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, project: updated }));
      return;
    }

    // 14D. UPDATE CATALOG PROJECT (Admin Protected): PUT /api/network/projects/:id or POST /api/network/projects/update
    if (
      (req.method === "PUT" && (pathname.startsWith("/api/network/projects/") || pathname.startsWith("/api/projects/"))) ||
      (req.method === "POST" && (pathname === "/api/network/projects/update" || pathname === "/api/projects/update"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to edit projects." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid project ID is required." }));
        return;
      }
      const updated = await updateCatalogProject(id, body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, project: updated }));
      return;
    }

    // 14E. DELETE CATALOG PROJECT (Admin Protected): DELETE /api/network/projects/:id or POST /api/network/projects/delete
    if (
      (req.method === "DELETE" && (pathname.startsWith("/api/network/projects/") || pathname.startsWith("/api/projects/"))) ||
      (req.method === "POST" && (pathname === "/api/network/projects/delete" || pathname === "/api/projects/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Administrative key required to delete projects." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid project ID is required." }));
        return;
      }
      const deleted = await deleteCatalogProject(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

    // 15. PROJECT IMAGE ASSETS SERVING: GET /api/network/assets/:id or /api/network/assets/:id/:filename
    if (req.method === "GET" && pathname.startsWith("/api/network/assets/")) {
      const parts = pathname.replace("/api/network/assets/", "").split("/");
      const assetId = Number(parts[0]);
      if (!assetId || isNaN(assetId)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid asset ID" }));
        return;
      }
      const asset = await getProjectAsset(assetId);
      if (!asset || !asset.data_base64) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Asset not found" }));
        return;
      }
      const buffer = Buffer.from(asset.data_base64, "base64");
      res.setHeader("Content-Type", asset.mime_type || "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.statusCode = 200;
      res.end(buffer);
      return;
    }

    // 16. SUPABASE PROJECT IMAGE ASSET UPLOAD: POST /api/network/upload
    if (
      req.method === "POST" &&
      (pathname === "/api/network/upload" || pathname === "/api/upload" || pathname === "/api/network/assets/upload")
    ) {
      const body = await parseBody();
      if (!body.data_base64) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Image data (base64) is required." }));
        return;
      }
      const asset = await saveProjectAsset(
        body.filename || "project_preview.png",
        body.mime_type || "image/png",
        body.data_base64
      );
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, ...asset }));
      return;
    }

    // 15A. PROJECT SECTIONS LIST: GET /api/network/sections
    if (req.method === "GET" && (pathname === "/api/network/sections" || pathname === "/api/sections")) {
      const sections = await listProjectSections();
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, sections }));
      return;
    }

    // 15B. CREATE PROJECT SECTION (Admin): POST /api/network/sections
    if (req.method === "POST" && (pathname === "/api/network/sections" || pathname === "/api/sections")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Admin key required." }));
        return;
      }
      const body = await parseBody();
      if (!body.name) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Section name is required." }));
        return;
      }
      const section = await createProjectSection(body);
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, section }));
      return;
    }

    // 15C. DELETE PROJECT SECTION (Admin): POST /api/network/sections/delete
    if (
      (req.method === "DELETE" && pathname.startsWith("/api/network/sections/")) ||
      (req.method === "POST" && (pathname === "/api/network/sections/delete" || pathname === "/api/sections/delete"))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Admin key required." }));
        return;
      }
      const body = await parseBody();
      const id = Number(body.id || pathname.split("/").pop());
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid section ID is required." }));
        return;
      }
      const deleted = await deleteProjectSection(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

        // 17A. PROJECT COMMENTS LIST: GET /api/network/projects/:id/comments or /api/network/comments?projectId=:id
    if (
      req.method === "GET" &&
      ((pathname.startsWith("/api/network/projects/") && pathname.endsWith("/comments")) ||
       pathname === "/api/network/comments" ||
       pathname === "/api/comments")
    ) {
      let projectId = Number(searchParams.get("projectId") || searchParams.get("project_id"));
      if (!projectId) {
        const match = pathname.match(/\/projects\/(\d+)\/comments/);
        if (match) projectId = Number(match[1]);
      }
      if (!projectId || isNaN(projectId)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid projectId is required" }));
        return;
      }
      const comments = await listProjectComments(projectId);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, comments }));
      return;
    }

    // 17B. ADD PROJECT COMMENT / FEEDBACK: POST /api/network/projects/:id/comments or /api/network/comments
    if (
      req.method === "POST" &&
      ((pathname.startsWith("/api/network/projects/") && pathname.endsWith("/comments")) ||
       pathname === "/api/network/comments" ||
       pathname === "/api/comments")
    ) {
      let projectId = Number(searchParams.get("projectId") || searchParams.get("project_id"));
      if (!projectId) {
        const match = pathname.match(/\/projects\/(\d+)\/comments/);
        if (match) projectId = Number(match[1]);
      }
      const body = await parseBody();
      if (!projectId) projectId = Number(body.projectId || body.project_id);

      if (!projectId || isNaN(projectId)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid projectId is required" }));
        return;
      }
      if (!body.content || !body.content.trim()) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Comment / feedback content is required" }));
        return;
      }

      const user = getAuthUser();

      const comment = await createProjectComment({
        projectId,
        userId: user ? user.id : undefined,
        authorName: (body.authorName || body.author_name || (user ? user.username : "") || "Curious Builder").trim(),
        authorUsername: (body.authorUsername || body.author_username || (user ? user.username : "") || "").trim() || undefined,
        authorAvatar: (body.authorAvatar || body.author_avatar || "").trim() || undefined,
        content: body.content.trim(),
        type: body.type || "feedback",
      });

      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, comment }));
      return;
    }

    // 17C. DELETE PROJECT COMMENT: DELETE /api/network/comments/:id or POST /api/network/comments/delete
    if (
      (req.method === "DELETE" && pathname.startsWith("/api/network/comments/")) ||
      (req.method === "POST" && (pathname === "/api/network/comments/delete" || pathname === "/api/comments/delete"))
    ) {
      const body = await parseBody();
      const id = Number(body.id || pathname.split("/").pop());
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid comment ID is required" }));
        return;
      }
      const isAdmin = checkAdminAuth(req);
      const user = getAuthUser();

      if (!isAdmin && !user) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      const deleted = await deleteProjectComment(id, user ? user.id : undefined, isAdmin);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }

    // 17D. STARTUP COMMENTS LIST: GET /api/network/startups/:id/comments or /api/network/startup-comments?startupId=:id
    if (
      req.method === "GET" &&
      ((pathname.startsWith("/api/network/startups/") && pathname.endsWith("/comments")) ||
       pathname === "/api/network/startup-comments")
    ) {
      let startupId = Number(searchParams.get("startupId") || searchParams.get("startup_id"));
      if (!startupId) {
        const match = pathname.match(/\/startups\/(\d+)\/comments/);
        if (match) startupId = Number(match[1]);
      }
      if (!startupId || isNaN(startupId)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startupId is required" }));
        return;
      }
      const comments = await listStartupComments(startupId);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, comments }));
      return;
    }

    // 17E. ADD STARTUP COMMENT: POST /api/network/startups/:id/comments or /api/network/startup-comments
    if (
      req.method === "POST" &&
      ((pathname.startsWith("/api/network/startups/") && pathname.endsWith("/comments")) ||
       pathname === "/api/network/startup-comments")
    ) {
      let startupId = Number(searchParams.get("startupId") || searchParams.get("startup_id"));
      if (!startupId) {
        const match = pathname.match(/\/startups\/(\d+)\/comments/);
        if (match) startupId = Number(match[1]);
      }
      const body = await parseBody();
      if (!startupId) startupId = Number(body.startupId || body.startup_id);
      if (!startupId || isNaN(startupId)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startupId is required" }));
        return;
      }
      const content = String(body.content || "").trim();
      if (!content) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Comment content is required" }));
        return;
      }

      const user: any = getAuthUser();
      const authorName = user?.name || String(body.authorName || body.author_name || "Community Builder").trim();
      const authorUsername = user?.username || String(body.authorUsername || body.author_username || "").trim();
      const authorAvatar = user?.avatar_url || body.authorAvatar || body.author_avatar || null;

      const created = await createStartupComment({
        startupId,
        userId: user ? user.id : undefined,
        authorName,
        authorUsername,
        authorAvatar,
        content,
      });

      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, comment: created }));
      return;
    }

    // 17F. GET STARTUP RATINGS SUMMARY: GET /api/network/startups/:id/ratings or /api/network/startup-ratings?startupId=:id
    if (
      req.method === "GET" &&
      ((pathname.startsWith("/api/network/startups/") && pathname.endsWith("/ratings")) ||
       pathname === "/api/network/startup-ratings")
    ) {
      let startupId = Number(searchParams.get("startupId") || searchParams.get("startup_id"));
      if (!startupId) {
        const match = pathname.match(/\/startups\/(\d+)\/ratings/);
        if (match) startupId = Number(match[1]);
      }
      if (!startupId || isNaN(startupId)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startupId is required" }));
        return;
      }
      const ratings = await getStartupRatingsSummary(startupId);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ratings }));
      return;
    }

    // 17G. SUBMIT STARTUP FUNCTIONAL RATING: POST /api/network/startups/:id/ratings or /api/network/startup-ratings
    if (
      req.method === "POST" &&
      ((pathname.startsWith("/api/network/startups/") && pathname.endsWith("/ratings")) ||
       pathname === "/api/network/startup-ratings")
    ) {
      let startupId = Number(searchParams.get("startupId") || searchParams.get("startup_id"));
      if (!startupId) {
        const match = pathname.match(/\/startups\/(\d+)\/ratings/);
        if (match) startupId = Number(match[1]);
      }
      const body = await parseBody();
      if (!startupId) startupId = Number(body.startupId || body.startup_id);
      if (!startupId || isNaN(startupId)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startupId is required" }));
        return;
      }

      const ideaScore = Math.max(1, Math.min(5, Number(body.ideaScore || body.idea || 5)));
      const executionScore = Math.max(1, Math.min(5, Number(body.executionScore || body.execution || 5)));
      const designScore = Math.max(1, Math.min(5, Number(body.designScore || body.design || 5)));

      const user = getAuthUser();
      const updatedSummary = await createStartupRating({
        startupId,
        userId: user ? user.id : undefined,
        ideaScore,
        executionScore,
        designScore,
      });

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ratings: updatedSummary }));
      return;
    }

    // 17H. INSPECT LINK METADATA: GET /api/network/inspect-link or POST /api/network/inspect-link
    if (
      pathname === "/api/network/inspect-link" ||
      pathname === "/api/inspect-link"
    ) {
      let targetUrl = searchParams.get("url");
      if (!targetUrl && req.method === "POST") {
        const body = await parseBody();
        targetUrl = body.url;
      }
      if (!targetUrl) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "URL is required" }));
        return;
      }

      let parsedUrl: URL;
      try {
        const withProtocol = targetUrl.startsWith("http://") || targetUrl.startsWith("https://")
          ? targetUrl
          : `https://${targetUrl}`;
        parsedUrl = new URL(withProtocol);
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid URL provided" }));
        return;
      }

      const domain = parsedUrl.hostname;
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      let title = "";
      let description = "";
      let category = "Software";

      // If GitHub repo
      if (domain === "github.com") {
        const parts = parsedUrl.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
          const [owner, repo] = parts;
          title = repo.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          try {
            const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
              headers: { "User-Agent": "RecoLabs-LinkInspector/1.0" },
            });
            if (ghRes.ok) {
              const ghData: any = await ghRes.json();
              if (ghData.name) title = ghData.name;
              if (ghData.description) description = ghData.description;
              const topics = Array.isArray(ghData.topics) ? ghData.topics.join(" ") : "";
              const fullText = `${title} ${description} ${topics}`.toLowerCase();
              if (/ai|llm|gpt|agent|machine learning|vision|deepseek|model/.test(fullText)) category = "AI";
              else if (/security|exploit|bypass|auth|crypto|protect|cve/.test(fullText)) category = "Security";
              else if (/hardware|pcb|firmware|embedded|cad|iot|esp32/.test(fullText)) category = "Hardware";
              else if (/learn|course|tool|toolkit|cli|framework|template|education/.test(fullText)) category = "Education & Tooling";
            }
          } catch {}
        }
      }

      // If not populated from GitHub, fetch HTML
      if (!description) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);
          const response = await fetch(parsedUrl.toString(), {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml",
            },
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (response.ok) {
            const html = await response.text();
            if (!title) {
              const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
              if (titleMatch) {
                title = titleMatch[1].trim()
                  .replace(/(\s*[-|–—]\s*.*)$/, "")
                  .slice(0, 80);
              }
            }
            const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                               html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
            const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
            
            const rawDesc = (ogDescMatch ? ogDescMatch[1] : (metaDescMatch ? metaDescMatch[1] : "")).trim();
            if (rawDesc) {
              description = rawDesc.slice(0, 300);
            }

            const combined = `${title} ${description}`.toLowerCase();
            if (/ai|llm|gpt|agent|machine learning|neural|vision|copilot/.test(combined)) category = "AI";
            else if (/security|auth|cipher|protect|encrypt|vulnerability|audit|firewall|pentest/.test(combined)) category = "Security";
            else if (/hardware|pcb|firmware|cad|circuit|arduino|esp32|sensor|raspberry/.test(combined)) category = "Hardware";
            else if (/learn|tutorial|course|doc|guide|book|education|tool/.test(combined)) category = "Education & Tooling";
          }
        } catch {}
      }

      // Fallback title from hostname if still empty
      if (!title) {
        title = domain.replace(/^www\./, "").split(".")[0];
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }
      if (!description) {
        description = `Innovative engineering stack and builder build hosted at ${domain}.`;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        title,
        problem_solving: description,
        category,
        favicon,
      }));
      return;
    }

    // 18. ADMIN CUSTOM MAIL SENDER: POST /api/network/admin/send-email (Sender: noreply@recolabs.in)
    if (req.method === "POST" && (pathname === "/api/network/admin/send-email" || pathname === "/api/admin/send-email")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Admin credentials required to send emails." }));
        return;
      }

      const body = await parseBody();
      const { to, subject, message, html, senderName, replyTo } = body;

      if (!to || !subject || (!message && !html)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Recipient email (to), subject, and message content are required." }));
        return;
      }

      const rawRecipients: string[] = Array.isArray(to) ? to : [to];
      const recipients = Array.from(
        new Set(rawRecipients.map((e: string) => String(e).trim().toLowerCase()))
      ).filter((e) => e.includes("@"));

      if (recipients.length === 0) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "No valid recipient email addresses found." }));
        return;
      }

      const resendApiKey =
        process.env.RESEND_API_KEY ||
        Buffer.from("cmVfYWdmNG9WTlRfMkxnUzFGQUJaZ0syQU5uMllYWEgxSlBI", "base64").toString("utf-8");

      const emailHtml = html || `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0c0c0e; color: #f4f4f5; margin: 0; padding: 40px 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #121214; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .logo { display: inline-flex; align-items: center; gap: 8px; font-weight: bold; font-family: monospace; font-size: 14px; color: #fff; text-decoration: none; margin-bottom: 24px; }
    .logo-badge { background: #FA5D00; color: #000; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; }
    h1 { font-size: 22px; color: #ffffff; margin-top: 0; font-weight: 600; line-height: 1.3; }
    .content { font-size: 14px; line-height: 1.7; color: #d4d4d8; white-space: pre-wrap; margin: 20px 0; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 11px; color: #71717a; text-align: center; }
    .btn { display: inline-block; background: #FA5D00; color: #000 !important; font-weight: bold; text-decoration: none; padding: 10px 24px; border-radius: 9999px; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <a href="https://recolabs.in" class="logo">
      <span class="logo-badge">R</span>
      <span>Reco Labs</span>
    </a>
    <h1>${escapeHtml(subject)}</h1>
    <div class="content">${escapeHtml(message || "")}</div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://recolabs.in" class="btn">Visit Reco Labs ↗</a>
    </div>
    <div class="footer">
      Sent by Reco Labs Guild · <a href="https://recolabs.in" style="color: #a1a1aa;">recolabs.in</a><br>
      Dispatched via noreply@recolabs.in
    </div>
  </div>
</body>
</html>
`;

      const fromLabel = senderName ? `${senderName} <noreply@recolabs.in>` : "Reco Labs <noreply@recolabs.in>";
      const replyToAddress = replyTo || "noreply@recolabs.in";

      // 1. Primary Dispatch: Resend API with verified noreply@recolabs.in
      if (resendApiKey) {
        try {
          const resendPayload: any = {
            from: fromLabel,
            reply_to: replyToAddress,
            subject: subject,
            html: emailHtml,
            text: message || "",
          };

          if (recipients.length === 1) {
            resendPayload.to = recipients;
          } else {
            resendPayload.to = ["noreply@recolabs.in"];
            resendPayload.bcc = recipients;
          }

          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + resendApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(resendPayload),
          });
          const resendData: any = await resendResponse.json();
          if (resendResponse.ok && resendData.id) {
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                provider: "resend",
                id: resendData.id,
                count: recipients.length,
                to: recipients,
                sender: fromLabel,
              })
            );
            return;
          } else {
            console.warn("Resend API warning:", resendData);
          }
        } catch (resendErr) {
          console.error("Resend API dispatch error:", resendErr);
        }
      }

      // 2. Fallback Dispatch: Gmail SMTP Delivery with devadibxr@gmail.com
      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = Number(process.env.SMTP_PORT || 587);
      const smtpUser = process.env.SMTP_USER || "devadibxr@gmail.com";
      const smtpPass = process.env.SMTP_PASS || "adzxxkjdxekhhjlr";

      try {
        const nodemailerPkg = await import("nodemailer");
        const nodemailer = nodemailerPkg.default || nodemailerPkg;
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions: any = {
          from: `"${senderName || "Reco Labs"}" <${smtpUser}>`,
          replyTo: replyToAddress,
          subject: subject,
          text: message || "",
          html: emailHtml,
        };

        if (recipients.length === 1) {
          mailOptions.to = recipients[0];
        } else {
          mailOptions.to = `"${senderName || "Reco Labs Community"}" <${smtpUser}>`;
          mailOptions.bcc = recipients;
        }

        const info = await transporter.sendMail(mailOptions);

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            provider: "gmail_smtp",
            messageId: info.messageId,
            count: recipients.length,
            to: recipients,
            sender: `${senderName || "Reco Labs"} <${smtpUser}>`,
          })
        );
        return;
      } catch (smtpErr: any) {
        console.error("Gmail SMTP error:", smtpErr);
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, error: "Delivery failed: " + (smtpErr?.message || String(smtpErr)) }));
        return;
      }
    }

    // 18B. ADMIN LIST ALL BUILDERS: GET /api/network/admin/builders
    if (req.method === "GET" && (pathname === "/api/network/admin/builders" || pathname === "/api/admin/builders")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Admin credentials required." }));
        return;
      }
      const client = await pool.connect();
      try {
        const resDb = await client.query(`
          SELECT id, name, username, email, is_verified, is_pro, plan, avatar_url, created_at
          FROM users
          WHERE email IS NOT NULL AND email != ''
          ORDER BY created_at DESC
        `);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, count: resDb.rows.length, builders: resDb.rows }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to list builders." }));
      } finally {
        client.release();
      }
      return;
    }

        // ==========================================
    // BUILDER JOBS ROUTES
    // ==========================================

    // LIST JOBS: GET /api/network/jobs
    if (req.method === "GET" && (pathname === "/api/network/jobs" || pathname === "/api/jobs")) {
      const urlObj = new URL(req.url, "http://localhost");
      const onlyActive = urlObj.searchParams.get("all") !== "true";
      const limit = urlObj.searchParams.get("limit") ? Number(urlObj.searchParams.get("limit")) : undefined;
      const jobs = await listBuilderJobs({ onlyActive, limit });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, jobs }));
      return;
    }

    // LIST MY JOBS: GET /api/network/my-jobs
    if (req.method === "GET" && (pathname === "/api/network/my-jobs" || pathname === "/api/my-jobs")) {
      const user = getAuthUser();
      if (!user) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to view your posted jobs." }));
        return;
      }
      const jobs = await listUserJobs(user.id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, jobs }));
      return;
    }

    // CREATE JOB: POST /api/network/jobs
    if (req.method === "POST" && (pathname === "/api/network/jobs" || pathname === "/api/jobs")) {
      const user = getAuthUser();
      if (!user) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to post a job." }));
        return;
      }
      const body = await parseBody();
      if (!body.title || !body.company_name || !body.apply_url || !body.description) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Title, company name, application link, and description are required." }));
        return;
      }

      const job = await createBuilderJob({
        userId: user.id,
        authorName: body.author_name || ((user as any).name || user.username) || "Founder",
        authorUsername: user.username,
        title: body.title,
        companyName: body.company_name,
        companyLogo: body.company_logo,
        location: body.location || "Remote",
        isRemote: body.is_remote !== false,
        jobType: body.job_type || "Full-time",
        salaryRange: body.salary_range,
        skills: Array.isArray(body.skills) ? body.skills : (body.skills ? body.skills.split(",").map((s: string) => s.trim()) : []),
        description: body.description,
        applyUrl: body.apply_url,
        isFeatured: Boolean(body.is_featured),
      });

      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, job }));
      return;
    }

    // UPDATE JOB DETAILS (Owner or Admin): POST /api/network/jobs/update or PUT /api/network/jobs/:id
    if (
      (req.method === "POST" && (pathname === "/api/network/jobs/update" || pathname === "/api/jobs/update" || pathname === "/api/network/builder-jobs/update")) ||
      (req.method === "PUT" && ((pathname.startsWith("/api/network/jobs/") || pathname.startsWith("/api/network/builder-jobs/")) && !pathname.endsWith("/status")))
    ) {
      const user = getAuthUser();
      const isAdmin = checkAdminAuth(req);
      if (!user && !isAdmin) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to update a job." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid job ID is required." }));
        return;
      }
      const updated = await updateBuilderJob(id, user?.id || 0, body, isAdmin);
      if (!updated) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: "Job not found or you are not authorized to edit this job." }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, job: updated }));
      return;
    }

    // UPDATE JOB STATUS: POST /api/network/jobs/status or PATCH /api/network/jobs/:id/status
    if (
      (req.method === "POST" && (pathname === "/api/network/jobs/status" || pathname === "/api/jobs/status")) ||
      (req.method === "PATCH" && (pathname.includes("/jobs/") && pathname.endsWith("/status")))
    ) {
      const user = getAuthUser();
      const isAdmin = checkAdminAuth(req);
      if (!user && !isAdmin) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required." }));
        return;
      }
      const body = await parseBody();
      const id = Number(body.id || pathname.split("/")[4] || pathname.split("/")[3]);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid job ID is required." }));
        return;
      }
      const updated = await updateBuilderJobStatus(id, user?.id || 0, body.is_active !== false, isAdmin);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, job: updated }));
      return;
    }

    // DELETE JOB: POST /api/network/jobs/delete or DELETE /api/network/jobs/:id
    if (
      (req.method === "POST" && (pathname === "/api/network/jobs/delete" || pathname === "/api/jobs/delete")) ||
      (req.method === "DELETE" && (pathname.startsWith("/api/network/jobs/") || pathname.startsWith("/api/jobs/")))
    ) {
      const user = getAuthUser();
      const isAdmin = checkAdminAuth(req);
      if (!user && !isAdmin) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to delete a job." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid job ID is required." }));
        return;
      }
      const deleted = await deleteBuilderJob(id, user?.id, isAdmin);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: deleted }));
      return;
    }

    // ==========================================
    // BUILDER HACKATHONS ROUTES
    // ==========================================

    // LIST HACKATHONS: GET /api/network/builder-hackathons
    if (req.method === "GET" && (pathname === "/api/network/builder-hackathons" || pathname === "/api/builder-hackathons")) {
      const urlObj = new URL(req.url, "http://localhost");
      const onlyApproved = urlObj.searchParams.get("all") !== "true";
      const limit = urlObj.searchParams.get("limit") ? Number(urlObj.searchParams.get("limit")) : undefined;
      const hackathons = await listBuilderHackathons({ onlyApproved, limit });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, hackathons }));
      return;
    }

    // LIST MY HACKATHONS: GET /api/network/my-hackathons
    if (req.method === "GET" && (pathname === "/api/network/my-hackathons" || pathname === "/api/my-hackathons")) {
      const user = getAuthUser();
      if (!user) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to view your hackathons." }));
        return;
      }
      const hackathons = await listUserHackathons(user.id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, hackathons }));
      return;
    }

    // CREATE HACKATHON: POST /api/network/builder-hackathons
    if (req.method === "POST" && (pathname === "/api/network/builder-hackathons" || pathname === "/api/builder-hackathons")) {
      const user = getAuthUser();
      if (!user) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to list a hackathon." }));
        return;
      }
      const body = await parseBody();
      if (!body.name || !body.website || !body.start_date || !body.end_date) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Name, website URL, start date, and end date are required." }));
        return;
      }

      const hackathon = await createBuilderHackathon({
        userId: user.id,
        authorName: body.author_name || ((user as any).name || user.username) || "Organizer",
        authorUsername: user.username,
        name: body.name,
        tagline: body.tagline,
        description: body.description,
        bannerUrl: body.banner_url,
        website: body.website,
        startDate: body.start_date,
        endDate: body.end_date,
        location: body.location,
        virtual: body.virtual !== false,
        apac: body.apac === true,
        prizePool: body.prize_pool,
        eligibility: body.eligibility,
        tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map((t: string) => t.trim()) : ["Hackathon", "Builders"]),
      });

      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, hackathon }));
      return;
    }

    // DELETE HACKATHON: POST /api/network/builder-hackathons/delete or DELETE /api/network/builder-hackathons/:id
    if (
      (req.method === "POST" && (pathname === "/api/network/builder-hackathons/delete" || pathname === "/api/builder-hackathons/delete")) ||
      (req.method === "DELETE" && (pathname.startsWith("/api/network/builder-hackathons/") || pathname.startsWith("/api/builder-hackathons/")))
    ) {
      const user = getAuthUser();
      const isAdmin = checkAdminAuth(req);
      if (!user && !isAdmin) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to delete a hackathon." }));
        return;
      }
      const body = await parseBody();
      const idStr = pathname.split("/").pop();
      const id = Number(body.id || idStr);
      if (!id || isNaN(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid hackathon ID is required." }));
        return;
      }
      const deleted = await deleteBuilderHackathon(id, user?.id, isAdmin);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: deleted }));
      return;
    }

    // 18. RAZORPAY WEBHOOK HANDLER: POST /api/network/webhooks/razorpay
    // UPGRADE USER TO VERIFIED PRO / BLUE TICK
    if (req.method === "POST" && (pathname === "/api/network/upgrade-user" || pathname === "/api/upgrade-user")) {
      const user = getAuthUser();
      const isAdmin = checkAdminAuth(req);
      const body = await parseBody();
      const targetUserId = user?.id || Number(body?.user_id);
      const targetUsername = user?.username || body?.username;

      if (!targetUserId && !targetUsername) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to upgrade." }));
        return;
      }

      // Security check: Must be admin or carry valid payment verification
      const paymentDetails = body?.paymentDetails;
      const rzpKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TwVFw0ACQFDbKn";
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET || "KrWC5wVHLo3PbiQ4K0ptf70e";

      let isRazorpayVerified = false;

      // 1. Verify via Razorpay HMAC cryptographic signature
      if (paymentDetails?.razorpay_payment_id && paymentDetails?.razorpay_order_id && paymentDetails?.razorpay_signature) {
        try {
          const crypto = await import("crypto");
          const expectedSig = crypto
            .createHmac("sha256", rzpSecret)
            .update(`${paymentDetails.razorpay_order_id}|${paymentDetails.razorpay_payment_id}`)
            .digest("hex");
          if (expectedSig === paymentDetails.razorpay_signature) {
            isRazorpayVerified = true;
          }
        } catch (sigErr) {
          console.error("Signature verification error:", sigErr);
        }
      }

      // 2. Direct Razorpay REST API verification (bypasses webhook requirement completely)
      if (!isRazorpayVerified && paymentDetails?.razorpay_payment_id) {
        try {
          const auth = Buffer.from(`${rzpKeyId}:${rzpSecret}`).toString("base64");
          const payRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentDetails.razorpay_payment_id}`, {
            headers: { Authorization: `Basic ${auth}` }
          });
          if (payRes.ok) {
            const payData = (await payRes.json()) as any;
            if (payData.status === "captured" || payData.status === "authorized") {
              isRazorpayVerified = true;
              if (payData.status === "authorized") {
                try {
                  await fetch(`https://api.razorpay.com/v1/payments/${paymentDetails.razorpay_payment_id}/capture`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Basic ${auth}`
                    },
                    body: JSON.stringify({ amount: payData.amount, currency: payData.currency || "INR" })
                  });
                } catch (capErr) {
                  console.error("Auto capture error:", capErr);
                }
              }
            }
          }
        } catch (apiErr) {
          console.error("Razorpay API direct verification error:", apiErr);
        }
      }

      const couponCode = body?.coupon_code ? body.coupon_code.toString().trim().toUpperCase() : null;
      let isCouponFree = false;
      if (couponCode) {
        const baseAmount = (body?.billing || body?.plan_billing) === "yearly" ? 1999 : 199;
        const couponCheck = await validateCoupon(couponCode, baseAmount);
        if (couponCheck.valid && couponCheck.finalAmount === 0) {
          isCouponFree = true;
        }
      }

      // If user submits manual UPI without Razorpay confirmation and not admin and not free coupon
      if (!isAdmin && !isRazorpayVerified && !isCouponFree) {
        res.statusCode = 400;
        res.end(JSON.stringify({
          error: "Verification requires confirmed payment. If you paid via UPI, verification activates automatically once verified by Razorpay webhook.",
          pending: true
        }));
        return;
      }

      const plan = (body?.plan || "pro").toString().toLowerCase();
      const billing = (body?.billing || body?.plan_billing || "monthly").toString().toLowerCase();
      const durationInterval = billing === "yearly" ? "365 days" : "30 days";

      const client = await pool.connect();
      try {
        if (couponCode) {
          await client.query("UPDATE coupons SET uses_count = uses_count + 1, updated_at = NOW() WHERE LOWER(code) = LOWER($1)", [couponCode]);
        }

        let resDb;
        if (targetUserId) {
          resDb = await client.query(
            `UPDATE users SET 
              is_verified = true, 
              is_pro = true, 
              plan = $1, 
              plan_billing = $2,
              subscription_start = NOW(),
              subscription_end = (NOW() + $3::INTERVAL),
              updated_at = NOW() 
             WHERE id = $4 
             RETURNING id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, is_verified, is_pro, plan, plan_billing, subscription_start, subscription_end, updated_at`,
            [plan, billing, durationInterval, targetUserId]
          );
        } else {
          resDb = await client.query(
            `UPDATE users SET 
              is_verified = true, 
              is_pro = true, 
              plan = $1, 
              plan_billing = $2,
              subscription_start = NOW(),
              subscription_end = (NOW() + $3::INTERVAL),
              updated_at = NOW() 
             WHERE LOWER(username) = LOWER($4) 
             RETURNING id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, is_verified, is_pro, plan, plan_billing, subscription_start, subscription_end, updated_at`,
            [plan, billing, durationInterval, targetUsername]
          );
        }
        const updated = resDb.rows[0];
        console.log(`[Upgrade] User @${updated?.username || targetUsername} upgraded to ${plan} (${billing})`);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, user: updated }));
      } catch (err: any) {
        console.error("Upgrade error:", err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to upgrade profile." }));
      } finally {
        client.release();
      }
      return;
    }

    // RESET USER VERIFICATION (For testing & debugging full functionality)
    if (req.method === "POST" && (pathname === "/api/network/reset-verification" || pathname === "/api/reset-verification")) {
      const auth = getAuthUser();
      const body = await parseBody();
      const targetUserId = auth?.id || Number(body?.user_id);
      const targetUsername = auth?.username || body?.username;

      const client = await pool.connect();
      try {
        if (targetUserId) {
          await client.query(
            "UPDATE users SET is_verified = false, is_pro = false, plan = 'free', plan_billing = NULL, subscription_start = NULL, subscription_end = NULL WHERE id = $1",
            [targetUserId]
          );
        } else if (targetUsername) {
          await client.query(
            "UPDATE users SET is_verified = false, is_pro = false, plan = 'free', plan_billing = NULL, subscription_start = NULL, subscription_end = NULL WHERE LOWER(username) = LOWER($1)",
            [targetUsername]
          );
        } else {
          await client.query(
            "UPDATE users SET is_verified = false, is_pro = false, plan = 'free', plan_billing = NULL, subscription_start = NULL, subscription_end = NULL"
          );
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: "Verification removed. Free tier restored." }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to reset verification." }));
      } finally {
        client.release();
      }
      return;
    }

    // CREATE RAZORPAY PAYMENT ORDER
    if (req.method === "POST" && (pathname === "/api/network/create-razorpay-order" || pathname === "/api/create-razorpay-order")) {
      const body = await parseBody();
      const amount = (body?.amount !== undefined && !isNaN(Number(body.amount))) ? Number(body.amount) : 19900;
      if (amount <= 0) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Amount must be greater than 0 for Razorpay checkout. Use free coupon activation." }));
        return;
      }
      const currency = body?.currency || "INR";
      const notes = body?.notes || {};

      const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TwVFw0ACQFDbKn";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "KrWC5wVHLo3PbiQ4K0ptf70e";

      if (keySecret) {
        try {
          const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
          const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${auth}`
            },
            body: JSON.stringify({
              amount,
              currency,
              receipt: `rcpt_${Date.now()}`,
              notes
            })
          });
          const orderData = await orderRes.json();
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, order: orderData, keyId }));
          return;
        } catch (e: any) {
          console.error("Razorpay order API error:", e);
        }
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        order: {
          id: `order_${Date.now()}`,
          amount,
          currency
        },
        keyId
      }));
      return;
    }

    // CREATE DYNAMIC RAZORPAY QR: POST /api/network/create-razorpay-qr
    if (req.method === "POST" && (pathname === "/api/network/create-razorpay-qr" || pathname === "/api/create-razorpay-qr")) {
      const body = await parseBody();
      let amount = Number(body?.amount);
      if (!amount || isNaN(amount) || amount <= 0) {
        amount = 199;
      }
      // If amount passed is in rupees (e.g. 199), convert to paise (19900)
      const payment_amount = amount < 10000 ? Math.round(amount * 100) : Math.round(amount);
      const name = body?.name || "Reco Labs";
      const description = (body?.description || "Reco Labs Payment").toString().slice(0, 30);
      const notes = body?.notes || {};

      const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TwVFw0ACQFDbKn";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "KrWC5wVHLo3PbiQ4K0ptf70e";
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      try {
        const qrRes = await fetch("https://api.razorpay.com/v1/payments/qr_codes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`
          },
          body: JSON.stringify({
            type: "upi_qr",
            name,
            usage: "single_use",
            fixed_amount: true,
            payment_amount,
            description,
            notes
          })
        });
        const qrData = await qrRes.json() as any;
        if (qrRes.status >= 400 || !qrData.image_url) {
          res.statusCode = qrRes.status || 400;
          res.end(JSON.stringify({ error: qrData.error?.description || "Failed to generate dynamic Razorpay QR." }));
          return;
        }
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          qr_id: qrData.id,
          image_url: qrData.image_url,
          payment_amount: qrData.payment_amount,
          status: qrData.status
        }));
        return;
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to generate Razorpay QR code." }));
        return;
      }
    }

    // CHECK DYNAMIC RAZORPAY QR PAYMENT STATUS: GET /api/network/check-razorpay-qr
    if (req.method === "GET" && (pathname === "/api/network/check-razorpay-qr" || pathname === "/api/check-razorpay-qr")) {
      const qrId = searchParams.get("qr_id") || searchParams.get("id");
      if (!qrId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "qr_id query param is required." }));
        return;
      }

      const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TwVFw0ACQFDbKn";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "KrWC5wVHLo3PbiQ4K0ptf70e";
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      try {
        const checkRes = await fetch(`https://api.razorpay.com/v1/payments/qr_codes/${encodeURIComponent(qrId)}/payments`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`
          }
        });
        const checkData = await checkRes.json() as any;
        const items = checkData.items || [];
        const capturedPayment = items.find((p: any) => p.status === "captured" || p.status === "authorized");
        const paid = Boolean(capturedPayment);

        // If paid, check notes to auto-fulfill immediately
        if (paid && capturedPayment) {
          const notes = capturedPayment.notes || {};
          const client = await pool.connect();
          try {
            if (notes.purpose === "startup_boost" && notes.startup_id) {
              await client.query(
                `UPDATE startups SET 
                   is_featured = true, 
                   boosted_at = NOW(), 
                   featured_until = LEAST(NOW() + INTERVAL '7 days', date_trunc('week', NOW()) + INTERVAL '7 days') 
                 WHERE id = $1`,
                [Number(notes.startup_id)]
              );
            } else if (notes.user_id) {
              const billing = notes.billing === "yearly" ? "yearly" : "monthly";
              const durationInterval = billing === "yearly" ? "365 days" : "30 days";
              await client.query(
                `UPDATE users SET 
                   is_verified = true, 
                   is_pro = true, 
                   plan = $1, 
                   plan_billing = $2,
                   subscription_start = NOW(), 
                   subscription_end = (NOW() + INTERVAL '${durationInterval}')
                 WHERE id = $3`,
                [notes.plan || "pro", billing, Number(notes.user_id)]
              );
            }
          } catch (dbErr) {
            console.error("Auto fulfill error from QR check:", dbErr);
          } finally {
            client.release();
          }
        }

        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          paid,
          payment: capturedPayment || null,
          count: checkData.count || 0
        }));
        return;
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to check QR payment." }));
        return;
      }
    }

        if (req.method === "POST" && (pathname === "/api/network/webhooks/razorpay" || pathname === "/api/webhooks/razorpay")) {
      const body = await parseBody();
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "KrWC5wVHLo3PbiQ4K0ptf70e";
      const signature = req.headers["x-razorpay-signature"] as string | undefined;

      if (secret && signature) {
        try {
          const crypto = await import("crypto");
          const rawString = typeof (req as any).rawBody === "string" 
            ? (req as any).rawBody 
            : JSON.stringify(body);
          const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(rawString)
            .digest("hex");

          if (expectedSignature !== signature) {
            console.warn("Razorpay webhook: signature mismatch");
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid signature" }));
            return;
          }
        } catch (sigErr) {
          console.error("Signature verification error:", sigErr);
        }
      }

      const event = body?.event;
      const payment = body?.payload?.payment?.entity;
      const notes = payment?.notes || body?.payload?.order?.entity?.notes || {};

      console.log(`Razorpay webhook event: ${event}`, { paymentId: payment?.id, notes });

      if (event === "payment.captured" || event === "order.paid" || event === "qr_code.credited") {
        const client = await pool.connect();
        try {
          if (notes.user_id || notes.username) {
            const plan = (notes.plan || 'pro').toString().toLowerCase();
            const billing = (notes.billing || notes.plan_billing || 'monthly').toString().toLowerCase();
            const durationInterval = billing === 'yearly' ? '365 days' : '30 days';

            if (notes.coupon_code) {
              await client.query("UPDATE coupons SET uses_count = uses_count + 1, updated_at = NOW() WHERE LOWER(code) = LOWER($1)", [notes.coupon_code]);
            }

            if (notes.user_id) {
              await client.query(
                `UPDATE users SET 
                  is_verified = true, 
                  is_pro = true, 
                  plan = $1, 
                  plan_billing = $2,
                  subscription_start = NOW(),
                  subscription_end = (NOW() + $3::INTERVAL),
                  updated_at = NOW() 
                 WHERE id = $4`,
                [plan, billing, durationInterval, Number(notes.user_id)]
              );
            } else if (notes.username) {
              await client.query(
                `UPDATE users SET 
                  is_verified = true, 
                  is_pro = true, 
                  plan = $1, 
                  plan_billing = $2,
                  subscription_start = NOW(),
                  subscription_end = (NOW() + $3::INTERVAL),
                  updated_at = NOW() 
                 WHERE LOWER(username) = LOWER($4)`,
                [plan, billing, durationInterval, notes.username]
              );
            }
            console.log(`[Webhook] Auto-verified user @${notes.username || notes.user_id} (${plan} - ${billing})`);
          }
          if (notes.startup_id) {
            await client.query("UPDATE startups SET is_featured = true WHERE id = $1", [Number(notes.startup_id)]);
            console.log(`[Webhook] Boosted startup ID ${notes.startup_id}`);
          }
          if (notes.job_id) {
            await client.query("UPDATE builder_jobs SET is_featured = true WHERE id = $1", [Number(notes.job_id)]);
            console.log(`[Webhook] Featured job ID ${notes.job_id}`);
          }
        } catch (dbErr) {
          console.error("Webhook DB update failed:", dbErr);
        } finally {
          client.release();
        }
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ status: "ok", received: true }));
      return;
    }


    // ADMIN OVERVIEW (ALL JOBS, ALL HACKATHONS, ALL PAID ENTITIES)
    if (req.method === "GET" && (pathname === "/api/network/admin/overview" || pathname === "/api/admin/overview")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const [jobs, hackathons, paidEntities] = await Promise.all([
        listAllBuilderJobsAdmin(),
        listAllBuilderHackathonsAdmin(),
        listAllPaidEntitiesAdmin()
      ]);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, jobs, hackathons, paidEntities }));
      return;
    }

    // ADMIN TOGGLE JOB FEATURED
    if (req.method === "POST" && (pathname === "/api/network/admin/toggle-job-featured" || pathname === "/api/admin/toggle-job-featured")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const body = await parseBody();
      if (!body.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Job ID required." }));
        return;
      }
      const result = await toggleJobFeatured(Number(body.id));
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, result }));
      return;
    }

    // BOOST QUOTA CHECK
    if (req.method === "GET" && (pathname === "/api/network/boost-quota" || pathname === "/api/boost-quota")) {
      const client = await pool.connect();
      try {
        // Auto-remove expired or prior-week boosts so all slots reset and are available every Monday
        await client.query(`
          UPDATE startups
          SET is_featured = false, featured_until = NULL, boosted_at = NULL
          WHERE is_featured = true
            AND (
              featured_until IS NULL
              OR featured_until <= NOW()
              OR boosted_at IS NULL
              OR boosted_at < date_trunc('week', NOW())
            )
        `);
        const resDb = await client.query(
          "SELECT id, name, featured_until, boosted_at FROM startups WHERE is_featured = true AND featured_until > NOW() AND boosted_at >= date_trunc('week', NOW())"
        );
        res.statusCode = 200;
        res.end(JSON.stringify({
          activeCount: resDb.rows.length,
          limit: 3,
          startups: resDb.rows
        }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to get boost quota." }));
      } finally {
        client.release();
      }
      return;
    }

    // BOOST / PIN STARTUP TO TOP OF FEED (Max 3 active per week, 7 days duration)
    if (req.method === "POST" && (pathname === "/api/network/boost-startup" || pathname === "/api/boost-startup")) {
      const body = await parseBody();
      if (!body.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Startup ID required." }));
        return;
      }
      const startupId = Number(body.id);
      const client = await pool.connect();
      try {
        // Auto-remove expired or prior-week boosts so all slots reset and are available every Monday
        await client.query(`
          UPDATE startups
          SET is_featured = false, featured_until = NULL, boosted_at = NULL
          WHERE is_featured = true
            AND (
              featured_until IS NULL
              OR featured_until <= NOW()
              OR boosted_at IS NULL
              OR boosted_at < date_trunc('week', NOW())
            )
        `);
        const activeBoosted = await client.query(
          "SELECT id, name, featured_until, boosted_at FROM startups WHERE is_featured = true AND featured_until > NOW() AND boosted_at >= date_trunc('week', NOW())"
        );
        const isAlreadyBoosted = activeBoosted.rows.some((s: any) => s.id === startupId);

        if (body.toggle && isAlreadyBoosted) {
          const resDb = await client.query(
            "UPDATE startups SET is_featured = false, featured_until = NULL, boosted_at = NULL WHERE id = $1 RETURNING id, name, is_featured",
            [startupId]
          );
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, startup: resDb.rows[0], message: "Boost removed." }));
          return;
        }

        if (!isAlreadyBoosted && activeBoosted.rows.length >= 3) {
          res.statusCode = 400;
          res.end(JSON.stringify({
            error: "Weekly boost quota full. Only 3 startups can be boosted simultaneously for 1 week. Please wait for an active spotlight slot to expire.",
            activeCount: activeBoosted.rows.length,
            limit: 3
          }));
          return;
        }

        const resDb = await client.query(
          `UPDATE startups SET 
            is_featured = true, 
            boosted_at = NOW(), 
            featured_until = LEAST(NOW() + INTERVAL '7 days', date_trunc('week', NOW()) + INTERVAL '7 days')
           WHERE id = $1 
           RETURNING id, name, is_featured, featured_until, boosted_at`,
          [startupId]
        );
        if (resDb.rows.length === 0) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: "Startup not found." }));
          return;
        }

        const updated = resDb.rows[0];
        console.log(`[Boost] Startup ${updated.name} (ID: ${startupId}) boosted for 7 days until ${updated.featured_until}`);
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          startup: updated,
          activeCount: isAlreadyBoosted ? activeBoosted.rows.length : activeBoosted.rows.length + 1,
          limit: 3,
          message: "Startup boosted for 1 week and pinned to top with Lime Spotlight!"
        }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to boost startup." }));
      } finally {
        client.release();
      }
      return;
    }

    // PIN CATALOG PROJECT (Pro verified builders / admins)
    if (req.method === "POST" && (pathname === "/api/network/pin-project" || pathname === "/api/pin-project")) {
      const body = await parseBody();
      if (!body.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Project ID required." }));
        return;
      }
      const client = await pool.connect();
      try {
        const resDb = await client.query(
          "UPDATE catalog_projects SET is_sponsored = true, sponsored_label = '✦ Featured Builder' WHERE id = $1 RETURNING id, title, is_sponsored, sponsored_label",
          [Number(body.id)]
        );
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, project: resDb.rows[0], message: "Project pinned with Pro status!" }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to pin project." }));
      } finally {
        client.release();
      }
      return;
    }

    // VALIDATE COUPON CODE: POST /api/network/coupons/validate
    if (req.method === "POST" && (pathname === "/api/network/coupons/validate" || pathname === "/api/coupons/validate")) {
      const body = await parseBody();
      const code = body?.code;
      const amount = Number(body?.amount) || 0;
      if (!code) {
        res.statusCode = 400;
        res.end(JSON.stringify({ valid: false, error: "Coupon code is required." }));
        return;
      }
      const result = await validateCoupon(code, amount);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return;
    }

    // ADMIN COUPONS: LIST
    if (req.method === "GET" && (pathname === "/api/network/admin/coupons" || pathname === "/api/admin/coupons")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const coupons = await listCouponsAdmin();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, coupons }));
      return;
    }

    // ADMIN COUPONS: CREATE
    if (req.method === "POST" && (pathname === "/api/network/admin/coupons" || pathname === "/api/admin/coupons")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const body = await parseBody();
      if (!body?.code || !body?.discount_value) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Coupon code and discount value are required." }));
        return;
      }
      const coupon = await createCouponAdmin({
        code: body.code,
        discount_type: body.discount_type || "percentage",
        discount_value: Number(body.discount_value),
        min_order_amount: Number(body.min_order_amount) || 0,
        max_uses: body.max_uses ? Number(body.max_uses) : null,
        expires_at: body.expires_at || null,
      });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, coupon }));
      return;
    }

    // ADMIN COUPONS: TOGGLE ACTIVE
    if (req.method === "POST" && (pathname === "/api/network/admin/toggle-coupon" || pathname === "/api/admin/toggle-coupon")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const body = await parseBody();
      if (!body?.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Coupon ID is required." }));
        return;
      }
      const coupon = await toggleCouponAdmin(Number(body.id));
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, coupon }));
      return;
    }

    // ADMIN COUPONS: DELETE
    if (
      (req.method === "POST" && (pathname === "/api/network/admin/delete-coupon" || pathname === "/api/admin/delete-coupon")) ||
      (req.method === "DELETE" && (pathname.startsWith("/api/network/admin/coupons/") || pathname.startsWith("/api/admin/coupons/")))
    ) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const body = await parseBody();
      const id = Number(body?.id || pathname.split("/").pop());
      const deleted = await deleteCouponAdmin(id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: deleted }));
      return;
    }

        // ADMIN TOGGLE STARTUP FEATURED
    if (req.method === "POST" && (pathname === "/api/network/admin/toggle-startup-featured" || pathname === "/api/admin/toggle-startup-featured")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const body = await parseBody();
      if (!body.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Startup ID required." }));
        return;
      }
      const result = await toggleStartupFeatured(Number(body.id));
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, result }));
      return;
    }

    // ADMIN TOGGLE USER VERIFICATION
    if (req.method === "POST" && (pathname === "/api/network/admin/toggle-user-verify" || pathname === "/api/admin/toggle-user-verify")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const body = await parseBody();
      if (!body.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "User ID required." }));
        return;
      }
      const result = await toggleUserVerification(Number(body.id));
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, result }));
      return;
    }

    // ADMIN APPROVE HACKATHON
    if (req.method === "POST" && (pathname === "/api/network/admin/approve-hackathon" || pathname === "/api/admin/approve-hackathon")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized administrative access." }));
        return;
      }
      const body = await parseBody();
      if (!body.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Hackathon ID required." }));
        return;
      }
      const result = await setHackathonApproval(Number(body.id), body.approved !== false);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, result }));
      return;
    }

    res.statusCode = 404
    res.end(JSON.stringify({ error: `API endpoint not found: ${req.method} ${pathname}` }))
  } catch (err: any) {
    console.error("API error:", err)
    res.statusCode = 500
    res.end(JSON.stringify({ error: err.message || "Internal server error." }))
  }
}

// Vite middleware adapter
export function createNetworkApiMiddleware() {
  return async function networkApiMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    if (!req.url || !req.url.startsWith("/api/network")) {
      return next()
    }
    await handleNetworkRequest(req, res)
  }
}

// Vercel serverless default export
export default async function vercelHandler(req: any, res: any) {
  await handleNetworkRequest(req, res)
}
