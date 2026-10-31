import fs from 'fs';
import pg from 'pg';

const { Pool } = pg;
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.zjpbrdbdkkzczdwsgizj:Aditya%401060A@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  const res = await client.query('SELECT * FROM catalog_projects WHERE is_approved = true ORDER BY id ASC');
  console.log('Fetched approved projects:', res.rows.length);

  fs.mkdirSync('src/data', { recursive: true });

  const tsContent = `// Auto-generated catalogue from Supabase catalog_projects
export interface CatalogProject {
  id: string
  title: string
  url: string
  category: string
  description: string
  author: string
  authorHandle: string
  thumbnailBg?: string
  visualType?: "wireframe" | "landscape" | "pixel" | "buttons" | "terminal" | "hardware" | "cyber" | "space" | "quote" | "tools" | "screenshot"
  preview_image_url?: string
  isSponsored?: boolean
  sponsoredLabel?: string
  tags: string[]
  stars?: number
}

export const INITIAL_PROJECTS: CatalogProject[] = ${JSON.stringify(
    res.rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      url: r.url,
      category: r.category,
      description: r.description || '',
      author: r.author || 'Aditya Raj',
      authorHandle: r.author_handle || 'rawenergon',
      thumbnailBg: r.thumbnail_bg || '#121214',
      visualType: r.visual_type || 'screenshot',
      preview_image_url: r.preview_image_url || undefined,
      isSponsored: Boolean(r.is_sponsored),
      sponsoredLabel: r.sponsored_label || undefined,
      tags: Array.isArray(r.tags) ? r.tags : ['Curated'],
      stars: r.stars || 42,
    })),
    null,
    2
  )};
`;

  fs.writeFileSync('src/data/initialCatalog.ts', tsContent, 'utf8');
  console.log('Successfully wrote src/data/initialCatalog.ts with', res.rows.length, 'projects');
  client.release();
  await pool.end();
}

main().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
