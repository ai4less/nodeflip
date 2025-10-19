/**
 * nodeFlip Content Script
 * Injects AI Builder sidebar into n8n workflow pages
 */

import { render } from 'preact'
import { AIBuilder } from './AIBuilder'
import nodeflipIcon from '@src/assets/nodeflip.svg'
import { logger } from '@src/utils/logger'

const nodeflipIconUrl =
  typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function'
    ? chrome.runtime.getURL(nodeflipIcon)
    : nodeflipIcon

logger.info('[nodeFlip] Content script loaded')

let sidebarContainer = null
let n8nStoreInjected = false
let isInjecting = false

/**
 * Wait for an element to appear in the DOM
 */
function waitForElement (selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      return resolve(element)
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) {
        observer.disconnect()
        resolve(el)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Timeout waiting for ${selector}`))
    }, timeout)
  })
}

/**
 * Check if we're on an n8n workflow page
 */
function isWorkflowPage () {
  return window.location.pathname.includes('/workflow/')
}

/**
 * Inject n8nStore script into page context
 */
function injectN8NStoreScript () {
  if (n8nStoreInjected) {
    return
  }

  n8nStoreInjected = true
  // Inject the n8nStore.js script into the page context
  // This is needed because content scripts can't access the page's Vue app
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('src/contentScript/n8nStore.js')
  script.type = 'module'
  script.onload = () => {
    logger.log('[nodeFlip] n8nStore script injected into page context')
    script.remove()
  }
  script.onerror = error => {
    logger.error('[nodeFlip] Failed to load n8nStore script:', error)
  }
  ;(document.head || document.documentElement).appendChild(script)
}

/**
 * Inject AI Builder sidebar
 */
async function injectAIBuilder () {
  if (!isWorkflowPage()) {
    logger.log('[nodeFlip] Not on workflow page, skipping injection')
    return
  }

  if (isInjecting) {
    return
  }

  isInjecting = true

  try {
    // Inject n8nStore into page context first
    injectN8NStoreScript()

    // Reuse existing sidebar if it survived the navigation
    const existingSidebar = document.getElementById('nodeflip-ai-builder')
    if (existingSidebar) {
      sidebarContainer = existingSidebar
      await injectToggleButton()
      return
    }

    // Try to find n8n app (might already exist from previous nav)
    let n8nApp = document.querySelector('#n8n-app')
    if (!n8nApp) {
      n8nApp = await waitForElement('#n8n-app', 5000)
    }

    // Create sidebar container
    sidebarContainer = document.createElement('div')
    sidebarContainer.id = 'nodeflip-ai-builder'
    sidebarContainer.style.cssText =
      'position: absolute; right: 0; top: 0; bottom: 0; pointer-events: auto; display: none;'

    // Append to n8n-app div - no style modifications needed
    n8nApp.appendChild(sidebarContainer)

    // Render Preact component
    render(<AIBuilder />, sidebarContainer)

    // Inject toggle button
    await injectToggleButton()
  } catch (error) {
    logger.error('[nodeFlip] Failed to inject AI Builder:', error)
  } finally {
    isInjecting = false
  }
}

/**
 * Apply custom icons to HTTP nodes that are custom nodes
 */
async function applyCustomNodeIcons () {
  try {
    // Fetch custom nodes from backend
    const { AIBuilderAPI } = await import('./api')
    const api = new AIBuilderAPI()
    const isConfigured = await api.isConfigured()

    if (!isConfigured) {
      return
    }

    const customNodes = await api.getCustomNodes()
    if (!customNodes || customNodes.length === 0) {
      return
    }

    // Get all node labels on the canvas
    const labels = document.querySelectorAll('[class*="_label_"]')

    for (const label of labels) {
      const nodeName = label.textContent.trim()

      // Check if this node name matches any custom node
      const customNode = customNodes.find(cn => cn.name === nodeName)
      if (customNode) {
        const nodeContainer = label.closest('[data-test-id="canvas-default-node"]')
        if (nodeContainer) {
          const img = nodeContainer.querySelector('img[src*="httprequest"]')
          if (img) {
            if (!img.dataset.customIconApplied) {
              img.src = 'https://seleniumbase.io/img/logo3c.png'
              img.dataset.customIconApplied = 'true'
            }
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
let canvasObserver = null
function startCanvasObserver () {
  if (canvasObserver) {
    canvasObserver.disconnect()
  }

  const canvas = document.querySelector('[data-test-id="canvas"]')
  if (!canvas) {
    // Retry after a delay
    setTimeout(startCanvasObserver, 1000)
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
}

/**
 * Inject toggle button into n8n's button bar
 */
async function injectToggleButton () {
  try {
    // Wait for the node buttons wrapper to appear
    const wrapper = await waitForElement('[class*="_nodeButtonsWrapper"]', 15000)

    if (!wrapper) {
      return
    }

    // Check if button already exists
    const existingButton = document.querySelector('[data-test-id="nodeflip-ai-toggle"]')
    if (existingButton) {
      // Still start the canvas observer even if button exists
      startCanvasObserver()
      return
    }

    // Create button matching n8n's style
    const button = document.createElement('button')
    button.className =
      'button _button_3iv81_123 _tertiary_3iv81_250 _large_3iv81_381 _square_3iv81_346'
    button.setAttribute('data-test-id', 'nodeflip-ai-toggle')
    button.setAttribute('aria-label', 'Toggle nodeFlip AI')
    button.setAttribute('aria-live', 'polite')
    button.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      min-width: 0;
      overflow: visible;
    `

    button.innerHTML = `
      <span class="_icon_3iv81_519" style="display: flex !important; width: 24px !important; height: 24px !important; align-items: center; justify-content: center; min-width: 24px; min-height: 24px; overflow: visible;">
        <img src="${nodeflipIconUrl}" alt="nodeFlip icon" style="width: 24px !important; height: 24px !important; max-width: 24px !important; max-height: 24px !important; display: block; flex-shrink: 0;" />
      </span>
    `

    // Add click handler
    button.addEventListener('click', () => {
      const event = new CustomEvent('nodeflip-toggle-sidebar')
      window.dispatchEvent(event)
    })

    // Insert before the last button (n8n's AI assistant button)
    const lastButton = wrapper.lastElementChild
    if (lastButton) {
      wrapper.insertBefore(button, lastButton)
    } else {
      wrapper.appendChild(button)
    }

    logger.log('[nodeFlip] Toggle button injected')

    // Start observing canvas for custom nodes
    startCanvasObserver()
  } catch (error) {
    logger.error('[nodeFlip] Failed to inject toggle button:', error)
  }
}

