import pg from "pg"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const { Pool } = pg

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres.zjpbrdbdkkzczdwsgizj:Aditya%401060A@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
const JWT_SECRET = process.env.JWT_SECRET || "recolabs_jwt_secret_key_2026_super_secure"

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Helper to sanitize username
export function cleanUsername(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30)
}

// Generate unique username fallback
async function generateUniqueUsername(client: any, base: string): Promise<string> {
  const clean = cleanUsername(base) || "builder"
  let candidate = clean
  let counter = 1

  while (true) {
    const res = await client.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER($1)",
      [candidate]
    )
    if (res.rows.length === 0) return candidate
    candidate = `${clean}${counter}`
    counter++
  }
}

// Auto-init schema if not exists
export async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        name TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        bio TEXT,
        twitter TEXT,
        github TEXT,
        discord TEXT,
        auth_provider TEXT DEFAULT 'email',
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS startups (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        founder_username TEXT,
        founder_name TEXT NOT NULL,
        founder_email TEXT,
        founder_phone TEXT,
        founder_website TEXT,
        founder_discord TEXT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        problem_solving TEXT NOT NULL,
        category TEXT DEFAULT 'Software',
        stage TEXT DEFAULT 'Prototype',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
      CREATE INDEX IF NOT EXISTS idx_startups_category ON startups(category);
      CREATE INDEX IF NOT EXISTS idx_startups_created_at ON startups(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_startups_founder_username ON startups(LOWER(founder_username));

      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        destination_url TEXT NOT NULL,
        placement TEXT DEFAULT 'projects_sidebar',
        badge_label TEXT DEFAULT 'Sponsored',
        sponsor_name TEXT,
        sponsor_email TEXT,
        is_active BOOLEAN DEFAULT true,
        clicks_count INTEGER DEFAULT 0,
        impressions_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS store_links (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        category TEXT DEFAULT 'Tools',
        price TEXT,
        icon_url TEXT,
        is_active BOOLEAN DEFAULT true,
        clicks_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_ads_placement ON ads(placement);
      CREATE INDEX IF NOT EXISTS idx_ads_is_active ON ads(is_active);
      CREATE INDEX IF NOT EXISTS idx_store_links_category ON store_links(category);

      CREATE TABLE IF NOT EXISTS catalog_projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT DEFAULT 'Finds',
        description TEXT,
        author TEXT DEFAULT 'Community',
        author_handle TEXT DEFAULT 'builder',
        thumbnail_bg TEXT DEFAULT '#121214',
        visual_type TEXT DEFAULT 'screenshot',
        preview_image_url TEXT,
        tags TEXT[] DEFAULT ARRAY['Community', 'Curated']::TEXT[],
        stars INTEGER DEFAULT 1,
        is_sponsored BOOLEAN DEFAULT false,
        sponsored_label TEXT,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE catalog_projects ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
      CREATE INDEX IF NOT EXISTS idx_catalog_projects_approved ON catalog_projects(is_approved);
      CREATE INDEX IF NOT EXISTS idx_catalog_projects_category ON catalog_projects(LOWER(category));

      CREATE TABLE IF NOT EXISTS project_sections (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT DEFAULT 'Layers',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      INSERT INTO project_sections (name, slug, icon, sort_order) VALUES
        ('Design', 'design', 'Palette', 1),
        ('Develop', 'develop', 'Code', 2),
        ('Resources', 'resources', 'Box', 3)
      ON CONFLICT (slug) DO NOTHING;

      CREATE TABLE IF NOT EXISTS project_comments (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        user_id INTEGER,
        author_name TEXT NOT NULL,
        author_username TEXT,
        author_avatar TEXT,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'feedback',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id);

      CREATE TABLE IF NOT EXISTS startup_comments (
        id SERIAL PRIMARY KEY,
        startup_id INTEGER NOT NULL,
        user_id INTEGER,
        author_name TEXT NOT NULL,
        author_username TEXT,
        author_avatar TEXT,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_startup_comments_startup ON startup_comments(startup_id);

      CREATE TABLE IF NOT EXISTS startup_ratings (
        id SERIAL PRIMARY KEY,
        startup_id INTEGER NOT NULL,
        user_id INTEGER,
        idea_score NUMERIC(3, 1) DEFAULT 5.0,
        execution_score NUMERIC(3, 1) DEFAULT 5.0,
        design_score NUMERIC(3, 1) DEFAULT 5.0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_startup_ratings_startup ON startup_ratings(startup_id);

      CREATE TABLE IF NOT EXISTS builder_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name TEXT NOT NULL,
        author_username TEXT,
        title TEXT NOT NULL,
        company_name TEXT NOT NULL,
        company_logo TEXT,
        location TEXT DEFAULT 'Remote',
        is_remote BOOLEAN DEFAULT true,
        job_type TEXT DEFAULT 'Full-time',
        salary_range TEXT,
        skills TEXT[] DEFAULT '{}',
        description TEXT NOT NULL,
        apply_url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_builder_jobs_active ON builder_jobs(is_active);
      CREATE INDEX IF NOT EXISTS idx_builder_jobs_user ON builder_jobs(user_id);
      CREATE INDEX IF NOT EXISTS idx_builder_jobs_created ON builder_jobs(created_at DESC);
      ALTER TABLE startups ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
      ALTER TABLE builder_jobs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_billing TEXT DEFAULT 'monthly';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(20) DEFAULT 'percentage',
        discount_value NUMERIC(10, 2) NOT NULL,
        min_order_amount NUMERIC(10, 2) DEFAULT 0,
        max_uses INTEGER DEFAULT NULL,
        uses_count INTEGER DEFAULT 0,
        expires_at TIMESTAMPTZ DEFAULT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(LOWER(code));

      INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
      VALUES 
        ('BUILDER50', 'percentage', 50.00, 100, true),
        ('RECO100', 'flat', 100.00, 200, true)
      ON CONFLICT (code) DO NOTHING;

      CREATE TABLE IF NOT EXISTS builder_hackathons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name TEXT NOT NULL,
        author_username TEXT,
        name TEXT NOT NULL,
        tagline TEXT,
        description TEXT,
        banner_url TEXT,
        website TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        location TEXT DEFAULT 'Virtual',
        virtual BOOLEAN DEFAULT true,
        apac BOOLEAN DEFAULT false,
        prize_pool TEXT,
        eligibility TEXT DEFAULT 'Open to all builders',
        tags TEXT[] DEFAULT ARRAY['Hackathon', 'Builders']::TEXT[],
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_builder_hackathons_approved ON builder_hackathons(is_approved);
      CREATE INDEX IF NOT EXISTS idx_builder_hackathons_user ON builder_hackathons(user_id);
      CREATE INDEX IF NOT EXISTS idx_builder_hackathons_start ON builder_hackathons(start_date DESC);
    `)
  } finally {
    client.release()
  }
}

// User signup
export async function createUser({
  name,
  username,
  email,
  password,
  phone,
  website,
  bio,
  discord,
  github,
}: {
  name: string
  username?: string
  email: string
  password: string
  phone?: string
  website?: string
  bio?: string
  discord?: string
  github?: string
}) {
  const passwordHash = await bcrypt.hash(password, 10)
  const client = await pool.connect()
  try {
    let finalUsername = username ? cleanUsername(username) : ""
    if (finalUsername) {
      const existing = await client.query(
        "SELECT id FROM users WHERE LOWER(username) = LOWER($1)",
        [finalUsername]
      )
      if (existing.rows.length > 0) {
        throw new Error(`Username @${finalUsername} is already taken. Please choose another.`)
      }
    } else {
      finalUsername = await generateUniqueUsername(client, name || email.split("@")[0])
    }

    const res = await client.query(
      `INSERT INTO users (name, username, email, password_hash, phone, website, bio, discord, github, auth_provider)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'email')
       RETURNING id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, created_at`,
      [
        name,
        finalUsername,
        email.toLowerCase().trim(),
        passwordHash,
        phone || null,
        website || null,
        bio || null,
        discord || null,
        github || null,
      ]
    )
    const user = res.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "30d",
    })
    return { user, token }
  } finally {
    client.release()
  }
}

// User login
export async function loginUser({ email, password }: { email: string; password: string }) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `SELECT id, name, username, email, password_hash, phone, website, bio, discord, github, auth_provider, avatar_url, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    if (res.rows.length === 0) {
      throw new Error("Invalid email or password.")
    }
    const user = res.rows[0]
    if (!user.password_hash) {
      throw new Error("This account uses social sign in (Google or GitHub).")
    }
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      throw new Error("Invalid email or password.")
    }
    delete user.password_hash
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "30d",
    })
    return { user, token }
  } finally {
    client.release()
  }
}

