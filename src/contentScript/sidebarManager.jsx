/**
 * Sidebar Manager
 * Handles lifecycle of the AI Builder sidebar
 */

import { render } from 'preact'
import { logger } from '@src/utils/logger'
import { isWorkflowPage, waitForElement } from './utils/domUtils'
import { AIBuilder } from './AIBuilder'
import { injectToggleButton, removeToggleButton } from './toggleButton'
import { stopCanvasObserver } from './customNodeIcons'
import { stopNodePanelObserver } from './nodePanelCustomizer'

let sidebarContainer = null
let n8nStoreInjected = false
let isInjecting = false

/**
 * Inject n8nStore script into page context
 */
function injectN8NStoreScript() {
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
  script.onerror = (error) => {
    logger.error('[nodeFlip] Failed to load n8nStore script:', error)
  }
  ;(document.head || document.documentElement).appendChild(script)
}

/**
 * Inject AI Builder sidebar
 * @param {string} iconUrl - URL to nodeflip icon for toggle button
 */
export async function injectAIBuilder(iconUrl) {
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
      await injectToggleButton(iconUrl)
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
    await injectToggleButton(iconUrl)
  } catch (error) {
    logger.error('[nodeFlip] Failed to inject AI Builder:', error)
  } finally {
    isInjecting = false
  }
}

/**
 * Tear down AI Builder when leaving workflow pages
 */
export function destroyAIBuilder() {
  if (sidebarContainer) {
    render(null, sidebarContainer)
    sidebarContainer.remove()
    sidebarContainer = null
  }

  removeToggleButton()
  stopCanvasObserver()
  stopNodePanelObserver()
}

/**
 * Reset injection state
 */
export function resetSidebarState() {
  isInjecting = false
  n8nStoreInjected = false
  sidebarContainer = null
}
