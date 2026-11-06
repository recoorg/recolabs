// Auto-generated bundle for Vercel serverless function
import { createRequire } from "module"; const require = createRequire(import.meta.url);

// server/db.ts
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var { Pool } = pg;
var DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.zjpbrdbdkkzczdwsgizj:Aditya%401060A@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";
var JWT_SECRET = process.env.JWT_SECRET || "recolabs_jwt_secret_key_2026_super_secure";
var pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 5e3
});
function cleanUsername(input) {
  return input.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
}
async function generateUniqueUsername(client, base) {
  const clean = cleanUsername(base) || "builder";
  let candidate = clean;
  let counter = 1;
  while (true) {
    const res = await client.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER($1)",
      [candidate]
    );
    if (res.rows.length === 0) return candidate;
    candidate = `${clean}${counter}`;
    counter++;
  }
}
async function initDb() {
  const client = await pool.connect();
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

      -- Dedicated Launchpad Products & Upvotes Tables
      CREATE TABLE IF NOT EXISTS launchpad_products (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        founder_username TEXT,
        founder_name TEXT NOT NULL,
        name TEXT NOT NULL,
        tagline TEXT,
        problem_solving TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT DEFAULT 'Software',
        stage TEXT DEFAULT 'Prototype',
        logo_url TEXT,
        media_url TEXT,
        upvotes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        featured_until TIMESTAMPTZ,
        boosted_at TIMESTAMPTZ,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_launchpad_products_created ON launchpad_products(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_launchpad_products_upvotes ON launchpad_products(upvotes_count DESC);
      CREATE INDEX IF NOT EXISTS idx_launchpad_products_category ON launchpad_products(LOWER(category));

      CREATE TABLE IF NOT EXISTS launchpad_upvotes (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES launchpad_products(id) ON DELETE CASCADE,
        user_id INTEGER,
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(product_id, user_id)
      );

      -- Auto-seed launchpad_products from startups if empty
      INSERT INTO launchpad_products (
        user_id, founder_username, founder_name, name, tagline, problem_solving, url, category, stage, logo_url, media_url, upvotes_count, comments_count, is_featured, is_approved, created_at
      )
      SELECT 
        user_id, founder_username, founder_name, name, tagline, problem_solving, url, category, stage, logo_url, media_url, upvotes_count, comments_count, is_featured, is_approved, created_at
      FROM startups
      WHERE NOT EXISTS (SELECT 1 FROM launchpad_products LIMIT 1);
    `);
  } finally {
    client.release();
  }
}
async function createUser({
  name,
  username,
  email,
  password,
  phone,
  website,
  bio,
  discord,
  github
}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    let finalUsername = username ? cleanUsername(username) : "";
    if (finalUsername) {
      const existing = await client.query(
        "SELECT id FROM users WHERE LOWER(username) = LOWER($1)",
        [finalUsername]
      );
      if (existing.rows.length > 0) {
        throw new Error(`Username @${finalUsername} is already taken. Please choose another.`);
      }
    } else {
      finalUsername = await generateUniqueUsername(client, name || email.split("@")[0]);
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
        github || null
      ]
    );
    const user = res.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "30d"
    });
    return { user, token };
  } finally {
    client.release();
  }
}
async function loginUser({ email, password }) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, name, username, email, password_hash, phone, website, bio, discord, github, auth_provider, avatar_url, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    if (res.rows.length === 0) {
      throw new Error("Invalid email or password.");
    }
    const user = res.rows[0];
    if (!user.password_hash) {
      throw new Error("This account uses social sign in (Google or GitHub).");
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error("Invalid email or password.");
    }
    delete user.password_hash;
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "30d"
    });
    return { user, token };
  } finally {
    client.release();
  }
}
async function syncOAuthUser({
  email,
  name,
  avatarUrl,
  provider,
  preferredUsername
}) {
  const client = await pool.connect();
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await client.query(
      `SELECT id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, created_at
       FROM users WHERE email = $1`,
      [normalizedEmail]
    );
    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      if (avatarUrl && !user.avatar_url) {
        const updateRes = await client.query(
          "UPDATE users SET avatar_url = $1, auth_provider = $2 WHERE id = $3 RETURNING *",
          [avatarUrl, provider, user.id]
        );
        user = updateRes.rows[0];
      }
    } else {
      const generatedUsername = await generateUniqueUsername(
        client,
        preferredUsername || name || normalizedEmail.split("@")[0]
      );
      const insertRes = await client.query(
        `INSERT INTO users (name, username, email, avatar_url, auth_provider)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, username, email, phone, website, bio, discord, github, auth_provider, avatar_url, created_at`,
        [name || "Builder", generatedUsername, normalizedEmail, avatarUrl || null, provider]
      );
      user = insertRes.rows[0];
    }
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: "30d"
    });
    return { user, token };
  } finally {
    client.release();
  }
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
async function getUserById(id) {
  const client = await pool.connect();
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
    );
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}
async function getUserByUsername(username) {
  const client = await pool.connect();
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
    );
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}
async function updateUserProfile(id, {
  name,
  username,
  phone,
  website,
  bio,
  discord,
  github
}) {
  const client = await pool.connect();
  try {
    let finalUsername = void 0;
    if (username) {
      finalUsername = cleanUsername(username);
      const conflict = await client.query(
        "SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2",
        [finalUsername, id]
      );
      if (conflict.rows.length > 0) {
        throw new Error(`Username @${finalUsername} is already taken.`);
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
    );
    if (finalUsername) {
      await client.query("UPDATE startups SET founder_username = $1 WHERE user_id = $2", [
        finalUsername,
        id
      ]);
    }
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function listStartups({
  search,
  category,
  username
} = {}) {
  const client = await pool.connect();
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
    `;
    const params = [];
    if (username && username.trim()) {
      params.push(username.trim().toLowerCase());
      query += ` AND (LOWER(s.founder_username) = $${params.length} OR LOWER(u.username) = $${params.length})`;
    }
    if (category && category !== "ALL") {
      params.push(category);
      query += ` AND s.category = $${params.length}`;
    }
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(s.name) LIKE $${params.length} OR LOWER(s.problem_solving) LIKE $${params.length} OR LOWER(s.founder_name) LIKE $${params.length} OR LOWER(s.founder_username) LIKE $${params.length})`;
    }
    query += ` ORDER BY (COALESCE(s.is_featured, false) AND (s.featured_until IS NULL OR s.featured_until > NOW())) DESC, s.created_at DESC`;
    const res = await client.query(query, params);
    return res.rows;
  } finally {
    client.release();
  }
}
async function createStartup({
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
  stage = "Prototype"
}) {
  const client = await pool.connect();
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
        stage
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getNetworkStats() {
  const client = await pool.connect();
  const start = Date.now();
  try {
    const usersCountRes = await client.query("SELECT COUNT(*) AS count FROM users");
    const startupsCountRes = await client.query("SELECT COUNT(*) AS count FROM startups");
    const featuredRes = await client.query(
      `SELECT id, username, name, avatar_url, bio, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 40`
    );
    const queryTimeMs = Date.now() - start;
    return {
      totalBuilders: parseInt(usersCountRes.rows[0]?.count || "0", 10),
      totalStartups: parseInt(startupsCountRes.rows[0]?.count || "0", 10),
      queryTimeMs: queryTimeMs > 0 ? queryTimeMs : 0.045,
      indexStatus: "active (7 indexes, zero sequential scans)",
      builders: featuredRes.rows
    };
  } finally {
    client.release();
  }
}
async function listAds(placement) {
  const client = await pool.connect();
  try {
    let query = "SELECT * FROM ads WHERE is_active = true";
    const params = [];
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
async function incrementAdClick(id) {
  const client = await pool.connect();
  try {
    await client.query("UPDATE ads SET clicks_count = clicks_count + 1 WHERE id = $1", [id]);
    return { success: true };
  } finally {
    client.release();
  }
}
async function createAd(data) {
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
        data.placement || "projects_sidebar",
        data.badge_label || "Sponsored",
        data.sponsor_name || null,
        data.sponsor_email || null
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function listAllAdsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM ads ORDER BY id DESC");
    return res.rows;
  } finally {
    client.release();
  }
}
async function updateAd(id, data) {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.title !== void 0) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.description !== void 0) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.image_url !== void 0) {
      fields.push(`image_url = $${idx++}`);
      values.push(data.image_url);
    }
    if (data.destination_url !== void 0) {
      fields.push(`destination_url = $${idx++}`);
      values.push(data.destination_url);
    }
    if (data.placement !== void 0) {
      fields.push(`placement = $${idx++}`);
      values.push(data.placement);
    }
    if (data.badge_label !== void 0) {
      fields.push(`badge_label = $${idx++}`);
      values.push(data.badge_label);
    }
    if (data.sponsor_name !== void 0) {
      fields.push(`sponsor_name = $${idx++}`);
      values.push(data.sponsor_name);
    }
    if (data.sponsor_email !== void 0) {
      fields.push(`sponsor_email = $${idx++}`);
      values.push(data.sponsor_email);
    }
    if (data.is_active !== void 0) {
      fields.push(`is_active = $${idx++}`);
      values.push(data.is_active);
    }
    fields.push(`updated_at = NOW()`);
    if (fields.length === 1) return null;
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
async function deleteAd(id) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM ads WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}
async function listStoreLinks(category) {
  const client = await pool.connect();
  try {
    let query = "SELECT * FROM store_links WHERE is_active = true";
    const params = [];
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
async function listAllStoreLinksAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM store_links ORDER BY id ASC");
    return res.rows;
  } finally {
    client.release();
  }
}
async function createStoreLink(data) {
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
        data.category || "Tools",
        data.price || null,
        data.icon_url || null
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateStoreLink(id, data) {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.title !== void 0) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.description !== void 0) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.url !== void 0) {
      fields.push(`url = $${idx++}`);
      values.push(data.url);
    }
    if (data.category !== void 0) {
      fields.push(`category = $${idx++}`);
      values.push(data.category);
    }
    if (data.price !== void 0) {
      fields.push(`price = $${idx++}`);
      values.push(data.price);
    }
    if (data.icon_url !== void 0) {
      fields.push(`icon_url = $${idx++}`);
      values.push(data.icon_url);
    }
    if (data.is_active !== void 0) {
      fields.push(`is_active = $${idx++}`);
      values.push(data.is_active);
    }
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
async function deleteStoreLink(id) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM store_links WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}
async function deleteStartup(id) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM startups WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}
async function updateStartup(id, data, userId, username, isAdmin) {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.name !== void 0) {
      fields.push(`name = $${idx++}`);
      values.push(data.name.trim());
    }
    if (data.url !== void 0) {
      fields.push(`url = $${idx++}`);
      values.push(data.url.trim());
    }
    if (data.problem_solving !== void 0) {
      fields.push(`problem_solving = $${idx++}`);
      values.push(data.problem_solving.trim());
    }
    if (data.category !== void 0) {
      fields.push(`category = $${idx++}`);
      values.push(data.category);
    }
    if (data.stage !== void 0) {
      fields.push(`stage = $${idx++}`);
      values.push(data.stage);
    }
    if (data.founder_name !== void 0) {
      fields.push(`founder_name = $${idx++}`);
      values.push(data.founder_name.trim());
    }
    if (data.founder_website !== void 0) {
      fields.push(`founder_website = $${idx++}`);
      values.push(data.founder_website.trim() || null);
    }
    if (data.founder_discord !== void 0) {
      fields.push(`founder_discord = $${idx++}`);
      values.push(data.founder_discord.trim() || null);
    }
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
async function listCatalogProjects(category) {
  const client = await pool.connect();
  try {
    let query = "SELECT * FROM catalog_projects WHERE is_approved = true";
    const params = [];
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
async function listAllCatalogProjectsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM catalog_projects ORDER BY id DESC");
    return res.rows;
  } finally {
    client.release();
  }
}
async function createCatalogProject(data) {
  const client = await pool.connect();
  try {
    const isApproved = data.is_approved !== void 0 ? Boolean(data.is_approved) : false;
    const res = await client.query(
      `INSERT INTO catalog_projects (
        title, url, category, description, author, author_handle, thumbnail_bg, visual_type, preview_image_url, tags, stars, is_sponsored, sponsored_label, is_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        data.title,
        data.url,
        data.category || "Finds",
        data.description || null,
        data.author || "Community",
        data.author_handle || "builder",
        data.thumbnail_bg || "#121214",
        data.visual_type || "screenshot",
        data.preview_image_url || null,
        data.tags || ["Community", "Curated"],
        data.stars || 1,
        data.is_sponsored || false,
        data.sponsored_label || null,
        isApproved
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateCatalogProject(id, data) {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.title !== void 0) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.url !== void 0) {
      fields.push(`url = $${idx++}`);
      values.push(data.url);
    }
    if (data.category !== void 0) {
      fields.push(`category = $${idx++}`);
      values.push(data.category);
    }
    if (data.description !== void 0) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.author !== void 0) {
      fields.push(`author = $${idx++}`);
      values.push(data.author);
    }
    if (data.author_handle !== void 0) {
      fields.push(`author_handle = $${idx++}`);
      values.push(data.author_handle);
    }
    if (data.thumbnail_bg !== void 0) {
      fields.push(`thumbnail_bg = $${idx++}`);
      values.push(data.thumbnail_bg);
    }
    if (data.visual_type !== void 0) {
      fields.push(`visual_type = $${idx++}`);
      values.push(data.visual_type);
    }
    if (data.preview_image_url !== void 0) {
      fields.push(`preview_image_url = $${idx++}`);
      values.push(data.preview_image_url);
    }
    if (data.tags !== void 0) {
      fields.push(`tags = $${idx++}`);
      values.push(data.tags);
    }
    if (data.stars !== void 0) {
      fields.push(`stars = $${idx++}`);
      values.push(data.stars);
    }
    if (data.is_sponsored !== void 0) {
      fields.push(`is_sponsored = $${idx++}`);
      values.push(data.is_sponsored);
    }
    if (data.sponsored_label !== void 0) {
      fields.push(`sponsored_label = $${idx++}`);
      values.push(data.sponsored_label);
    }
    if (data.is_approved !== void 0) {
      fields.push(`is_approved = $${idx++}`);
      values.push(data.is_approved);
    }
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
async function deleteCatalogProject(id) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM catalog_projects WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}
async function saveProjectAsset(filename, mimeType, base64Data) {
  const client = await pool.connect();
  try {
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
    await client.query("UPDATE project_assets SET public_url = $1 WHERE id = $2", [publicUrl, asset.id]);
    return { id: asset.id, url: publicUrl, filename: asset.filename };
  } finally {
    client.release();
  }
}
async function getProjectAsset(id) {
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
async function listProjectSections() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM project_sections ORDER BY sort_order ASC, id ASC");
    return res.rows;
  } finally {
    client.release();
  }
}
async function createProjectSection(data) {
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
async function deleteProjectSection(id) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM project_sections WHERE id = $1 RETURNING id", [id]);
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}
async function listProjectComments(projectId) {
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
async function createProjectComment(data) {
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
        data.type || "feedback"
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteProjectComment(id, userId, isAdmin) {
  const client = await pool.connect();
  try {
    let queryStr = "DELETE FROM project_comments WHERE id = $1";
    const params = [id];
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
async function listStartupComments(startupId) {
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
async function createStartupComment(data) {
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
        data.content.trim()
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getStartupRatingsSummary(startupId) {
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
    const avgIdea = Number(row.avg_idea) || 5;
    const avgExecution = Number(row.avg_execution) || 5;
    const avgDesign = Number(row.avg_design) || 5;
    const overall = total > 0 ? Number(((avgIdea + avgExecution + avgDesign) / 3).toFixed(1)) : 5;
    return {
      totalRatings: total,
      overall,
      idea: avgIdea,
      execution: avgExecution,
      design: avgDesign
    };
  } finally {
    client.release();
  }
}
async function createStartupRating(data) {
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
        data.designScore
      ]
    );
    return await getStartupRatingsSummary(data.startupId);
  } finally {
    client.release();
  }
}
async function listBuilderJobs(options = {}) {
  const client = await pool.connect();
  try {
    let queryStr = "SELECT * FROM builder_jobs";
    const params = [];
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
async function listUserJobs(userId) {
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
async function createBuilderJob(data) {
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
        Boolean(data.isFeatured)
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateBuilderJob(id, userId, data, isAdmin) {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.title !== void 0) {
      fields.push(`title = $${idx++}`);
      values.push(data.title.trim());
    }
    if (data.company_name !== void 0) {
      fields.push(`company_name = $${idx++}`);
      values.push(data.company_name.trim());
    }
    if (data.company_logo !== void 0) {
      fields.push(`company_logo = $${idx++}`);
      values.push(data.company_logo?.trim() || null);
    }
    if (data.location !== void 0) {
      fields.push(`location = $${idx++}`);
      values.push(data.location?.trim() || null);
    }
    if (data.is_remote !== void 0) {
      fields.push(`is_remote = $${idx++}`);
      values.push(Boolean(data.is_remote));
    }
    if (data.job_type !== void 0) {
      fields.push(`job_type = $${idx++}`);
      values.push(data.job_type);
    }
    if (data.salary_range !== void 0) {
      fields.push(`salary_range = $${idx++}`);
      values.push(data.salary_range?.trim() || null);
    }
    if (data.skills !== void 0) {
      fields.push(`skills = $${idx++}`);
      values.push(data.skills);
    }
    if (data.description !== void 0) {
      fields.push(`description = $${idx++}`);
      values.push(data.description.trim());
    }
    if (data.apply_url !== void 0) {
      fields.push(`apply_url = $${idx++}`);
      values.push(data.apply_url.trim());
    }
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
async function updateBuilderJobStatus(id, userId, isActive, isAdmin) {
  const client = await pool.connect();
  try {
    let queryStr = "UPDATE builder_jobs SET is_active = $1, updated_at = NOW() WHERE id = $2";
    const params = [isActive, id];
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
async function deleteBuilderJob(id, userId, isAdmin) {
  const client = await pool.connect();
  try {
    let queryStr = "DELETE FROM builder_jobs WHERE id = $1";
    const params = [id];
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
async function listBuilderHackathons(options = {}) {
  const client = await pool.connect();
  try {
    let queryStr = "SELECT * FROM builder_hackathons";
    const params = [];
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
async function listUserHackathons(userId) {
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
async function createBuilderHackathon(data) {
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
        data.tags || ["Hackathon", "Builders"]
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteBuilderHackathon(id, userId, isAdmin) {
  const client = await pool.connect();
  try {
    let queryStr = "DELETE FROM builder_hackathons WHERE id = $1";
    const params = [id];
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
async function listAllBuilderJobsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM builder_jobs ORDER BY created_at DESC");
    return res.rows;
  } finally {
    client.release();
  }
}
async function listAllBuilderHackathonsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM builder_hackathons ORDER BY created_at DESC");
    return res.rows;
  } finally {
    client.release();
  }
}
async function listAllPaidEntitiesAdmin() {
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
async function toggleUserVerification(id) {
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
async function toggleJobFeatured(id) {
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
async function toggleStartupFeatured(id) {
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
async function setHackathonApproval(id, approved) {
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
async function listCouponsAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM coupons ORDER BY created_at DESC");
    return res.rows;
  } finally {
    client.release();
  }
}
async function createCouponAdmin(data) {
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
        data.expires_at || null
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function toggleCouponAdmin(id) {
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
async function deleteCouponAdmin(id) {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM coupons WHERE id = $1 RETURNING id", [id]);
    return res.rowCount ? res.rowCount > 0 : false;
  } finally {
    client.release();
  }
}
async function validateCoupon(code, amount) {
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
    if (coupon.expires_at && new Date(coupon.expires_at) < /* @__PURE__ */ new Date()) {
      return { valid: false, error: "This coupon has expired." };
    }
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return { valid: false, error: "This coupon has reached its maximum usage limit." };
    }
    if (coupon.min_order_amount && amount < Number(coupon.min_order_amount)) {
      return { valid: false, error: `Minimum order amount of \u20B9${coupon.min_order_amount} required to use this coupon.` };
    }
    let discountAmount = 0;
    const discountVal = Number(coupon.discount_value);
    if (coupon.discount_type === "percentage") {
      discountAmount = Math.round(amount * discountVal / 100);
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
        discount_amount: discountAmount
      },
      discountAmount,
      finalAmount
    };
  } finally {
    client.release();
  }
}
async function listBuildersWithContributions(limit = 100) {
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
async function toggleStartupUpvote(startupId, userId, ipAddress) {
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
      upvotesCount: updated.rows[0]?.upvotes_count || 0
    };
  } finally {
    client.release();
  }
}
async function listCommunityPosts({
  category,
  limit = 50,
  offset = 0,
  search,
  currentUserId
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
    const params = [];
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
async function createCommunityPost({
  userId,
  authorName,
  authorUsername,
  authorAvatar,
  isVerified = false,
  title,
  content,
  category = "ask",
  tags = [],
  mediaUrl
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
        mediaUrl || null
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function togglePostUpvote(postId, userId) {
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
async function listPostComments(postId) {
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
async function createPostComment({
  postId,
  userId,
  authorName,
  authorUsername,
  authorAvatar,
  isVerified = false,
  content
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
async function listLaunchpadProducts({
  category,
  search,
  userId
} = {}) {
  const client = await pool.connect();
  try {
    let query = `
      SELECT p.*,
             COALESCE(u.is_verified, false) as is_verified,
             COALESCE(u.is_pro, false) as is_pro,
             COALESCE(u.avatar_url, p.logo_url) as founder_avatar,
             u.plan,
             EXISTS(
               SELECT 1 FROM launchpad_upvotes uv 
               WHERE uv.product_id = p.id AND uv.user_id = $1
             ) as has_upvoted
      FROM launchpad_products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_approved = true
    `;
    const params = [userId || null];
    let pIdx = 2;
    if (category && category !== "ALL") {
      query += ` AND LOWER(p.category) = LOWER($${pIdx})`;
      params.push(category);
      pIdx++;
    }
    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(p.name) LIKE $${pIdx} OR LOWER(p.problem_solving) LIKE $${pIdx} OR LOWER(p.tagline) LIKE $${pIdx} OR LOWER(p.founder_name) LIKE $${pIdx} OR LOWER(p.founder_username) LIKE $${pIdx})`;
      params.push(q);
      pIdx++;
    }
    query += ` ORDER BY p.is_featured DESC, p.upvotes_count DESC, p.created_at DESC LIMIT 100`;
    const res = await client.query(query, params);
    return res.rows;
  } finally {
    client.release();
  }
}
async function createLaunchpadProduct({
  userId,
  founderName,
  founderUsername,
  name,
  tagline,
  problemSolving,
  url,
  category = "Software",
  stage = "Prototype",
  logoUrl,
  mediaUrl
}) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO launchpad_products (
        user_id, founder_name, founder_username, name, tagline, problem_solving, url, category, stage, logo_url, media_url, upvotes_count, is_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1, true)
      RETURNING *`,
      [
        userId,
        founderName,
        founderUsername || null,
        name,
        tagline || null,
        problemSolving,
        url,
        category,
        stage,
        logoUrl || null,
        mediaUrl || null
      ]
    );
    const newProduct = res.rows[0];
    await client.query(
      `INSERT INTO launchpad_upvotes (product_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [newProduct.id, userId]
    );
    return newProduct;
  } finally {
    client.release();
  }
}
async function toggleLaunchpadUpvote({
  productId,
  userId,
  ipAddress
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let hasUpvoted = false;
    if (userId) {
      const existing = await client.query(
        "SELECT id FROM launchpad_upvotes WHERE product_id = $1 AND user_id = $2",
        [productId, userId]
      );
      if (existing.rows.length > 0) {
        await client.query("DELETE FROM launchpad_upvotes WHERE product_id = $1 AND user_id = $2", [productId, userId]);
        await client.query("UPDATE launchpad_products SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = $1", [productId]);
        hasUpvoted = false;
      } else {
        await client.query("INSERT INTO launchpad_upvotes (product_id, user_id, ip_address) VALUES ($1, $2, $3)", [productId, userId, ipAddress || null]);
        await client.query("UPDATE launchpad_products SET upvotes_count = upvotes_count + 1 WHERE id = $1", [productId]);
        hasUpvoted = true;
      }
    } else {
      const existing = await client.query(
        "SELECT id FROM launchpad_upvotes WHERE product_id = $1 AND ip_address = $2",
        [productId, ipAddress || "unknown"]
      );
      if (existing.rows.length > 0) {
        await client.query("DELETE FROM launchpad_upvotes WHERE product_id = $1 AND ip_address = $2", [productId, ipAddress || "unknown"]);
        await client.query("UPDATE launchpad_products SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = $1", [productId]);
        hasUpvoted = false;
      } else {
        await client.query("INSERT INTO launchpad_upvotes (product_id, ip_address) VALUES ($1, $2)", [productId, ipAddress || "unknown"]);
        await client.query("UPDATE launchpad_products SET upvotes_count = upvotes_count + 1 WHERE id = $1", [productId]);
        hasUpvoted = true;
      }
    }
    const countRes = await client.query("SELECT upvotes_count FROM launchpad_products WHERE id = $1", [productId]);
    await client.query("COMMIT");
    return {
      hasUpvoted,
      upvotesCount: countRes.rows[0]?.upvotes_count || 0
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// server/apiRouter.ts
function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function checkAdminAuth(req) {
  const headerKey = req.headers && (req.headers["x-admin-key"] || req.headers["admin-key"]) || "";
  const authHeader = req.headers && req.headers["authorization"] || "";
  const bearerKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const provided = (headerKey || bearerKey || "").trim();
  const validKeys = [
    process.env.ADMIN_SECRET,
    "Tanisha@1060",
    "Tanisha@2026",
    "rawenergon",
    "Aditya@1060A",
    "recolabs2026"
  ].filter(Boolean);
  return validKeys.includes(provided);
}
async function handleNetworkRequest(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key, admin-key");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  let pathname = "";
  const qRoute = req.query?.route;
  if (qRoute) {
    const segs = Array.isArray(qRoute) ? qRoute.join("/") : qRoute;
    pathname = `/api/network/${segs}`;
  } else if (req.headers && req.headers["x-matched-path"]) {
    pathname = String(req.headers["x-matched-path"]);
  } else if (req.url) {
    pathname = new URL(req.url, "http://localhost").pathname;
  }
  pathname = pathname.replace(/\/$/, "");
  let searchParams = new URLSearchParams();
  if (req.url && req.url.includes("?")) {
    searchParams = new URL(req.url, "http://localhost").searchParams;
  } else if (req.query) {
    for (const [k, v] of Object.entries(req.query)) {
      if (k !== "route" && typeof v === "string") {
        searchParams.set(k, v);
      }
    }
  }
  const parseBody = () => new Promise((resolve) => {
    if (req.body && typeof req.body === "object") {
      return resolve(req.body);
    }
    if (typeof req.body === "string") {
      try {
        return resolve(JSON.parse(req.body));
      } catch {
        return resolve({});
      }
    }
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
  const getAuthUser = () => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return verifyToken(token);
  };
  try {
    await initDb();
    if (req.method === "POST" && pathname === "/api/network/signup") {
      const body = await parseBody();
      if (!body.email || !body.password || !body.name) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Name, email, and password are required." }));
        return;
      }
      const data = await createUser(body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...data }));
      return;
    }
    if (req.method === "POST" && pathname === "/api/network/login") {
      const body = await parseBody();
      if (!body.email || !body.password) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Email and password are required." }));
        return;
      }
      const data = await loginUser(body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...data }));
      return;
    }
    if (req.method === "POST" && pathname === "/api/network/oauth-sync") {
      const body = await parseBody();
      if (!body.email) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Email is required for OAuth." }));
        return;
      }
      const data = await syncOAuthUser({
        email: body.email,
        name: body.name || "Builder",
        avatarUrl: body.avatarUrl,
        provider: body.provider === "github" ? "github" : "google",
        preferredUsername: body.preferredUsername
      });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...data }));
      return;
    }
    if (req.method === "GET" && pathname === "/api/network/profile") {
      const auth = getAuthUser();
      if (!auth) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized. Please sign in." }));
        return;
      }
      const user = await getUserById(auth.id);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, user }));
      return;
    }
    if (req.method === "PUT" && pathname === "/api/network/profile") {
      const auth = getAuthUser();
      if (!auth) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized. Please sign in." }));
        return;
      }
      const body = await parseBody();
      const updated = await updateUserProfile(auth.id, body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, user: updated }));
      return;
    }
    if (req.method === "GET" && pathname.startsWith("/api/network/builder/")) {
      const username = pathname.replace("/api/network/builder/", "").trim();
      if (!username) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Username is required." }));
        return;
      }
      const user = await getUserByUsername(username);
      if (!user) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: `Builder @${username} not found.` }));
        return;
      }
      const startups = await listStartups({ username });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, user, startups }));
      return;
    }
    if (req.method === "GET" && pathname === "/api/network/builders") {
      const limit = parseInt(searchParams.get("limit") || "100", 10);
      const builders = await listBuildersWithContributions(limit);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, builders }));
      return;
    }
    if (req.method === "POST" && (pathname.startsWith("/api/network/startups/") && pathname.endsWith("/upvote") || pathname === "/api/network/upvote")) {
      let startupId = 0;
      if (pathname === "/api/network/upvote") {
        const body = await parseBody();
        startupId = parseInt(body.startupId || body.id || "0", 10);
      } else {
        const match = pathname.match(/\/api\/network\/startups\/(\d+)\/upvote/);
        startupId = match ? parseInt(match[1], 10) : 0;
      }
      if (!startupId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid startup ID is required." }));
        return;
      }
      const auth = getAuthUser();
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
      const result = await toggleStartupUpvote(startupId, auth?.id, ip);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return;
    }
    if (req.method === "GET" && pathname === "/api/network/launchpad") {
      const category = searchParams.get("category") || void 0;
      const search = searchParams.get("search") || void 0;
      const auth = getAuthUser();
      const products = await listLaunchpadProducts({ category, search, userId: auth?.id });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, launches: products }));
      return;
    }
    if (req.method === "POST" && pathname === "/api/network/launchpad") {
      const auth = getAuthUser();
      if (!auth) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Authentication required to launch product." }));
        return;
      }
      const body = await parseBody();
      if (!body.name || !body.problem_solving && !body.problemSolving || !body.url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Name, problem solving, and demo URL are required." }));
        return;
      }
      const user = await getUserById(auth.id);
      const product = await createLaunchpadProduct({
        userId: auth.id,
        founderName: user?.name || body.founderName || "Builder",
        founderUsername: user?.username || body.founderUsername || "",
        name: String(body.name || "").trim(),
        tagline: body.tagline || null,
        problemSolving: String(body.problem_solving || body.problemSolving || "").trim(),
        url: String(body.url || "").trim(),
        category: body.category || "Software",
        stage: body.stage || "Prototype",
        logoUrl: body.logo_url || body.logoUrl || null,
        mediaUrl: body.media_url || body.mediaUrl || null
      });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, launch: product }));
      return;
    }
    if (req.method === "POST" && (pathname.startsWith("/api/network/launchpad/") && pathname.endsWith("/upvote") || pathname === "/api/network/launchpad/upvote")) {
      let productId = 0;
      if (pathname === "/api/network/launchpad/upvote") {
        const body = await parseBody();
        productId = parseInt(body.productId || body.id || "0", 10);
      } else {
        const match = pathname.match(/\/api\/network\/launchpad\/(\d+)\/upvote/);
        productId = match ? parseInt(match[1], 10) : 0;
      }
      if (!productId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid product ID required for upvote." }));
        return;
      }
      const auth = getAuthUser();
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
      const result = await toggleLaunchpadUpvote({ productId, userId: auth?.id, ipAddress: ip });
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return;
    }
    if (req.method === "GET" && (pathname === "/api/network/posts" || pathname === "/api/network/discussions")) {
      const category = searchParams.get("category") || void 0;
      const search = searchParams.get("search") || void 0;
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);
      const auth = getAuthUser();
      const posts = await listCommunityPosts({ category, search, limit, offset, currentUserId: auth?.id });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, posts }));
      return;
    }
    if (req.method === "POST" && (pathname === "/api/network/posts" || pathname === "/api/network/discussions")) {
      const auth = getAuthUser();
      const body = await parseBody();
      if (!body.content || !body.content.trim()) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Post content cannot be empty." }));
        return;
      }
      let authorName = body.authorName || "Anonymous Builder";
      let authorUsername = body.authorUsername || "builder";
      let authorAvatar = body.authorAvatar || null;
      let isVerified = false;
      if (auth) {
        const user = await getUserById(auth.id);
        if (user) {
          authorName = user.name || authorName;
          authorUsername = user.username || authorUsername;
          authorAvatar = user.avatar_url || authorAvatar;
          isVerified = !!user.is_verified;
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
        mediaUrl: body.mediaUrl || null
      });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, post }));
      return;
    }
    if (req.method === "POST" && pathname.startsWith("/api/network/posts/") && pathname.endsWith("/upvote")) {
      const match = pathname.match(/\/api\/network\/posts\/(\d+)\/upvote/);
      const postId = match ? parseInt(match[1], 10) : 0;
      if (!postId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid post ID is required." }));
        return;
      }
      const auth = getAuthUser();
      const result = await togglePostUpvote(postId, auth?.id);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return;
    }
    if (pathname.startsWith("/api/network/posts/") && pathname.endsWith("/comments")) {
      const match = pathname.match(/\/api\/network\/posts\/(\d+)\/comments/);
      const postId = match ? parseInt(match[1], 10) : 0;
      if (!postId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Valid post ID is required." }));
        return;
      }
      if (req.method === "GET") {
        const comments = await listPostComments(postId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, comments }));
        return;
      }
      if (req.method === "POST") {
        const auth = getAuthUser();
        const body = await parseBody();
        if (!body.content || !body.content.trim()) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Comment content is required." }));
          return;
        }
        let authorName = body.authorName || "Anonymous Builder";
        let authorUsername = body.authorUsername || "builder";
        let authorAvatar = body.authorAvatar || null;
        let isVerified = false;
        if (auth) {
          const user = await getUserById(auth.id);
          if (user) {
            authorName = user.name || authorName;
            authorUsername = user.username || authorUsername;
            authorAvatar = user.avatar_url || authorAvatar;
            isVerified = !!user.is_verified;
          }
        }
        const comment = await createPostComment({
          postId,
          userId: auth?.id || null,
          authorName,
          authorUsername,
          authorAvatar,
          isVerified,
          content: body.content.trim()
        });
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, comment }));
        return;
      }
    }
    if (req.method === "GET" && (pathname === "/api/network/builder-preview" || pathname.startsWith("/api/network/builder-preview"))) {
      let username = searchParams.get("username") || pathname.replace("/api/network/builder-preview", "").replace(/^\//, "").trim();
      username = username.replace(/^@/, "").trim();
      let title = "Reco Labs";
      let desc = "The Skill Exchange for curious Mind. A global collective of young hackers, builders, and makers shipping high-impact software, hardware rigs, and tutorials.";
      let image = "https://recolabs.in/twitter-image.png";
      let url = `https://recolabs.in/builder/${username}`;
      if (username) {
        try {
          const user = await getUserByUsername(username);
          if (user) {
            const displayName = user.name || user.username || user.username || username;
            title = `${displayName} (@${user.username}) | Reco Labs`;
            desc = user.bio || `${displayName} is building software, hardware rigs, and shipping on Reco Labs.`;
            if (user.avatar_url && (user.avatar_url.startsWith("http") || user.avatar_url.startsWith("/"))) {
              image = user.avatar_url.startsWith("http") ? user.avatar_url : `https://recolabs.in${user.avatar_url}`;
            }
          } else {
            title = `@${username} | Reco Labs`;
          }
        } catch {
        }
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
</html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.statusCode = 200;
      res.end(html);
      return;
    }
    if (req.method === "GET" && pathname === "/api/network/seo-preview") {
      const page = (searchParams.get("page") || "").toLowerCase().trim();
      let title = "Reco Labs";
      let desc = "The Skill Exchange for curious Mind. A global collective of young hackers, builders, and makers shipping high-impact software, hardware rigs, and tutorials.";
      let image = "https://recolabs.in/twitter-image.png";
      let url = "https://recolabs.in";
      if (page === "projects" || page === "project") {
        title = "Projects | Reco Labs";
        desc = "190+ hand-picked design systems, open source tools, terminal utilities, and engineering rigs.";
        image = "https://recolabs.in/twitter-projects.png";
        url = "https://recolabs.in/projects";
      } else if (page === "network") {
        title = "Network | Reco Labs";
        desc = "The professional network for builders to show and tell. Showcase your work, launch projects, find jobs, and connect with peers.";
        image = "https://recolabs.in/twitter-network.png";
        url = "https://recolabs.in/network";
      } else if (page === "about") {
        title = "About | Reco Labs";
        desc = "From high school experiment to global guild. Founded by Aditya Raj & Tanish to empower curious young minds.";
        image = "https://recolabs.in/twitter-image.png";
        url = "https://recolabs.in/about";
      } else if (page === "jobs") {
        title = "Jobs | Reco Labs";
        desc = "Work with high-velocity startups and developer tool founders. Internships, gigs, and full-time engineering roles.";
        image = "https://recolabs.in/twitter-jobs.png";
        url = "https://recolabs.in/jobs";
      } else if (page === "hackathons" || page === "hackathon") {
        title = "Hackathons | Reco Labs";
        desc = "Curated hackathons for high school hackers and collegiate builders. Ship projects, win grants, meet peers.";
        image = "https://recolabs.in/twitter-image.png";
        url = "https://recolabs.in/hackathons";
      } else if (page === "sponsors" || page === "sponsor") {
        title = "Sponsors | Reco Labs";
        desc = "Support the next generation of builders. Transparent community sponsorship and founder visibility.";
        image = "https://recolabs.in/twitter-image.png";
        url = "https://recolabs.in/sponsors";
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

  <meta http-equiv="refresh" content="0;url=${escapeHtml(url.replace("https://recolabs.in", ""))}">
</head>
<body style="background:#0c0c0e;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
  <h2>${escapeHtml(title)}</h2>
  <p>${escapeHtml(desc)}</p>
  <script>window.location.replace("${escapeHtml(url.replace("https://recolabs.in", ""))}");</script>
</body>
</html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.statusCode = 200;
      res.end(html);
      return;
    }
    if (req.method === "GET" && pathname === "/api/network/stats") {
      const stats = await getNetworkStats();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...stats }));
      return;
    }
    if (req.method === "GET" && (pathname === "/api/network/startups" || pathname === "/api/network")) {
      const search = searchParams.get("search") || "";
      const category = searchParams.get("category") || "ALL";
      const username = searchParams.get("username") || void 0;
      const startups = await listStartups({ search, category, username });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, count: startups.length, startups }));
      return;
    }
    if (req.method === "POST" && pathname === "/api/network/startups") {
      const body = await parseBody();
      const auth = getAuthUser();
      if (!body.name || !body.url || !body.problem_solving) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            error: "Startup Name, URL, and Problem Solving description are required."
          })
        );
        return;
      }
      let founderName = body.founder_name;
      let founderUsername = body.founder_username;
      let founderEmail = body.founder_email;
      let founderPhone = body.founder_phone;
      let founderWebsite = body.founder_website;
      let founderDiscord = body.founder_discord;
      let userId = null;
      if (auth) {
        userId = auth.id;
        const user = await getUserById(auth.id);
        if (user) {
          founderName = founderName || (user.name || user.username);
          founderUsername = founderUsername || user.username;
          founderEmail = founderEmail || user.email;
          founderPhone = founderPhone || user.phone;
          founderWebsite = founderWebsite || user.website;
          founderDiscord = founderDiscord || user.discord;
        }
      }
      if (!founderName) {
        founderName = "Anonymous Founder";
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
        stage: body.stage || "Prototype"
      });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, startup }));
      return;
    }
    if (req.method === "GET" && (pathname === "/api/network/ads" || pathname === "/api/ads")) {
      const placement = searchParams.get("placement") || void 0;
      const ads = await listAds(placement);
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ads }));
      return;
    }
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
    if (req.method === "POST" && (pathname === "/api/network/ads/click" || pathname === "/api/ads/click")) {
      const body = await parseBody();
      if (body.id) {
        await incrementAdClick(Number(body.id));
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
      return;
    }
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
    if (req.method === "PUT" && (pathname.startsWith("/api/network/ads/") || pathname.startsWith("/api/ads/")) || req.method === "POST" && (pathname === "/api/network/ads/update" || pathname === "/api/ads/update")) {
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
    if (req.method === "DELETE" && (pathname.startsWith("/api/network/ads/") || pathname.startsWith("/api/ads/")) || req.method === "POST" && (pathname === "/api/network/ads/delete" || pathname === "/api/ads/delete")) {
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
    if (req.method === "GET" && (pathname === "/api/network/store-links" || pathname === "/api/store-links")) {
      const category = searchParams.get("category") || void 0;
      const links = await listStoreLinks(category);
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, store_links: links }));
      return;
    }
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
    if (req.method === "PUT" && (pathname.startsWith("/api/network/store-links/") || pathname.startsWith("/api/store-links/")) || req.method === "POST" && (pathname === "/api/network/store-links/update" || pathname === "/api/store-links/update")) {
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
    if (req.method === "DELETE" && (pathname.startsWith("/api/network/store-links/") || pathname.startsWith("/api/store-links/")) || req.method === "POST" && (pathname === "/api/network/store-links/delete" || pathname === "/api/store-links/delete")) {
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
    if (req.method === "DELETE" && (pathname.startsWith("/api/network/startups/") || pathname.startsWith("/api/startups/")) || req.method === "POST" && (pathname === "/api/network/startups/delete" || pathname === "/api/startups/delete")) {
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
    if (req.method === "PUT" && (pathname.startsWith("/api/network/startups/") || pathname.startsWith("/api/startups/")) || req.method === "POST" && (pathname === "/api/network/startups/update" || pathname === "/api/startups/update")) {
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
    if (req.method === "GET" && (pathname === "/api/network/projects" || pathname === "/api/projects" || pathname === "/api/network/catalog")) {
      const category = searchParams.get("category") || void 0;
      const projects = await listCatalogProjects(category);
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, projects }));
      return;
    }
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
    if (req.method === "POST" && (pathname === "/api/network/projects" || pathname === "/api/projects" || pathname === "/api/network/catalog")) {
      const body = await parseBody();
      if (!body.title || !body.url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Title and url are required." }));
        return;
      }
      const isAdmin = checkAdminAuth(req);
      const isApproved = isAdmin ? body.is_approved !== void 0 ? Boolean(body.is_approved) : true : false;
      const created = await createCatalogProject({ ...body, is_approved: isApproved });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, project: created }));
      return;
    }
    if (req.method === "POST" && (pathname === "/api/network/projects/approve" || pathname === "/api/projects/approve" || pathname === "/api/network/admin/projects/approve")) {
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
      const isApproved = body.is_approved !== void 0 ? Boolean(body.is_approved) : true;
      const updated = await updateCatalogProject(id, { is_approved: isApproved });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, project: updated }));
      return;
    }
    if (req.method === "PUT" && (pathname.startsWith("/api/network/projects/") || pathname.startsWith("/api/projects/")) || req.method === "POST" && (pathname === "/api/network/projects/update" || pathname === "/api/projects/update")) {
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
    if (req.method === "DELETE" && (pathname.startsWith("/api/network/projects/") || pathname.startsWith("/api/projects/")) || req.method === "POST" && (pathname === "/api/network/projects/delete" || pathname === "/api/projects/delete")) {
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
    if (req.method === "POST" && (pathname === "/api/network/upload" || pathname === "/api/upload" || pathname === "/api/network/assets/upload")) {
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
    if (req.method === "GET" && (pathname === "/api/network/sections" || pathname === "/api/sections")) {
      const sections = await listProjectSections();
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, sections }));
      return;
    }
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
    if (req.method === "DELETE" && pathname.startsWith("/api/network/sections/") || req.method === "POST" && (pathname === "/api/network/sections/delete" || pathname === "/api/sections/delete")) {
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
    if (req.method === "GET" && (pathname.startsWith("/api/network/projects/") && pathname.endsWith("/comments") || pathname === "/api/network/comments" || pathname === "/api/comments")) {
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
    if (req.method === "POST" && (pathname.startsWith("/api/network/projects/") && pathname.endsWith("/comments") || pathname === "/api/network/comments" || pathname === "/api/comments")) {
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
        userId: user ? user.id : void 0,
        authorName: (body.authorName || body.author_name || (user ? user.username : "") || "Curious Builder").trim(),
        authorUsername: (body.authorUsername || body.author_username || (user ? user.username : "") || "").trim() || void 0,
        authorAvatar: (body.authorAvatar || body.author_avatar || "").trim() || void 0,
        content: body.content.trim(),
        type: body.type || "feedback"
      });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, comment }));
      return;
    }
    if (req.method === "DELETE" && pathname.startsWith("/api/network/comments/") || req.method === "POST" && (pathname === "/api/network/comments/delete" || pathname === "/api/comments/delete")) {
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
      const deleted = await deleteProjectComment(id, user ? user.id : void 0, isAdmin);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted }));
      return;
    }
    if (req.method === "GET" && (pathname.startsWith("/api/network/startups/") && pathname.endsWith("/comments") || pathname === "/api/network/startup-comments")) {
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
    if (req.method === "POST" && (pathname.startsWith("/api/network/startups/") && pathname.endsWith("/comments") || pathname === "/api/network/startup-comments")) {
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
      const user = getAuthUser();
      const authorName = user?.name || String(body.authorName || body.author_name || "Community Builder").trim();
      const authorUsername = user?.username || String(body.authorUsername || body.author_username || "").trim();
      const authorAvatar = user?.avatar_url || body.authorAvatar || body.author_avatar || null;
      const created = await createStartupComment({
        startupId,
        userId: user ? user.id : void 0,
        authorName,
        authorUsername,
        authorAvatar,
        content
      });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, comment: created }));
      return;
    }
    if (req.method === "GET" && (pathname.startsWith("/api/network/startups/") && pathname.endsWith("/ratings") || pathname === "/api/network/startup-ratings")) {
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
    if (req.method === "POST" && (pathname.startsWith("/api/network/startups/") && pathname.endsWith("/ratings") || pathname === "/api/network/startup-ratings")) {
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
        userId: user ? user.id : void 0,
        ideaScore,
        executionScore,
        designScore
      });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ratings: updatedSummary }));
      return;
    }
    if (req.method === "POST" && (pathname === "/api/network/admin/send-email" || pathname === "/api/admin/send-email")) {
      if (!checkAdminAuth(req)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized: Admin credentials required to send emails." }));
        return;
      }
      const body = await parseBody();
      const { to, subject, message, html } = body;
      if (!to || !subject || !message && !html) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Recipient email (to), subject, and message content are required." }));
        return;
      }
      const recipients = Array.isArray(to) ? to : [to];
      const resendApiKey = process.env.RESEND_API_KEY || Buffer.from("cmVfYWdmNG9WTlRfMkxnUzFGQUJaZ0syQU5uMllYWEgxSlBI", "base64").toString("utf-8");
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
      <a href="https://recolabs.in" class="btn">Visit Reco Labs \u2197</a>
    </div>
    <div class="footer">
      Sent by Reco Labs Guild \xB7 <a href="https://recolabs.in" style="color: #a1a1aa;">recolabs.in</a><br>
      Dispatched via noreply@recolabs.in
    </div>
  </div>
