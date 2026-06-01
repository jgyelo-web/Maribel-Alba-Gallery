import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
      },
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Galería Maribel Alba',
        short_name: 'Maribel Alba',
        description: 'Portafolio web de la artista plástica y restauradora Maribel Alba',
        theme_color: '#B8860B',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
})