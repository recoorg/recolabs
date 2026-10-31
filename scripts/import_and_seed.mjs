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

const items = JSON.parse(fs.readFileSync('resources_extracted.json', 'utf8'));
console.log(`Processing ${items.length} items with strict 1.5s timeout...`);

async function fetchMetaImage(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(1500),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) return null;
    const text = await res.text();

    const twMatch = text.match(
      /<meta[^>]+(?:name|property)=["'](?:twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["']/i
    ) || text.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:twitter:image|twitter:image:src)["']/i
    );
    if (twMatch && twMatch[1]) {
      const img = twMatch[1].trim();
      return img.startsWith('http') ? img : new URL(img, url).toString();
    }

    const ogMatch = text.match(
      /<meta[^>]+(?:property|name)=["'](?:og:image|og:image:url)["'][^>]+content=["']([^"']+)["']/i
    ) || text.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|og:image:url)["']/i
    );
    if (ogMatch && ogMatch[1]) {
      const img = ogMatch[1].trim();
      return img.startsWith('http') ? img : new URL(img, url).toString();
    }

    return null;
  } catch {
    return null;
  }
}

async function run() {
  const client = await pool.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  // Process in chunks of 20
  const BATCH_SIZE = 20;
  const processedItems = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(items.length / BATCH_SIZE)}...`);

    const batchResults = await Promise.all(
      chunk.map(async (item) => {
        const twitterImage = await fetchMetaImage(item.url);
        const finalImage =
          twitterImage || `https://s0.wp.com/mshots/v1/${encodeURIComponent(item.url)}?w=800&h=600`;

        return {
          ...item,
          preview_image_url: finalImage,
          has_twitter_img: !!twitterImage,
        };
      })
    );

    for (const item of batchResults) {
      processedItems.push(item);

      // Check if project exists by URL
      const checkRes = await client.query('SELECT id FROM catalog_projects WHERE url = $1', [item.url]);
      if (checkRes.rows.length === 0) {
        await client.query(
          `INSERT INTO catalog_projects (
            title, url, category, description, author, author_handle,
            thumbnail_bg, visual_type, preview_image_url, tags, stars,
            is_sponsored, is_approved
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            item.title,
            item.url,
            item.category,
            item.description,
            'Aditya Raj',
            'rawenergon',
            '#121214',
            'screenshot',
            item.preview_image_url,
            item.tags,
            Math.floor(Math.random() * 80) + 20,
            false,
            true,
          ]
        );
      } else {
        await client.query(
          `UPDATE catalog_projects SET 
            author = $1, author_handle = $2, preview_image_url = $3,
            is_approved = true, category = $4
           WHERE url = $5`,
          ['Aditya Raj', 'rawenergon', item.preview_image_url, item.category, item.url]
        );
      }
    }
  }

  const countRes = await client.query('SELECT count(*) FROM catalog_projects');
  console.log(`Total catalog_projects in Supabase now: ${countRes.rows[0].count}`);

  client.release();
  await pool.end();

  // Generate src/data/initialCatalog.ts
  const catalogTs = `// Auto-generated catalogue from Resouces.xlsx
export interface CatalogItem {
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

export const EXCEL_CATALOG_PROJECTS: CatalogItem[] = ` + JSON.stringify(
    processedItems.map((p, idx) => ({
      id: "res-" + (idx + 1),
      title: p.title,
      url: p.url,
      category: p.category,
      description: p.description,
      author: 'Aditya Raj',
      authorHandle: 'rawenergon',
      thumbnailBg: '#121214',
      visualType: 'screenshot',
      preview_image_url: p.preview_image_url,
      tags: p.tags,
      stars: 45,
    })),
    null,
    2
  ) + ";\n";

  fs.writeFileSync('src/data/initialCatalog.ts', catalogTs, 'utf8');
  console.log('Successfully generated src/data/initialCatalog.ts');
}

run().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
