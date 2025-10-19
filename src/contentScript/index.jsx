/**
 * nodeFlip Content Script
 * Main entry point - coordinates all injections and lifecycle
 */

import nodeflipIcon from '@src/assets/nodeflip.svg'
import { logger } from '@src/utils/logger'
import { isWorkflowPage } from './utils/domUtils'
import { injectAIBuilder, destroyAIBuilder, resetSidebarState } from './sidebarManager'

const nodeflipIconUrl =
  typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function'
    ? chrome.runtime.getURL(nodeflipIcon)
    : nodeflipIcon

logger.info('[nodeFlip] Content script loaded')

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
      resetSidebarState()
      // Then inject fresh
      setTimeout(() => {
        injectAIBuilder(nodeflipIconUrl)
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
  document.addEventListener('DOMContentLoaded', () => injectAIBuilder(nodeflipIconUrl))
} else {
  injectAIBuilder(nodeflipIconUrl)
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
