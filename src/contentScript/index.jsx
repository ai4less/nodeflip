/**
 * nodeFlip Content Script
 * Injects AI Builder sidebar into n8n workflow pages
 */

import { render } from 'preact'
import { AIBuilder } from './AIBuilder'

console.info('[nodeFlip] Content script loaded')

let sidebarContainer = null

/**
 * Wait for an element to appear in the DOM
 */
function waitForElement(selector, timeout = 10000) {
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
      subtree: true
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
function isWorkflowPage() {
  return window.location.pathname.includes('/workflow/')
}

/**
 * Inject n8nStore script into page context
 */
function injectN8NStoreScript() {
  // Inject the n8nStore.js script into the page context
  // This is needed because content scripts can't access the page's Vue app
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('src/contentScript/n8nStore.js')
  script.type = 'module'
  script.onload = () => {
    console.log('[nodeFlip] n8nStore script injected into page context')
    script.remove()
  }
  script.onerror = (error) => {
    console.error('[nodeFlip] Failed to load n8nStore script:', error)
  }
  ;(document.head || document.documentElement).appendChild(script)
}

/**
 * Inject AI Builder sidebar
 */
async function injectAIBuilder() {
  if (!isWorkflowPage()) {
    console.log('[nodeFlip] Not on workflow page, skipping injection')
    return
  }

  try {
    // Inject n8nStore into page context first
    injectN8NStoreScript()
    
    // Wait for n8n app to be ready
    await waitForElement('#n8n-app')
    console.log('[nodeFlip] n8n app found, injecting AI Builder')

    // Create sidebar container
    sidebarContainer = document.createElement('div')
    sidebarContainer.id = 'nodeflip-ai-builder'
    sidebarContainer.style.cssText = 'position: fixed; right: 0; top: 0; bottom: 0; z-index: 9999;'
    
    // Append to body
    document.body.appendChild(sidebarContainer)

    // Render Preact component
    render(<AIBuilder />, sidebarContainer)
    console.log('[nodeFlip] AI Builder sidebar injected')

    // Inject toggle button
    await injectToggleButton()
  } catch (error) {
    console.error('[nodeFlip] Failed to inject AI Builder:', error)
  }
}

/**
 * Inject toggle button into n8n's button bar
 */
async function injectToggleButton() {
  try {
    // Wait for the node buttons wrapper to appear
    const wrapper = await waitForElement('[class*="_nodeButtonsWrapper"]', 15000)
    
    if (!wrapper) {
      console.warn('[nodeFlip] Button wrapper not found')
      return
    }

    // Check if button already exists
    if (document.querySelector('[data-test-id="nodeflip-ai-toggle"]')) {
      console.log('[nodeFlip] Toggle button already exists')
      return
    }

    // Create button matching n8n's style
    const button = document.createElement('button')
    button.className = 'button _button_3iv81_123 _tertiary_3iv81_250 _large_3iv81_381 _square_3iv81_346'
    button.setAttribute('data-test-id', 'nodeflip-ai-toggle')
    button.setAttribute('aria-label', 'Toggle nodeFlip AI')
    button.setAttribute('aria-live', 'polite')
    button.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `
    
    // Add purple gradient AI icon
    button.innerHTML = `
      <span class="_icon_3iv81_519" style="display: flex;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.9658 14.0171C19.9679 14.3549 19.8654 14.6851 19.6722 14.9622C19.479 15.2393 19.2046 15.4497 18.8869 15.5645L13.5109 17.5451L11.5303 22.9211C11.4137 23.2376 11.2028 23.5107 10.9261 23.7037C10.6494 23.8966 10.3202 24 9.9829 24C9.64559 24 9.3164 23.8966 9.0397 23.7037C8.76301 23.5107 8.55212 23.2376 8.43549 22.9211L6.45487 17.5451L1.07888 15.5645C0.762384 15.4479 0.489262 15.237 0.296347 14.9603C0.103431 14.6836 0 14.3544 0 14.0171C0 13.6798 0.103431 13.3506 0.296347 13.0739C0.489262 12.7972 0.762384 12.5863 1.07888 12.4697L6.45487 10.4891L8.43549 5.11309C8.55212 4.79659 8.76301 4.52347 9.0397 4.33055C9.3164 4.13764 9.64559 4.0342 9.9829 4.0342C10.3202 4.0342 10.6494 4.13764 10.9261 4.33055C11.2028 4.52347 11.4137 4.79659 11.5303 5.11309L13.5109 10.4891L18.8869 12.4697C19.2046 12.5845 19.479 12.7949 19.6722 13.072C19.8654 13.3491 19.9679 13.6793 19.9658 14.0171ZM14.1056 4.12268H15.7546V5.77175C15.7546 5.99043 15.8415 6.20015 15.9961 6.35478C16.1508 6.50941 16.3605 6.59628 16.5792 6.59628C16.7979 6.59628 17.0076 6.50941 17.1622 6.35478C17.3168 6.20015 17.4037 5.99043 17.4037 5.77175V4.12268H19.0528C19.2715 4.12268 19.4812 4.03581 19.6358 3.88118C19.7905 3.72655 19.8773 3.51682 19.8773 3.29814C19.8773 3.07946 19.7905 2.86974 19.6358 2.71511C19.4812 2.56048 19.2715 2.47361 19.0528 2.47361H17.4037V0.824535C17.4037 0.605855 17.3168 0.396131 17.1622 0.241501C17.0076 0.0868704 16.7979 0 16.5792 0C16.3605 0 16.1508 0.0868704 15.9961 0.241501C15.8415 0.396131 15.7546 0.605855 15.7546 0.824535V2.47361H14.1056C13.8869 2.47361 13.6772 2.56048 13.5225 2.71511C13.3679 2.86974 13.281 3.07946 13.281 3.29814C13.281 3.51682 13.3679 3.72655 13.5225 3.88118C13.6772 4.03581 13.8869 4.12268 14.1056 4.12268ZM23.1755 7.42082H22.3509V6.59628C22.3509 6.3776 22.2641 6.16788 22.1094 6.01325C21.9548 5.85862 21.7451 5.77175 21.5264 5.77175C21.3077 5.77175 21.098 5.85862 20.9434 6.01325C20.7887 6.16788 20.7019 6.3776 20.7019 6.59628V7.42082H19.8773C19.6586 7.42082 19.4489 7.50769 19.2943 7.66232C19.1397 7.81695 19.0528 8.02667 19.0528 8.24535C19.0528 8.46404 19.1397 8.67376 19.2943 8.82839C19.4489 8.98302 19.6586 9.06989 19.8773 9.06989H20.7019V9.89443C20.7019 10.1131 20.7887 10.3228 20.9434 10.4775C21.098 10.6321 21.3077 10.719 21.5264 10.719C21.7451 10.719 21.9548 10.6321 22.1094 10.4775C22.2641 10.3228 22.3509 10.1131 22.3509 9.89443V9.06989H23.1755C23.3941 9.06989 23.6039 8.98302 23.7585 8.82839C23.9131 8.67376 24 8.46404 24 8.24535C24 8.02667 23.9131 7.81695 23.7585 7.66232C23.6039 7.50769 23.3941 7.42082 23.1755 7.42082Z" fill="url(#nodeflip-btn-gradient)"/>
          <defs>
            <linearGradient id="nodeflip-btn-gradient" x1="0" y1="0" x2="28.8315" y2="9.82667" gradientUnits="userSpaceOnUse">
              <stop stop-color="#9733EE"/>
              <stop offset="0.495" stop-color="#DA22FF"/>
              <stop offset="1" stop-color="#8F94FB"/>
            </linearGradient>
          </defs>
        </svg>
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
    
    console.log('[nodeFlip] Toggle button injected')
  } catch (error) {
    console.error('[nodeFlip] Failed to inject toggle button:', error)
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
