/**
 * Toggle Button Management
 * Handles injection of the nodeFlip toggle button in n8n's UI
 */

import { logger } from '@src/utils/logger'
import { waitForElement } from './utils/domUtils'
import { startCanvasObserver } from './customNodeIcons'
import { startNodePanelObserver } from './nodePanelCustomizer'

/**
 * Inject toggle button into n8n's button bar
 * @param {string} iconUrl - URL to the nodeflip icon
 */
export async function injectToggleButton(iconUrl) {
  try {
    // Wait for the node buttons wrapper to appear
    const wrapper = await waitForElement('[class*="_nodeButtonsWrapper"]', 15000)

    if (!wrapper) {
      return
    }

    // Check if button already exists
    const existingButton = document.querySelector('[data-test-id="nodeflip-ai-toggle"]')
    if (existingButton) {
      logger.log('[nodeFlip] Toggle button already exists')
      // Still start the observers even if button exists
      startCanvasObserver()
      startNodePanelObserver()
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
        <img src="${iconUrl}" alt="nodeFlip icon" style="width: 24px !important; height: 24px !important; max-width: 24px !important; max-height: 24px !important; display: block; flex-shrink: 0;" />
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
    
    // Start observing for node panel opens
    startNodePanelObserver()
  } catch (error) {
    logger.error('[nodeFlip] Failed to inject toggle button:', error)
  }
}

/**
 * Remove the toggle button
 */
export function removeToggleButton() {
  const toggleButton = document.querySelector('[data-test-id="nodeflip-ai-toggle"]')
  if (toggleButton) {
    toggleButton.remove()
  }
}