/**
 * Tear down AI Builder when leaving workflow pages
 */
function destroyAIBuilder () {
  if (sidebarContainer) {
    render(null, sidebarContainer)
    sidebarContainer.remove()
    sidebarContainer = null
  }

  const toggleButton = document.querySelector('[data-test-id="nodeflip-ai-toggle"]')
  if (toggleButton) {
    toggleButton.remove()
  }

  // Disconnect canvas observer
  if (canvasObserver) {
    canvasObserver.disconnect()
    canvasObserver = null
  }
}

/**
 * Detect URL pathname changes during SPA navigation
 */
let lastPathname = window.location.pathname
const urlObserver = setInterval(() => {
  const currentPathname = window.location.pathname
  if (currentPathname !== lastPathname) {
    lastPathname = currentPathname
    if (isWorkflowPage()) {
      // Destroy first to reset state
      destroyAIBuilder()
      // Reset injection flags
      isInjecting = false
      n8nStoreInjected = false
      sidebarContainer = null
      // Then inject fresh
      setTimeout(() => {
        injectAIBuilder()
      }, 100)
    } else {
      destroyAIBuilder()
    }
  }
}, 500)

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectAIBuilder)
} else {
  injectAIBuilder()
}

/**
 * Listen for messages from popup/background
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'nodeFlipToggleChatBubble') {
    const event = new CustomEvent('nodeflip-toggle-sidebar')
    window.dispatchEvent(event)
    sendResponse({ success: true })
  }
  return true
})