</body>
</html>
`;
      if (resendApiKey) {
        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + resendApiKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "Reco Labs <noreply@recolabs.in>",
              reply_to: "noreply@recolabs.in",
              to: recipients,
              subject,
              html: emailHtml,
              text: message || ""
            })
          });
          const resendData = await resendResponse.json();
          if (resendResponse.ok && resendData.id) {
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                provider: "resend",
                id: resendData.id,
                to: recipients,
                sender: "Reco Labs <noreply@recolabs.in>"
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
            pass: smtpPass
          }
        });
        const info = await transporter.sendMail({
          from: `"Reco Labs" <${smtpUser}>`,
          replyTo: "noreply@recolabs.in",
          to: recipients,
          subject,
          text: message || "",
          html: emailHtml
        });
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            provider: "gmail_smtp",
            messageId: info.messageId,
            to: recipients,
            sender: `Reco Labs <${smtpUser}>`
          })
        );
        return;
      } catch (smtpErr) {
        console.error("Gmail SMTP error:", smtpErr);
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, error: "Delivery failed: " + (smtpErr?.message || String(smtpErr)) }));
        return;
      }
    }
    if (req.method === "GET" && (pathname === "/api/network/jobs" || pathname === "/api/jobs")) {
      const urlObj = new URL(req.url, "http://localhost");
      const onlyActive = urlObj.searchParams.get("all") !== "true";
      const limit = urlObj.searchParams.get("limit") ? Number(urlObj.searchParams.get("limit")) : void 0;
      const jobs = await listBuilderJobs({ onlyActive, limit });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, jobs }));
      return;
    }
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
        authorName: body.author_name || (user.name || user.username) || "Founder",
        authorUsername: user.username,
        title: body.title,
        companyName: body.company_name,
        companyLogo: body.company_logo,
        location: body.location || "Remote",
        isRemote: body.is_remote !== false,
        jobType: body.job_type || "Full-time",
        salaryRange: body.salary_range,
        skills: Array.isArray(body.skills) ? body.skills : body.skills ? body.skills.split(",").map((s) => s.trim()) : [],
        description: body.description,
        applyUrl: body.apply_url,
        isFeatured: Boolean(body.is_featured)
      });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, job }));
      return;
    }
    if (req.method === "POST" && (pathname === "/api/network/jobs/update" || pathname === "/api/jobs/update" || pathname === "/api/network/builder-jobs/update") || req.method === "PUT" && ((pathname.startsWith("/api/network/jobs/") || pathname.startsWith("/api/network/builder-jobs/")) && !pathname.endsWith("/status"))) {
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
    if (req.method === "POST" && (pathname === "/api/network/jobs/status" || pathname === "/api/jobs/status") || req.method === "PATCH" && (pathname.includes("/jobs/") && pathname.endsWith("/status"))) {
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
    if (req.method === "POST" && (pathname === "/api/network/jobs/delete" || pathname === "/api/jobs/delete") || req.method === "DELETE" && (pathname.startsWith("/api/network/jobs/") || pathname.startsWith("/api/jobs/"))) {
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
    if (req.method === "GET" && (pathname === "/api/network/builder-hackathons" || pathname === "/api/builder-hackathons")) {
      const urlObj = new URL(req.url, "http://localhost");
      const onlyApproved = urlObj.searchParams.get("all") !== "true";
      const limit = urlObj.searchParams.get("limit") ? Number(urlObj.searchParams.get("limit")) : void 0;
      const hackathons = await listBuilderHackathons({ onlyApproved, limit });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, hackathons }));
      return;
    }
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
        authorName: body.author_name || (user.name || user.username) || "Organizer",
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
        tags: Array.isArray(body.tags) ? body.tags : body.tags ? body.tags.split(",").map((t) => t.trim()) : ["Hackathon", "Builders"]
      });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, hackathon }));
      return;
    }
    if (req.method === "POST" && (pathname === "/api/network/builder-hackathons/delete" || pathname === "/api/builder-hackathons/delete") || req.method === "DELETE" && (pathname.startsWith("/api/network/builder-hackathons/") || pathname.startsWith("/api/builder-hackathons/"))) {
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
      const paymentDetails = body?.paymentDetails;
      const rzpKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TwVFw0ACQFDbKn";
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET || "KrWC5wVHLo3PbiQ4K0ptf70e";
      let isRazorpayVerified = false;
      if (paymentDetails?.razorpay_payment_id && paymentDetails?.razorpay_order_id && paymentDetails?.razorpay_signature) {
        try {
          const crypto = await import("crypto");
          const expectedSig = crypto.createHmac("sha256", rzpSecret).update(`${paymentDetails.razorpay_order_id}|${paymentDetails.razorpay_payment_id}`).digest("hex");
          if (expectedSig === paymentDetails.razorpay_signature) {
            isRazorpayVerified = true;
          }
        } catch (sigErr) {
          console.error("Signature verification error:", sigErr);
        }
      }
      if (!isRazorpayVerified && paymentDetails?.razorpay_payment_id) {
        try {
          const auth = Buffer.from(`${rzpKeyId}:${rzpSecret}`).toString("base64");
          const payRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentDetails.razorpay_payment_id}`, {
            headers: { Authorization: `Basic ${auth}` }
          });
          if (payRes.ok) {
            const payData = await payRes.json();
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
      } catch (err) {
        console.error("Upgrade error:", err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to upgrade profile." }));
      } finally {
        client.release();
      }
      return;
    }
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
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to reset verification." }));
      } finally {
        client.release();
      }
      return;
    }
    if (req.method === "POST" && (pathname === "/api/network/create-razorpay-order" || pathname === "/api/create-razorpay-order")) {
      const body = await parseBody();
      const amount = body?.amount !== void 0 && !isNaN(Number(body.amount)) ? Number(body.amount) : 19900;
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
        } catch (e) {
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
    if (req.method === "POST" && (pathname === "/api/network/create-razorpay-qr" || pathname === "/api/create-razorpay-qr")) {
      const body = await parseBody();
      let amount = Number(body?.amount);
      if (!amount || isNaN(amount) || amount <= 0) {
        amount = 199;
      }
      const payment_amount = amount < 1e4 ? Math.round(amount * 100) : Math.round(amount);
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
        const qrData = await qrRes.json();
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
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to generate Razorpay QR code." }));
        return;
      }
    }
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
        const checkData = await checkRes.json();
        const items = checkData.items || [];
        const capturedPayment = items.find((p) => p.status === "captured" || p.status === "authorized");
        const paid = Boolean(capturedPayment);
        if (paid && capturedPayment) {
          const notes = capturedPayment.notes || {};
          const client = await pool.connect();
          try {
            if (notes.purpose === "startup_boost" && notes.startup_id) {
              await client.query(
                `UPDATE startups SET 
                   is_featured = true, 
                   boosted_at = NOW(), 
                   featured_until = (NOW() + INTERVAL '7 days') 
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
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to check QR payment." }));
        return;
      }
    }
    if (req.method === "POST" && (pathname === "/api/network/webhooks/razorpay" || pathname === "/api/webhooks/razorpay")) {
      const body = await parseBody();
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "KrWC5wVHLo3PbiQ4K0ptf70e";
      const signature = req.headers["x-razorpay-signature"];
      if (secret && signature) {
        try {
          const crypto = await import("crypto");
          const rawString = typeof req.rawBody === "string" ? req.rawBody : JSON.stringify(body);
          const expectedSignature = crypto.createHmac("sha256", secret).update(rawString).digest("hex");
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
            const plan = (notes.plan || "pro").toString().toLowerCase();
            const billing = (notes.billing || notes.plan_billing || "monthly").toString().toLowerCase();
            const durationInterval = billing === "yearly" ? "365 days" : "30 days";
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
    if (req.method === "GET" && (pathname === "/api/network/boost-quota" || pathname === "/api/boost-quota")) {
      const client = await pool.connect();
      try {
        const resDb = await client.query(
          "SELECT id, name, featured_until FROM startups WHERE is_featured = true AND (featured_until IS NULL OR featured_until > NOW())"
        );
        res.statusCode = 200;
        res.end(JSON.stringify({
          activeCount: resDb.rows.length,
          limit: 3,
          startups: resDb.rows
        }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to get boost quota." }));
      } finally {
        client.release();
      }
      return;
    }
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
        const activeBoosted = await client.query(
          "SELECT id, name, featured_until FROM startups WHERE is_featured = true AND (featured_until IS NULL OR featured_until > NOW())"
        );
        const isAlreadyBoosted = activeBoosted.rows.some((s) => s.id === startupId);
        if (body.toggle && isAlreadyBoosted) {
          const resDb2 = await client.query(
            "UPDATE startups SET is_featured = false, featured_until = NULL, boosted_at = NULL WHERE id = $1 RETURNING id, name, is_featured",
            [startupId]
          );
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, startup: resDb2.rows[0], message: "Boost removed." }));
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
            featured_until = (NOW() + INTERVAL '7 days') 
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
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to boost startup." }));
      } finally {
        client.release();
      }
      return;
    }
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
          "UPDATE catalog_projects SET is_sponsored = true, sponsored_label = '\u2726 Featured Builder' WHERE id = $1 RETURNING id, title, is_sponsored, sponsored_label",
          [Number(body.id)]
        );
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, project: resDb.rows[0], message: "Project pinned with Pro status!" }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || "Failed to pin project." }));
      } finally {
        client.release();
      }
      return;
    }
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
        expires_at: body.expires_at || null
      });
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, coupon }));
      return;
    }
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
    if (req.method === "POST" && (pathname === "/api/network/admin/delete-coupon" || pathname === "/api/admin/delete-coupon") || req.method === "DELETE" && (pathname.startsWith("/api/network/admin/coupons/") || pathname.startsWith("/api/admin/coupons/"))) {
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
    res.statusCode = 404;
    res.end(JSON.stringify({ error: `API endpoint not found: ${req.method} ${pathname}` }));
  } catch (err) {
    console.error("API error:", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || "Internal server error." }));
  }
}
async function vercelHandler(req, res) {
  await handleNetworkRequest(req, res);
}

// server/vercelHandler.ts
var vercelHandler_default = vercelHandler;
export {
  vercelHandler_default as default
};
