import { readFileSync, writeFileSync } from 'fs'
import { transformSync } from 'esbuild'

const files = [
  'build/src/contentScript/n8nStore.js',
  'build/src/contentScript/catalogExtractor.js'
]

console.log('🔨 Minifying page context scripts...')

files.forEach(file => {
  try {
    const code = readFileSync(file, 'utf-8')
    const result = transformSync(code, {
      minify: true,
      target: 'es2020',
      format: 'esm',
    })
    writeFileSync(file, result.code)
    const originalSize = code.length
    const minifiedSize = result.code.length
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1)
    console.log(`✓ ${file}: ${originalSize} → ${minifiedSize} bytes (${savings}% smaller)`)
  } catch (error) {
    console.error(`✗ Failed to minify ${file}:`, error.message)
    process.exit(1)
  }
})

console.log('✅ Page context scripts minified!')
