/**
 * Custom Node Icon Management
 * Handles applying custom icons to AI4Less nodes on the canvas
 */

import { logger } from '@src/utils/logger'
import { AIBuilderAPI } from './api'

let canvasObserver = null
let customNodesCache = null
let cacheTimestamp = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get custom nodes from cache or fetch fresh
 */
async function getCustomNodes() {
  const now = Date.now()
  
  // Use cache if valid
  if (customNodesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_TTL)) {
    logger.log('[nodeFlip] ⚡ Using cached custom nodes')
    return customNodesCache
  }
  
  // Fetch fresh
  const api = new AIBuilderAPI()
  const isConfigured = await api.isConfigured()
  
  if (!isConfigured) {
    return []
  }
  
  customNodesCache = await api.getCustomNodes()
  cacheTimestamp = now
  logger.log(`[nodeFlip] 📦 Fetched ${customNodesCache.length} custom nodes from backend`)
  
  return customNodesCache
}

/**
 * Get cached custom nodes list (for other modules)
 */
export function getCachedCustomNodes() {
  return customNodesCache || []
}

/**
 * Apply custom icons to HTTP nodes that are custom nodes
 */
export async function applyCustomNodeIcons() {
  try {
    const customNodes = await getCustomNodes()
    if (!customNodes || customNodes.length === 0) {
      return
    }

    // Get all node labels on the canvas
    const labels = document.querySelectorAll('[class*="_label_"]')

    for (const label of labels) {
      const nodeName = label.textContent.trim()

      // Check if this node name matches any custom node
      const customNode = customNodes.find((cn) => cn.name === nodeName)
      if (customNode) {
        const nodeContainer = label.closest('[data-test-id="canvas-default-node"]')
        if (nodeContainer) {
          const img = nodeContainer.querySelector('img[src*="httprequest"]')
          if (img && !img.dataset.customIconApplied) {
            img.src = 'https://seleniumbase.io/img/logo3c.png'
            img.dataset.customIconApplied = 'true'
            
            // Attach click listener to store custom node info
            nodeContainer.addEventListener('click', () => {
              logger.log(`[nodeFlip] 🎯 Custom node clicked: ${nodeName}`)
              // Store for quick access when panel opens
              window.lastClickedCustomNode = {
                node: customNode,
                timestamp: Date.now()
              }
            })
            
            logger.log(`[nodeFlip] ✅ Icon and click listener attached to: ${nodeName}`)
          }
        }
      }
    }
  } catch (error) {
    logger.error('[nodeFlip] Failed to apply custom icons:', error)
  }
}

/**
 * Start observing canvas for new nodes
 */
export function startCanvasObserver() {
  if (canvasObserver) {
    canvasObserver.disconnect()
  }

  const canvas = document.querySelector('[data-test-id="canvas"]')
  if (!canvas) {
    // Retry after a delay
    setTimeout(startCanvasObserver, 500)
    return
  }

  canvasObserver = new MutationObserver(() => {
    applyCustomNodeIcons()
  })

  canvasObserver.observe(canvas, {
    childList: true,
    subtree: true,
  })

  // Apply icons immediately for existing nodes
  applyCustomNodeIcons()

  logger.log('[nodeFlip] Canvas observer started')
}

/**
 * Stop the canvas observer
 */
export function stopCanvasObserver() {
  if (canvasObserver) {
    canvasObserver.disconnect()
    canvasObserver = null
  }
}
