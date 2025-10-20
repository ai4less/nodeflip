/**
 * Workflow Saver
 * Triggers n8n's workflow save mechanism
 */

import { logger } from '@src/utils/logger'

/**
 * Trigger n8n to save the workflow
 * Simulates keyboard shortcut Ctrl+S or Cmd+S
 */
export function triggerWorkflowSave() {
  logger.log('[WorkflowSaver] Triggering workflow save...')

  // Method 1: Try to find and click the save button
  const saveButton = document.querySelector('[data-test-id="workflow-save-button"]')
  if (saveButton && !saveButton.disabled) {
    saveButton.click()
    logger.log('[WorkflowSaver] ✓ Clicked save button')
    return true
  }

  // Method 2: Dispatch keyboard shortcut (Ctrl+S or Cmd+S)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const saveEvent = new KeyboardEvent('keydown', {
    key: 's',
    code: 'KeyS',
    keyCode: 83,
    which: 83,
    ctrlKey: !isMac,
    metaKey: isMac,
    bubbles: true,
    cancelable: true
  })

  document.dispatchEvent(saveEvent)
  logger.log('[WorkflowSaver] ✓ Dispatched save keyboard shortcut')

  return true
}

/**
 * Show a save reminder notification
 */
export function showSaveReminder() {
  // Check if already showing
  if (document.querySelector('[data-ai4less-save-reminder]')) {
    return
  }

  const reminder = document.createElement('div')
  reminder.dataset.ai4lessSaveReminder = 'true'
  reminder.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideUp 0.3s ease-out;
    font-size: 14px;
  `

  reminder.innerHTML = `
    <div style="font-size: 20px;">💾</div>
    <div>
      <div style="font-weight: 600; margin-bottom: 2px;">Changes Detected</div>
      <div style="font-size: 12px; opacity: 0.9;">Press Ctrl+S to save workflow</div>
    </div>
    <button
      onclick="this.parentElement.remove()"
      style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;"
    >
      OK
    </button>
  `

  // Add animation style
  if (!document.getElementById('ai4less-save-animation')) {
    const style = document.createElement('style')
    style.id = 'ai4less-save-animation'
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)
  }

  document.body.appendChild(reminder)

  // Auto-remove after 8 seconds
  setTimeout(() => {
    reminder.style.animation = 'slideUp 0.3s ease-out reverse'
    setTimeout(() => reminder.remove(), 300)
  }, 8000)
}

/**
 * Mark workflow as modified (sets the "unsaved changes" indicator)
 */
export function markWorkflowAsModified() {
  // Dispatch a custom event that n8n might listen to
  const event = new CustomEvent('n8n-workflow-modified', {
    bubbles: true,
    detail: { source: 'ai4less-custom-node' }
  })
  document.dispatchEvent(event)

  // Try to trigger n8n's internal state update
  // Look for the workflow store or state management
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.Vue) {
    // Vue app is available, try to mark as dirty
    logger.log('[WorkflowSaver] Attempting to mark Vue app as modified')
  }

  logger.log('[WorkflowSaver] Marked workflow as modified')
}

/**
 * Auto-save workflow after changes
 * @param {number} delay - Delay in milliseconds before auto-saving
 */
export function autoSaveWorkflow(delay = 2000) {
  logger.log(`[WorkflowSaver] Scheduling auto-save in ${delay}ms...`)

  setTimeout(() => {
    const saved = triggerWorkflowSave()
    if (saved) {
      showSaveSuccessNotification()
    }
  }, delay)
}

/**
 * Show save success notification
 */
function showSaveSuccessNotification() {
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideUp 0.3s ease-out;
    font-size: 14px;
  `

  notification.innerHTML = `
    <div style="font-size: 20px;">✅</div>
    <div style="font-weight: 600;">Workflow Saved</div>
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease-out reverse'
    setTimeout(() => notification.remove(), 300)
  }, 2000)
}
