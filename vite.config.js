import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import preact from '@preact/preset-vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import manifest from './src/manifest.js'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    plugins: [crx({ manifest }), preact()],
    resolve: {
      alias: {
        '@src': resolve(projectRoot, 'src'),
      },
    },
    legacy: {
      skipWebSocketTokenCheck: true,
    },
  }
})
