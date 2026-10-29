import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createNetworkApiMiddleware } from './server/apiRouter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function networkApiPlugin(): Plugin {
  return {
    name: 'network-api-plugin',
    configureServer(server) {
      server.middlewares.use(createNetworkApiMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createNetworkApiMiddleware())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    networkApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/hackclub': {
        target: 'https://hackathons.hackclub.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hackclub/, ''),
      },
      '/api/serpapi': {
        target: 'https://serpapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/serpapi/, ''),
      },
    },
  },
})
