import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import preact from '@preact/preset-vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import manifest from './src/manifest.js'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    plugins: [
      crx({ 
        manifest,
        // Disable auto-reload in dev mode to prevent tab reloading
        contentScripts: {
          injectCss: false,
        },
        // Disable browser auto-reload
        browser: isProduction ? undefined : {
          loadExtension: false
        }
      }), 
      preact()
    ],
    resolve: {
      alias: {
        '@src': resolve(projectRoot, 'src')
      },
    },
    legacy: {
      skipWebSocketTokenCheck: true,
    },
  }
})