// OAuth Sync / Sign in
export async function syncOAuthUser({
  email,
  name,
  avatarUrl,
  provider,
  preferredUsername,
}: {
  email: string
  name: string
  avatarUrl?: string
  provider: "google" | "github"
  preferredUsername?: string
}) {
  const client = await pool.connect()
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const existing = await client.query(
      `SELECT id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, created_at
       FROM users WHERE email = $1`,
      [normalizedEmail]
    )

    let user: any
    if (existing.rows.length > 0) {
      user = existing.rows[0]
      // Update avatar if provided
      if (avatarUrl && !user.avatar_url) {
        const updateRes = await client.query(
          "UPDATE users SET avatar_url = $1, auth_provider = $2 WHERE id = $3 RETURNING *",
          [avatarUrl, provider, user.id]
        )
        user = updateRes.rows[0]
      }
    } else {
      const generatedUsername = await generateUniqueUsername(
        client,
        preferredUsername || name || normalizedEmail.split("@")[0]
      )
      const insertRes = await client.query(
        `INSERT INTO users (name, username, email, avatar_url, auth_provider)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, created_at`,
        [name || "Builder", generatedUsername, normalizedEmail, avatarUrl || null, provider]
      )
      user = insertRes.rows[0]
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "30d",
    })
    return { user, token }
  } finally {
    client.release()
  }
}

// Verify token
export function verifyToken(token: string): { id: number; email: string; username?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; username?: string }
  } catch {
    return null
  }
}

// Get user profile by ID
export async function getUserById(id: number) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `SELECT id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, 
              COALESCE(is_verified, false) as is_verified, 
              COALESCE(is_pro, false) as is_pro, 
              COALESCE(plan, 'free') as plan, 
              COALESCE(plan_billing, 'monthly') as plan_billing, 
              subscription_start, subscription_end, created_at
       FROM users WHERE id = $1`,
      [id]
    )
    return res.rows[0] || null
  } finally {
    client.release()
  }
}

// Get user profile by Username
export async function getUserByUsername(username: string) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `SELECT id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, 
              COALESCE(is_verified, false) as is_verified, 
              COALESCE(is_pro, false) as is_pro, 
              COALESCE(plan, 'free') as plan, 
              COALESCE(plan_billing, 'monthly') as plan_billing, 
              subscription_start, subscription_end, created_at
       FROM users WHERE LOWER(username) = LOWER($1)`,
      [username.trim()]
    )
    return res.rows[0] || null
  } finally {
    client.release()
  }
}

// Update profile
export async function updateUserProfile(
  id: number,
  {
    name,
    username,
    phone,
    website,
    bio,
    discord,
    github,
  }: {
    name?: string
    username?: string
    phone?: string
    website?: string
    bio?: string
    discord?: string
    github?: string
  }
) {
  const client = await pool.connect()
  try {
    let finalUsername: string | undefined = undefined
    if (username) {
      finalUsername = cleanUsername(username)
      const conflict = await client.query(
        "SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2",
        [finalUsername, id]
      )
      if (conflict.rows.length > 0) {
        throw new Error(`Username @${finalUsername} is already taken.`)
      }
    }

    const res = await client.query(
      `UPDATE users
       SET name = COALESCE($2, name),
           username = COALESCE($3, username),
           phone = $4,
           website = $5,
           bio = $6,
           discord = $7,
           github = $8,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, updated_at`,
      [id, name, finalUsername || null, phone || null, website || null, bio || null, discord || null, github || null]
    )

    // Sync startups founder_username if username changed
    if (finalUsername) {
      await client.query("UPDATE startups SET founder_username = $1 WHERE user_id = $2", [
        finalUsername,
        id,
      ])
    }

    return res.rows[0]
  } finally {
    client.release()
  }
}

