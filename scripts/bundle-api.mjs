import * as esbuild from 'esbuild';

async function build() {
  await esbuild.build({
    entryPoints: ['server/vercelHandler.ts'],
    outfile: 'api/network/[...route].js',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    external: ['pg', 'bcryptjs', 'jsonwebtoken'],
    banner: {
      js: '// Auto-generated bundle for Vercel serverless function\nimport { createRequire } from "module"; const require = createRequire(import.meta.url);',
    },
  });
  console.log('API bundled successfully into api/network/[...route].js');
}

build().catch((err) => {
  console.error('Bundle failed:', err);
  process.exit(1);
});
