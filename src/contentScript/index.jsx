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

  try {
    // Inject n8nStore into page context first
    injectN8NStoreScript()

    // Wait for n8n app to be ready
    const n8nApp = await waitForElement('#n8n-app')
    logger.log('[nodeFlip] n8n app found, injecting AI Builder')

    // Create sidebar container
    sidebarContainer = document.createElement('div')
    sidebarContainer.id = 'nodeflip-ai-builder'
    sidebarContainer.style.cssText =
      'position: absolute; right: 0; top: 0; bottom: 0; pointer-events: auto; display: none;'

    // Append to n8n-app div - no style modifications needed
    n8nApp.appendChild(sidebarContainer)

    // Render Preact component
    render(<AIBuilder />, sidebarContainer)
    logger.log('[nodeFlip] AI Builder sidebar injected')

    // Inject toggle button
    await injectToggleButton()
  } catch (error) {
    logger.error('[nodeFlip] Failed to inject AI Builder:', error)
  }
}

/**
 * Inject toggle button into n8n's button bar
 */
async function injectToggleButton () {
  try {
    // Wait for the node buttons wrapper to appear
    const wrapper = await waitForElement('[class*="_nodeButtonsWrapper"]', 15000)

    if (!wrapper) {
      console.warn('[nodeFlip] Button wrapper not found')
      return
    }

    // Check if button already exists
    if (document.querySelector('[data-test-id="nodeflip-ai-toggle"]')) {
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
  } catch (error) {
    logger.error('[nodeFlip] Failed to inject toggle button:', error)
  }
}

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