// List startups
export async function listStartups({
  search,
  category,
  username,
  userId,
}: { search?: string; category?: string; username?: string; userId?: number } = {}) {
  const client = await pool.connect()
  try {
    let query = `
      SELECT s.id, s.name, s.url, s.problem_solving, s.category, s.stage, s.created_at,
             (COALESCE(s.is_featured, false) AND (s.featured_until IS NULL OR s.featured_until > NOW())) as is_featured,
             s.featured_until, s.boosted_at,
             s.founder_name, s.founder_username, s.founder_email, s.founder_phone, s.founder_website, s.founder_discord,
             s.user_id,
             u.name as author_name, u.username as author_username, u.phone as author_phone, u.website as author_website, u.avatar_url as author_avatar, u.avatar_url,
             COALESCE(u.is_verified, false) as is_verified, COALESCE(u.is_pro, false) as is_pro
      FROM startups s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (userId && username && username.trim()) {
      params.push(userId)
      params.push(username.trim().toLowerCase())
      query += ` AND (s.user_id = $${params.length - 1} OR LOWER(s.founder_username) = $${params.length} OR LOWER(u.username) = $${params.length})`
    } else if (userId) {
      params.push(userId)
      query += ` AND s.user_id = $${params.length}`
    } else if (username && username.trim()) {
      params.push(username.trim().toLowerCase())
      query += ` AND (LOWER(s.founder_username) = $${params.length} OR LOWER(u.username) = $${params.length})`
    }

    if (category && category !== "ALL") {
      params.push(category)
      query += ` AND s.category = $${params.length}`
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`)
      query += ` AND (LOWER(s.name) LIKE $${params.length} OR LOWER(s.problem_solving) LIKE $${params.length} OR LOWER(s.founder_name) LIKE $${params.length} OR LOWER(s.founder_username) LIKE $${params.length})`
    }

    query += ` ORDER BY (COALESCE(s.is_featured, false) AND (s.featured_until IS NULL OR s.featured_until > NOW())) DESC, s.created_at DESC`
    const res = await client.query(query, params)
    return res.rows
  } finally {
    client.release()
  }
}

// Create startup
export async function createStartup({
  userId,
  founderUsername,
  founderName,
  founderEmail,
  founderPhone,
  founderWebsite,
  founderDiscord,
  name,
  url,
  problemSolving,
  category = "Software",
  stage = "Prototype",
}: {
  userId?: number | null
  founderUsername?: string | null
  founderName: string
  founderEmail?: string | null
  founderPhone?: string | null
  founderWebsite?: string | null
  founderDiscord?: string | null
  name: string
  url: string
  problemSolving: string
  category?: string
  stage?: string
}) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `INSERT INTO startups (
        user_id, founder_username, founder_name, founder_email, founder_phone, founder_website, founder_discord,
        name, url, problem_solving, category, stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        userId || null,
        founderUsername || null,
        founderName,
        founderEmail || null,
        founderPhone || null,
        founderWebsite || null,
        founderDiscord || null,
        name,
        url,
        problemSolving,
        category,
        stage,
      ]
    )
    return res.rows[0]
  } finally {
    client.release()
  }
}

// Get network stats and live report
export async function getNetworkStats() {
  const client = await pool.connect()
  const start = Date.now()
  try {
    const usersCountRes = await client.query("SELECT COUNT(*) AS count FROM users")
    const startupsCountRes = await client.query("SELECT COUNT(*) AS count FROM startups")
    const featuredRes = await client.query(
      `SELECT id, username, name, avatar_url, bio, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 40`
    )
    const queryTimeMs = (Date.now() - start)
    return {
      totalBuilders: parseInt(usersCountRes.rows[0]?.count || "0", 10),
      totalStartups: parseInt(startupsCountRes.rows[0]?.count || "0", 10),
      queryTimeMs: queryTimeMs > 0 ? queryTimeMs : 0.045,
      indexStatus: "active (7 indexes, zero sequential scans)",
      builders: featuredRes.rows,
    }
  } finally {
    client.release()
  }
}


// ==========================================
// ADS & SPONSORSHIPS METHODS
// ==========================================

export async function listAds(placement?: string) {
  const client = await pool.connect();
  try {
    let query = "SELECT * FROM ads WHERE is_active = true";
    const params: any[] = [];
    if (placement) {
      query += " AND placement = $1";
      params.push(placement);
    }
    query += " ORDER BY id DESC";
    const res = await client.query(query, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function incrementAdClick(id: number) {
  const client = await pool.connect();
  try {
    await client.query("UPDATE ads SET clicks_count = clicks_count + 1 WHERE id = $1", [id]);
    return { success: true };
  } finally {
    client.release();
  }
}

export async function createAd(data: {
  title: string;
  description?: string;
  image_url?: string;
  destination_url: string;
  placement?: string;
  badge_label?: string;
  sponsor_name?: string;
  sponsor_email?: string;
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO ads (
        title, description, image_url, destination_url, placement, badge_label, sponsor_name, sponsor_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.title,
        data.description || null,
        data.image_url || null,
        data.destination_url,
        data.placement || 'projects_sidebar',
        data.badge_label || 'Sponsored',
        data.sponsor_name || null,
        data.sponsor_email || null,
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function listAllAdsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM ads ORDER BY id DESC");
    return res.rows;
  } finally {
    client.release();
  }
}

export async function updateAd(id: number, data: {
  title?: string;
  description?: string;
  image_url?: string;
  destination_url?: string;
  placement?: string;
  badge_label?: string;
  sponsor_name?: string;
  sponsor_email?: string;
  is_active?: boolean;
}) {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.image_url !== undefined) { fields.push(`image_url = $${idx++}`); values.push(data.image_url); }
    if (data.destination_url !== undefined) { fields.push(`destination_url = $${idx++}`); values.push(data.destination_url); }
    if (data.placement !== undefined) { fields.push(`placement = $${idx++}`); values.push(data.placement); }
    if (data.badge_label !== undefined) { fields.push(`badge_label = $${idx++}`); values.push(data.badge_label); }
    if (data.sponsor_name !== undefined) { fields.push(`sponsor_name = $${idx++}`); values.push(data.sponsor_name); }
    if (data.sponsor_email !== undefined) { fields.push(`sponsor_email = $${idx++}`); values.push(data.sponsor_email); }
    if (data.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(data.is_active); }
    fields.push(`updated_at = NOW()`);

    if (fields.length === 1) return null; // only updated_at

    values.push(id);
    const res = await client.query(
      `UPDATE ads SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteAd(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM ads WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

// ==========================================
// STORE LINKS METHODS
// ==========================================

export async function listStoreLinks(category?: string) {
  const client = await pool.connect();
  try {
    let query = "SELECT * FROM store_links WHERE is_active = true";
    const params: any[] = [];
    if (category) {
      query += " AND category = $1";
      params.push(category);
    }
    query += " ORDER BY id ASC";
    const res = await client.query(query, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function listAllStoreLinksAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM store_links ORDER BY id ASC");
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createStoreLink(data: {
  title: string;
  description?: string;
  url: string;
  category?: string;
  price?: string;
  icon_url?: string;
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO store_links (
        title, description, url, category, price, icon_url
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        data.title,
        data.description || null,
        data.url,
        data.category || 'Tools',
        data.price || null,
        data.icon_url || null,
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function updateStoreLink(id: number, data: {
  title?: string;
  description?: string;
  url?: string;
  category?: string;
  price?: string;
  icon_url?: string;
  is_active?: boolean;
}) {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.url !== undefined) { fields.push(`url = $${idx++}`); values.push(data.url); }
    if (data.category !== undefined) { fields.push(`category = $${idx++}`); values.push(data.category); }
    if (data.price !== undefined) { fields.push(`price = $${idx++}`); values.push(data.price); }
    if (data.icon_url !== undefined) { fields.push(`icon_url = $${idx++}`); values.push(data.icon_url); }
    if (data.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(data.is_active); }
    fields.push(`updated_at = NOW()`);

    if (fields.length === 1) return null;

    values.push(id);
    const res = await client.query(
      `UPDATE store_links SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteStoreLink(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM store_links WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function deleteStartup(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM startups WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function updateStartup(
  id: number,
  data: {
    name?: string;
    url?: string;
    problem_solving?: string;
    category?: string;
    stage?: string;
    founder_name?: string;
    founder_website?: string;
    founder_discord?: string;
  },
  userId?: number,
  username?: string,
  isAdmin?: boolean
) {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name.trim()); }
    if (data.url !== undefined) { fields.push(`url = $${idx++}`); values.push(data.url.trim()); }
    if (data.problem_solving !== undefined) { fields.push(`problem_solving = $${idx++}`); values.push(data.problem_solving.trim()); }
    if (data.category !== undefined) { fields.push(`category = $${idx++}`); values.push(data.category); }
    if (data.stage !== undefined) { fields.push(`stage = $${idx++}`); values.push(data.stage); }
    if (data.founder_name !== undefined) { fields.push(`founder_name = $${idx++}`); values.push(data.founder_name.trim()); }
    if (data.founder_website !== undefined) { fields.push(`founder_website = $${idx++}`); values.push(data.founder_website.trim() || null); }
    if (data.founder_discord !== undefined) { fields.push(`founder_discord = $${idx++}`); values.push(data.founder_discord.trim() || null); }

    if (fields.length === 0) return null;

    let queryStr = `UPDATE startups SET ${fields.join(", ")} WHERE id = $${idx++}`;
    values.push(id);

    if (!isAdmin) {
      if (userId && username) {
        queryStr += ` AND (user_id = $${idx} OR LOWER(founder_username) = LOWER($${idx + 1}))`;
        values.push(userId, username);
        idx += 2;
      } else if (userId) {
        queryStr += ` AND user_id = $${idx++}`;
        values.push(userId);
      } else if (username) {
        queryStr += ` AND LOWER(founder_username) = LOWER($${idx++})`;
        values.push(username);
      }
    }

    queryStr += " RETURNING *";
    const res = await client.query(queryStr, values);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

// ==========================================
// CATALOG PROJECTS (DATABASE CURATED ARTIFACTS)
// ==========================================

export async function listCatalogProjects(category?: string) {
  const client = await pool.connect();
  try {
    let query = "SELECT * FROM catalog_projects WHERE is_approved = true";
    const params: any[] = [];
    if (category && category !== "All") {
      query += " AND LOWER(category) = LOWER($1)";
      params.push(category);
    }
    query += " ORDER BY id ASC";
    const res = await client.query(query, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function listAllCatalogProjectsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM catalog_projects ORDER BY id DESC");
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createCatalogProject(data: {
  title: string;
  url: string;
  category?: string;
  description?: string;
  author?: string;
  author_handle?: string;
  thumbnail_bg?: string;
  visual_type?: string;
  preview_image_url?: string;
  tags?: string[];
  stars?: number;
  is_sponsored?: boolean;
  sponsored_label?: string;
  is_approved?: boolean;
}) {
  const client = await pool.connect();
  try {
    const isApproved = data.is_approved !== undefined ? Boolean(data.is_approved) : false;
    const res = await client.query(
      `INSERT INTO catalog_projects (
        title, url, category, description, author, author_handle, thumbnail_bg, visual_type, preview_image_url, tags, stars, is_sponsored, sponsored_label, is_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        data.title,
        data.url,
        data.category || 'Finds',
        data.description || null,
        data.author || 'Community',
        data.author_handle || 'builder',
        data.thumbnail_bg || '#121214',
        data.visual_type || 'screenshot',
        data.preview_image_url || null,
        data.tags || ['Community', 'Curated'],
        data.stars || 1,
        data.is_sponsored || false,
        data.sponsored_label || null,
        isApproved,
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function updateCatalogProject(id: number, data: Partial<{
  title: string;
  url: string;
  category: string;
  description: string;
  author: string;
  author_handle: string;
  thumbnail_bg: string;
  visual_type: string;
  preview_image_url: string;
  tags: string[];
  stars: number;
  is_sponsored: boolean;
  sponsored_label: string;
  is_approved: boolean;
}>) {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
    if (data.url !== undefined) { fields.push(`url = $${idx++}`); values.push(data.url); }
    if (data.category !== undefined) { fields.push(`category = $${idx++}`); values.push(data.category); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.author !== undefined) { fields.push(`author = $${idx++}`); values.push(data.author); }
    if (data.author_handle !== undefined) { fields.push(`author_handle = $${idx++}`); values.push(data.author_handle); }
    if (data.thumbnail_bg !== undefined) { fields.push(`thumbnail_bg = $${idx++}`); values.push(data.thumbnail_bg); }
    if (data.visual_type !== undefined) { fields.push(`visual_type = $${idx++}`); values.push(data.visual_type); }
    if (data.preview_image_url !== undefined) { fields.push(`preview_image_url = $${idx++}`); values.push(data.preview_image_url); }
    if (data.tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(data.tags); }
    if (data.stars !== undefined) { fields.push(`stars = $${idx++}`); values.push(data.stars); }
    if (data.is_sponsored !== undefined) { fields.push(`is_sponsored = $${idx++}`); values.push(data.is_sponsored); }
    if (data.sponsored_label !== undefined) { fields.push(`sponsored_label = $${idx++}`); values.push(data.sponsored_label); }
    if (data.is_approved !== undefined) { fields.push(`is_approved = $${idx++}`); values.push(data.is_approved); }
    fields.push(`updated_at = NOW()`);

    if (fields.length === 1) return null;

    values.push(id);
    const res = await client.query(
      `UPDATE catalog_projects SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteCatalogProject(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM catalog_projects WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

// ==========================================
// SUPABASE PROJECT ASSETS STORAGE (IMAGES)
// ==========================================

export async function saveProjectAsset(filename: string, mimeType: string, base64Data: string) {
  const client = await pool.connect();
  try {
    // Strip data URL header if present (e.g. data:image/png;base64,...)
    const cleanBase64 = base64Data.replace(/^data:[a-zA-Z0-9\/+-]+;base64,/, "");
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_") || "asset.png";

    const res = await client.query(
      `INSERT INTO project_assets (filename, mime_type, data_base64)
       VALUES ($1, $2, $3)
       RETURNING id, filename, mime_type`,
      [safeFilename, mimeType || "image/png", cleanBase64]
    );

    const asset = res.rows[0];
    const publicUrl = `https://www.recolabs.in/api/network/assets/${asset.id}/${encodeURIComponent(asset.filename)}`;
    
    // Update public_url column
    await client.query("UPDATE project_assets SET public_url = $1 WHERE id = $2", [publicUrl, asset.id]);
    return { id: asset.id, url: publicUrl, filename: asset.filename };
  } finally {
    client.release();
  }
}

export async function getProjectAsset(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT id, filename, mime_type, data_base64 FROM project_assets WHERE id = $1",
      [id]
    );
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

// ==========================================
// 10. PROJECT SECTIONS (Dynamic Categories)
// ==========================================
export async function listProjectSections() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM project_sections ORDER BY sort_order ASC, id ASC");
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createProjectSection(data: { name: string; icon?: string }) {
  const client = await pool.connect();
  try {
    const cleanName = data.name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const res = await client.query(
      `INSERT INTO project_sections (name, slug, icon)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon
       RETURNING *`,
      [cleanName, slug, data.icon || "Layers"]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteProjectSection(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM project_sections WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function listProjectComments(projectId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM project_comments 
       WHERE project_id = $1 
       ORDER BY created_at ASC`,
      [projectId]
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createProjectComment(data: {
  projectId: number;
  userId?: number;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  content: string;
  type?: string;
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO project_comments 
       (project_id, user_id, author_name, author_username, author_avatar, content, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.projectId,
        data.userId || null,
        data.authorName.trim(),
        data.authorUsername?.trim() || null,
        data.authorAvatar?.trim() || null,
        data.content.trim(),
        data.type || "feedback",
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteProjectComment(id: number, userId?: number, isAdmin?: boolean) {
  const client = await pool.connect();
  try {
    let queryStr = "DELETE FROM project_comments WHERE id = $1";
    const params: any[] = [id];
    if (!isAdmin && userId) {
      queryStr += " AND user_id = $2";
      params.push(userId);
    }
    queryStr += " RETURNING id";
    const res = await client.query(queryStr, params);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function listStartupComments(startupId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM startup_comments 
       WHERE startup_id = $1 
       ORDER BY created_at ASC`,
      [startupId]
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createStartupComment(data: {
  startupId: number;
  userId?: number;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  content: string;
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO startup_comments 
       (startup_id, user_id, author_name, author_username, author_avatar, content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.startupId,
        data.userId || null,
        data.authorName.trim(),
        data.authorUsername?.trim() || null,
        data.authorAvatar?.trim() || null,
        data.content.trim(),
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function getStartupRatingsSummary(startupId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT 
        COUNT(*)::int as total_ratings,
        COALESCE(AVG(idea_score), 5.0)::numeric(3, 1) as avg_idea,
        COALESCE(AVG(execution_score), 5.0)::numeric(3, 1) as avg_execution,
        COALESCE(AVG(design_score), 5.0)::numeric(3, 1) as avg_design
       FROM startup_ratings 
       WHERE startup_id = $1`,
      [startupId]
    );
    const row = res.rows[0] || {};
    const total = Number(row.total_ratings) || 0;
    const avgIdea = Number(row.avg_idea) || 5.0;
    const avgExecution = Number(row.avg_execution) || 5.0;
    const avgDesign = Number(row.avg_design) || 5.0;
    const overall = total > 0 ? Number(((avgIdea + avgExecution + avgDesign) / 3).toFixed(1)) : 5.0;
    return {
      totalRatings: total,
      overall,
      idea: avgIdea,
      execution: avgExecution,
      design: avgDesign,
    };
  } finally {
    client.release();
  }
}

export async function createStartupRating(data: {
  startupId: number;
  userId?: number;
  ideaScore: number;
  executionScore: number;
  designScore: number;
}) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO startup_ratings 
       (startup_id, user_id, idea_score, execution_score, design_score)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        data.startupId,
        data.userId || null,
        data.ideaScore,
        data.executionScore,
        data.designScore,
      ]
    );
    return await getStartupRatingsSummary(data.startupId);
  } finally {
    client.release();
  }
}

// ==========================================
// BUILDER JOBS
// ==========================================

export async function listBuilderJobs(options: { onlyActive?: boolean; limit?: number } = {}) {
  const client = await pool.connect();
  try {
    let queryStr = "SELECT * FROM builder_jobs";
    const params: any[] = [];
    if (options.onlyActive !== false) {
      queryStr += " WHERE is_active = true";
    }
    queryStr += " ORDER BY COALESCE(is_featured, false) DESC, created_at DESC";
    if (options.limit) {
      params.push(options.limit);
      queryStr += " LIMIT $" + params.length;
    }
    const res = await client.query(queryStr, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function listUserJobs(userId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT * FROM builder_jobs WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createBuilderJob(data: {
  userId?: number | null;
  authorName: string;
  authorUsername?: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location?: string;
  isRemote?: boolean;
  jobType?: string;
  salaryRange?: string;
  skills?: string[];
  description: string;
  applyUrl: string;
  isFeatured?: boolean;
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO builder_jobs
       (user_id, author_name, author_username, title, company_name, company_logo, location, is_remote, job_type, salary_range, skills, description, apply_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        data.userId || null,
        data.authorName.trim(),
        data.authorUsername?.trim() || null,
        data.title.trim(),
        data.companyName.trim(),
        data.companyLogo?.trim() || null,
        data.location?.trim() || "Remote",
        data.isRemote !== false,
        data.jobType?.trim() || "Full-time",
        data.salaryRange?.trim() || null,
        data.skills || [],
        data.description.trim(),
        data.applyUrl.trim(),
        Boolean(data.isFeatured),
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function updateBuilderJob(
  id: number,
  userId: number,
  data: {
    title?: string;
    company_name?: string;
    company_logo?: string;
    location?: string;
    is_remote?: boolean;
    job_type?: string;
    salary_range?: string;
    skills?: string[];
    description?: string;
    apply_url?: string;
  },
  isAdmin?: boolean
) {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title.trim()); }
    if (data.company_name !== undefined) { fields.push(`company_name = $${idx++}`); values.push(data.company_name.trim()); }
    if (data.company_logo !== undefined) { fields.push(`company_logo = $${idx++}`); values.push(data.company_logo?.trim() || null); }
    if (data.location !== undefined) { fields.push(`location = $${idx++}`); values.push(data.location?.trim() || null); }
    if (data.is_remote !== undefined) { fields.push(`is_remote = $${idx++}`); values.push(Boolean(data.is_remote)); }
    if (data.job_type !== undefined) { fields.push(`job_type = $${idx++}`); values.push(data.job_type); }
    if (data.salary_range !== undefined) { fields.push(`salary_range = $${idx++}`); values.push(data.salary_range?.trim() || null); }
    if (data.skills !== undefined) { fields.push(`skills = $${idx++}`); values.push(data.skills); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description.trim()); }
    if (data.apply_url !== undefined) { fields.push(`apply_url = $${idx++}`); values.push(data.apply_url.trim()); }

    if (fields.length === 0) return null;
    fields.push(`updated_at = NOW()`);

    let queryStr = `UPDATE builder_jobs SET ${fields.join(", ")} WHERE id = $${idx++}`;
    values.push(id);

    if (!isAdmin) {
      queryStr += ` AND user_id = $${idx++}`;
      values.push(userId);
    }

    queryStr += " RETURNING *";
    const res = await client.query(queryStr, values);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function updateBuilderJobStatus(id: number, userId: number, isActive: boolean, isAdmin?: boolean) {
  const client = await pool.connect();
  try {
    let queryStr = "UPDATE builder_jobs SET is_active = $1, updated_at = NOW() WHERE id = $2";
    const params: any[] = [isActive, id];
    if (!isAdmin) {
      queryStr += " AND user_id = $3";
      params.push(userId);
    }
    queryStr += " RETURNING *";
    const res = await client.query(queryStr, params);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteBuilderJob(id: number, userId?: number, isAdmin?: boolean) {
  const client = await pool.connect();
  try {
    let queryStr = "DELETE FROM builder_jobs WHERE id = $1";
    const params: any[] = [id];
    if (!isAdmin && userId) {
      queryStr += " AND user_id = $2";
      params.push(userId);
    }
    queryStr += " RETURNING id";
    const res = await client.query(queryStr, params);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

// ==========================================
// BUILDER HACKATHONS
// ==========================================

export async function listBuilderHackathons(options: { onlyApproved?: boolean; limit?: number } = {}) {
  const client = await pool.connect();
  try {
    let queryStr = "SELECT * FROM builder_hackathons";
    const params: any[] = [];
    if (options.onlyApproved !== false) {
      queryStr += " WHERE is_approved = true";
    }
    queryStr += " ORDER BY start_date DESC";
    if (options.limit) {
      params.push(options.limit);
      queryStr += " LIMIT $" + params.length;
    }
    const res = await client.query(queryStr, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function listUserHackathons(userId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT * FROM builder_hackathons WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createBuilderHackathon(data: {
  userId?: number | null;
  authorName: string;
  authorUsername?: string;
  name: string;
  tagline?: string;
  description?: string;
  bannerUrl?: string;
  website: string;
  startDate: string;
  endDate: string;
  location?: string;
  virtual?: boolean;
  apac?: boolean;
  prizePool?: string;
  eligibility?: string;
  tags?: string[];
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO builder_hackathons
       (user_id, author_name, author_username, name, tagline, description, banner_url, website, start_date, end_date, location, virtual, apac, prize_pool, eligibility, tags, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true)
       RETURNING *`,
      [
        data.userId || null,
        data.authorName.trim(),
        data.authorUsername?.trim() || null,
        data.name.trim(),
        data.tagline?.trim() || null,
        data.description?.trim() || null,
        data.bannerUrl?.trim() || null,
        data.website.trim(),
        data.startDate,
        data.endDate,
        data.location?.trim() || (data.virtual ? "Virtual" : "In-Person"),
        data.virtual !== false,
        data.apac === true,
        data.prizePool?.trim() || null,
        data.eligibility?.trim() || "Open to all builders",
        data.tags || ["Hackathon", "Builders"],
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteBuilderHackathon(id: number, userId?: number, isAdmin?: boolean) {
  const client = await pool.connect();
  try {
    let queryStr = "DELETE FROM builder_hackathons WHERE id = $1";
    const params: any[] = [id];
    if (!isAdmin && userId) {
      queryStr += " AND user_id = $2";
      params.push(userId);
    }
    queryStr += " RETURNING id";
    const res = await client.query(queryStr, params);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

// ==========================================
// ADMIN DASHBOARD MASTER QUERIES
// ==========================================

export async function listAllBuilderJobsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM builder_jobs ORDER BY created_at DESC");
    return res.rows;
  } finally {
    client.release();
  }
}

export async function listAllBuilderHackathonsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM builder_hackathons ORDER BY created_at DESC");
    return res.rows;
  } finally {
    client.release();
  }
}

export async function listAllPaidEntitiesAdmin() {
  const client = await pool.connect();
  try {
    const [startups, jobs, users] = await Promise.all([
      client.query("SELECT id, name, url, founder_name, founder_username, category, stage, created_at, is_featured FROM startups WHERE is_featured = true ORDER BY created_at DESC"),
      client.query("SELECT id, title, company_name, author_name, location, job_type, salary_range, created_at, is_featured FROM builder_jobs WHERE is_featured = true ORDER BY created_at DESC"),
      client.query("SELECT id, name, username, email, is_verified, is_pro, plan, COALESCE(plan_billing, 'monthly') as plan_billing, subscription_start, subscription_end, avatar_url, created_at FROM users WHERE is_verified = true OR is_pro = true ORDER BY created_at DESC")
    ]);
    return {
      featuredStartups: startups.rows,
      featuredJobs: jobs.rows,
      verifiedUsers: users.rows
    };
  } finally {
    client.release();
  }
}

export async function toggleUserVerification(id: number) {
  const client = await pool.connect();
  try {
    const check = await client.query("SELECT is_verified FROM users WHERE id = $1", [id]);
    const willVerify = !check.rows[0]?.is_verified;
    const res = await client.query(
      `UPDATE users SET 
        is_verified = $1, 
        is_pro = $1, 
        plan = CASE WHEN $1 THEN COALESCE(plan, 'pro') ELSE 'free' END,
        plan_billing = CASE WHEN $1 THEN COALESCE(plan_billing, 'monthly') ELSE 'monthly' END,
        subscription_start = CASE WHEN $1 THEN NOW() ELSE NULL END,
        subscription_end = CASE WHEN $1 THEN NOW() + INTERVAL '30 days' ELSE NULL END,
        updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, is_verified, is_pro, plan, plan_billing, subscription_start, subscription_end`,
      [willVerify, id]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function toggleJobFeatured(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "UPDATE builder_jobs SET is_featured = NOT COALESCE(is_featured, false), updated_at = NOW() WHERE id = $1 RETURNING id, is_featured",
      [id]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function toggleStartupFeatured(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "UPDATE startups SET is_featured = NOT COALESCE(is_featured, false) WHERE id = $1 RETURNING id, is_featured",
      [id]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function setHackathonApproval(id: number, approved: boolean) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "UPDATE builder_hackathons SET is_approved = $1 WHERE id = $2 RETURNING id, is_approved",
      [approved, id]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function listCouponsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM coupons ORDER BY created_at DESC");
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createCouponAdmin(data: {
  code: string;
  discount_type?: string;
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  expires_at?: string | null;
}) {
  const client = await pool.connect();
  try {
    const cleanCode = data.code.trim().toUpperCase();
    const res = await client.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        cleanCode,
        data.discount_type || "percentage",
        data.discount_value,
        data.min_order_amount || 0,
        data.max_uses || null,
        data.expires_at || null,
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function toggleCouponAdmin(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "UPDATE coupons SET is_active = NOT COALESCE(is_active, true), updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteCouponAdmin(id: number) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM coupons WHERE id = $1 RETURNING id", [id]);
    return res.rowCount ? res.rowCount > 0 : false;
  } finally {
    client.release();
  }
}

export async function validateCoupon(code: string, amount: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM coupons WHERE LOWER(code) = LOWER($1) LIMIT 1`,
      [code.trim()]
    );
    if (res.rows.length === 0) {
      return { valid: false, error: "Invalid coupon code." };
    }
    const coupon = res.rows[0];
    if (!coupon.is_active) {
      return { valid: false, error: "This coupon is no longer active." };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, error: "This coupon has expired." };
    }
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return { valid: false, error: "This coupon has reached its maximum usage limit." };
    }
    if (coupon.min_order_amount && amount < Number(coupon.min_order_amount)) {
      return { valid: false, error: `Minimum order amount of ₹${coupon.min_order_amount} required to use this coupon.` };
    }

    let discountAmount = 0;
    const discountVal = Number(coupon.discount_value);
    if (coupon.discount_type === "percentage") {
      discountAmount = Math.round((amount * discountVal) / 100);
    } else {
      discountAmount = Math.min(amount, discountVal);
    }
    const finalAmount = Math.max(0, amount - discountAmount);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: discountVal,
        discount_amount: discountAmount,
      },
      discountAmount,
      finalAmount,
    };
  } finally {
    client.release();
  }
}


// ==========================================
// BUILDER DIRECTORY & CONTRIBUTIONS
// ==========================================
export async function listBuildersWithContributions(limit: number = 100) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT 
        u.id, 
        u.name, 
        u.username, 
        u.avatar_url, 
        u.bio, 
        u.github, 
        u.twitter, 
        u.discord, 
        u.website, 
        COALESCE(u.is_verified, false) as is_verified, 
        COALESCE(u.is_pro, false) as is_pro, 
        u.plan,
        u.created_at,
        COUNT(DISTINCT s.id)::int AS startups_count,
        COALESCE(SUM(s.upvotes_count), 0)::int AS upvotes_count,
        COUNT(DISTINCT j.id)::int AS jobs_count,
        (COUNT(DISTINCT s.id) * 10 + COALESCE(SUM(s.upvotes_count), 0) * 2 + COUNT(DISTINCT j.id) * 5 + (CASE WHEN u.is_verified THEN 25 ELSE 0 END))::int AS contributions
      FROM users u
      LEFT JOIN startups s ON s.user_id = u.id OR LOWER(s.founder_username) = LOWER(u.username)
      LEFT JOIN builder_jobs j ON j.user_id = u.id OR LOWER(j.author_username) = LOWER(u.username)
      GROUP BY u.id
      ORDER BY contributions DESC, u.is_verified DESC, u.created_at DESC
      LIMIT $1`,
      [limit]
    );
    return res.rows;
  } finally {
    client.release();
  }
}

// ==========================================
// LAUNCHPAD STARTUP UPVOTING
// ==========================================
export async function toggleStartupUpvote(startupId: number, userId?: number | null, ipAddress?: string | null) {
  const client = await pool.connect();
  try {
    let hasUpvoted = false;
    if (userId) {
      const existing = await client.query(
        "SELECT id FROM startup_upvotes WHERE startup_id = $1 AND user_id = $2",
        [startupId, userId]
      );
      if (existing.rows.length > 0) {
        await client.query("DELETE FROM startup_upvotes WHERE startup_id = $1 AND user_id = $2", [startupId, userId]);
        await client.query("UPDATE startups SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = $1", [startupId]);
        hasUpvoted = false;
      } else {
        await client.query(
          "INSERT INTO startup_upvotes (startup_id, user_id, ip_address) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
          [startupId, userId, ipAddress || null]
        );
        await client.query("UPDATE startups SET upvotes_count = upvotes_count + 1 WHERE id = $1", [startupId]);
        hasUpvoted = true;
      }
    } else {
      await client.query("UPDATE startups SET upvotes_count = upvotes_count + 1 WHERE id = $1", [startupId]);
      hasUpvoted = true;
    }

    const updated = await client.query("SELECT upvotes_count FROM startups WHERE id = $1", [startupId]);
    return {
      success: true,
      hasUpvoted,
      upvotesCount: updated.rows[0]?.upvotes_count || 0,
    };
  } finally {
    client.release();
  }
}

// ==========================================
// COMMUNITY POSTS / SCROLL DISCUSSIONS
// ==========================================
export async function listCommunityPosts({
  category,
  limit = 50,
  offset = 0,
  search,
  currentUserId,
}: {
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
  currentUserId?: number | null;
} = {}) {
  const client = await pool.connect();
  try {
    let query = `
      SELECT 
        p.id, 
        p.user_id, 
        p.author_name, 
        p.author_username, 
        p.author_avatar, 
        COALESCE(u.is_verified, p.is_verified, false) as is_verified, 
        p.title, 
        p.content, 
        p.category, 
        p.tags, 
        p.media_url, 
        p.upvotes_count, 
        p.comments_count, 
        p.created_at,
        ${currentUserId ? `EXISTS(SELECT 1 FROM post_upvotes pu WHERE pu.post_id = p.id AND pu.user_id = $1)` : "false"} as has_upvoted
      FROM community_posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (currentUserId) {
      params.push(currentUserId);
    }

    if (category && category !== "ALL" && category !== "all") {
      params.push(category.toLowerCase());
      query += ` AND LOWER(p.category) = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(p.title) LIKE $${params.length} OR LOWER(p.content) LIKE $${params.length} OR LOWER(p.author_name) LIKE $${params.length})`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await client.query(query, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createCommunityPost({
  userId,
  authorName,
  authorUsername,
  authorAvatar,
  isVerified = false,
  title,
  content,
  category = "ask",
  tags = [],
  mediaUrl,
}: {
  userId?: number | null;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string | null;
  isVerified?: boolean;
  title?: string | null;
  content: string;
  category?: string;
  tags?: string[];
  mediaUrl?: string | null;
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO community_posts 
        (user_id, author_name, author_username, author_avatar, is_verified, title, content, category, tags, media_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId || null,
        authorName,
        authorUsername,
        authorAvatar || null,
        isVerified,
        title || null,
        content,
        category,
        tags,
        mediaUrl || null,
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function togglePostUpvote(postId: number, userId?: number | null) {
  const client = await pool.connect();
  try {
    let hasUpvoted = false;
    if (userId) {
      const existing = await client.query("SELECT id FROM post_upvotes WHERE post_id = $1 AND user_id = $2", [postId, userId]);
      if (existing.rows.length > 0) {
        await client.query("DELETE FROM post_upvotes WHERE post_id = $1 AND user_id = $2", [postId, userId]);
        await client.query("UPDATE community_posts SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = $1", [postId]);
        hasUpvoted = false;
      } else {
        await client.query("INSERT INTO post_upvotes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [postId, userId]);
        await client.query("UPDATE community_posts SET upvotes_count = upvotes_count + 1 WHERE id = $1", [postId]);
        hasUpvoted = true;
      }
    } else {
      await client.query("UPDATE community_posts SET upvotes_count = upvotes_count + 1 WHERE id = $1", [postId]);
      hasUpvoted = true;
    }
    const updated = await client.query("SELECT upvotes_count FROM community_posts WHERE id = $1", [postId]);
    return { success: true, hasUpvoted, upvotesCount: updated.rows[0]?.upvotes_count || 0 };
  } finally {
    client.release();
  }
}

export async function listPostComments(postId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT c.id, c.post_id, c.user_id, c.author_name, c.author_username, c.author_avatar, 
              COALESCE(u.is_verified, c.is_verified, false) as is_verified, c.content, c.created_at
       FROM post_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createPostComment({
  postId,
  userId,
  authorName,
  authorUsername,
  authorAvatar,
  isVerified = false,
  content,
}: {
  postId: number;
  userId?: number | null;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string | null;
  isVerified?: boolean;
  content: string;
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO post_comments (post_id, user_id, author_name, author_username, author_avatar, is_verified, content)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [postId, userId || null, authorName, authorUsername, authorAvatar || null, isVerified, content]
    );
    await client.query("UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1", [postId]);
    return res.rows[0];
  } finally {
    client.release();
  }
}

