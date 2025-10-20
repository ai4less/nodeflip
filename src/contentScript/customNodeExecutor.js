/**
 * Custom Node Executor
 * Handles execution of custom nodes via backend API
 */

import { logger } from '@src/utils/logger'
import { AIBuilderAPI } from './api'

/**
 * Execute a custom node
 * @param {number} nodeId - Custom node ID
 * @param {Object} inputData - Input data for the node
 * @returns {Promise<Object>} Execution result
 */
export async function executeCustomNode(nodeId, inputData) {
  logger.log(`[CustomNodeExecutor] Executing node ${nodeId} with data:`, inputData)

  const api = new AIBuilderAPI()
  const config = await api.getConfig()

  if (!config.backendUrl || !config.apiKey) {
    throw new Error('Backend not configured')
  }

  // Create AbortController with 10 minute timeout to match backend
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minutes

  try {
    const response = await fetch(
      `${config.backendUrl}/api/v1/custom-nodes/${nodeId}/execute`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input_data: inputData
        }),
        signal: controller.signal
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    logger.log(`[CustomNodeExecutor] Execution result:`, result)

    return result
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 10 minutes')
    }
    throw error
  }
}

/**
 * Add execute button to custom node panel
 * @param {HTMLElement} nodeSettings - Node settings panel
 * @param {Object} customNode - Custom node configuration
 * @param {HTMLElement} formContainer - Form container element
 */
export function addExecuteButton(nodeSettings, customNode, formContainer) {
  // Check if button already exists
  if (nodeSettings.querySelector('[data-ai4less-execute]')) {
    return
  }

  // Create execute button container
  const buttonContainer = document.createElement('div')
  buttonContainer.dataset.ai4lessExecute = 'true'
  buttonContainer.style.cssText = `
    padding: 16px;
    background: #1a1a1a;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 12px;
    align-items: center;
  `

  // Create execute button
  const executeButton = document.createElement('button')
  executeButton.className = 'ai4less-execute-button'
  executeButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 6px;">
      <path d="M4 2L12 8L4 14V2Z"/>
    </svg>
    Execute Node
  `
  executeButton.style.cssText = `
    flex: 1;
    padding: 10px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  `

  // Create status indicator
  const statusIndicator = document.createElement('div')
  statusIndicator.className = 'ai4less-status-indicator'
  statusIndicator.style.cssText = `
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4ade80;
  `

  buttonContainer.appendChild(executeButton)
  buttonContainer.appendChild(statusIndicator)

  // Add hover effect
  executeButton.addEventListener('mouseenter', () => {
    executeButton.style.transform = 'translateY(-1px)'
    executeButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
  })

  executeButton.addEventListener('mouseleave', () => {
    executeButton.style.transform = 'translateY(0)'
    executeButton.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)'
  })

  // Add click handler
  executeButton.addEventListener('click', async () => {
    await handleExecute(executeButton, statusIndicator, customNode, formContainer, nodeSettings)
  })

  // Insert before the first parameter item
  const parameterList = nodeSettings.querySelector('.parameter-input-list-wrapper')
  if (parameterList) {
    parameterList.insertBefore(buttonContainer, parameterList.firstChild)
  }
}

/**
 * Handle execute button click
 */
async function handleExecute(button, statusIndicator, customNode, formContainer, nodeSettings) {
  // Import extractFormData function
  const { extractFormData } = await import('./schemaFormGenerator.jsx')

  // Get form data
  const formData = extractFormData(formContainer)
  logger.log('[CustomNodeExecutor] Form data:', formData)

  // Validate required fields
  const missingFields = validateRequiredFields(customNode.input_schema, formData)
  if (missingFields.length > 0) {
    showErrorNotification(
      nodeSettings,
      `Missing required fields: ${missingFields.join(', ')}`
    )
    return
  }

  // Update button state to loading
  const originalHTML = button.innerHTML
  button.disabled = true
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 6px; animation: spin 1s linear infinite;">
      <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="10 5"/>
    </svg>
    Executing...
  `
  button.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  statusIndicator.style.background = '#f59e0b'

  // Add spin animation
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)

  try {
    // Execute the custom node
    const result = await executeCustomNode(customNode.id, formData)

    // Check if execution was successful
    if (!result.success) {
      throw new Error(result.error || 'Execution failed')
    }

    // Success state
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 6px;">
        <path d="M13 4L6 11L3 8"/>
      </svg>
      Success!
    `
    button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    statusIndicator.style.background = '#10b981'

    // Show success notification with results
    showSuccessNotification(nodeSettings, result, customNode)

    // Reset button after 3 seconds
    setTimeout(() => {
      button.disabled = false
      button.innerHTML = originalHTML
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      statusIndicator.style.background = '#4ade80'
    }, 3000)

  } catch (error) {
    logger.error('[CustomNodeExecutor] Execution failed:', error)

    // Error state
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 6px;">
        <path d="M8 2C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm1 9H7V9h2v2zm0-3H7V5h2v3z"/>
      </svg>
      Failed
    `
    button.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    statusIndicator.style.background = '#ef4444'

    // Show error notification
    showErrorNotification(nodeSettings, error.message)

    // Reset button after 3 seconds
    setTimeout(() => {
      button.disabled = false
      button.innerHTML = originalHTML
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      statusIndicator.style.background = '#4ade80'
    }, 3000)
  }
}

/**
 * Validate required fields
 */
function validateRequiredFields(inputSchema, formData) {
  if (!inputSchema || !inputSchema.fields) {
    return []
  }

  const missingFields = []

  inputSchema.fields.forEach(field => {
    if (field.required) {
      const value = formData[field.name]
      if (value === undefined || value === null || value === '') {
        missingFields.push(field.label || field.name)
      }
    }
  })

  return missingFields
}

/**
 * Show error notification
 */
function showErrorNotification(nodeSettings, message) {
  // Remove existing notifications
  const existing = nodeSettings.querySelectorAll('[data-ai4less-notification]')
  existing.forEach(el => el.remove())

  const notification = document.createElement('div')
  notification.dataset.ai4lessNotification = 'error'
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fee2e2;
    border: 2px solid #ef4444;
    color: #991b1b;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `

  notification.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="font-size: 20px;">❌</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">Execution Failed</div>
        <div style="font-size: 13px; opacity: 0.9;">${message}</div>
      </div>
    </div>
  `

  document.body.appendChild(notification)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => notification.remove(), 300)
  }, 5000)
}

/**
 * Show success notification with results
 */
function showSuccessNotification(nodeSettings, result, customNode) {
  // Remove existing notifications
  const existing = nodeSettings.querySelectorAll('[data-ai4less-notification]')
  existing.forEach(el => el.remove())

  const notification = document.createElement('div')
  notification.dataset.ai4lessNotification = 'success'
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #d1fae5;
    border: 2px solid #10b981;
    color: #065f46;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    max-width: 500px;
    animation: slideIn 0.3s ease-out;
  `

  // Build result summary
  let resultSummary = ''
  const outputData = result.output_data || {}

  // Get key metrics to display
  if (outputData.duration) {
    resultSummary += `<div style="font-size: 12px; margin-top: 8px;">⏱️ Duration: ${Math.round(outputData.duration)}s</div>`
  }
  if (outputData.detected_language) {
    resultSummary += `<div style="font-size: 12px;">🌐 Language: ${outputData.detected_language}</div>`
  }
  if (outputData.video_size_bytes) {
    const sizeMB = (outputData.video_size_bytes / 1024 / 1024).toFixed(2)
    resultSummary += `<div style="font-size: 12px;">📦 Video Size: ${sizeMB} MB</div>`
  }
  if (result.response_time_ms) {
    resultSummary += `<div style="font-size: 12px;">⚡ Response Time: ${(result.response_time_ms / 1000).toFixed(2)}s</div>`
  }

  notification.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="font-size: 20px;">✅</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">Execution Successful</div>
        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">${customNode.name} completed successfully</div>
        ${resultSummary}
        <button onclick="this.parentElement.parentElement.parentElement.nextSibling.style.display = this.parentElement.parentElement.parentElement.nextSibling.style.display === 'none' ? 'block' : 'none'" style="margin-top: 8px; padding: 4px 12px; background: #059669; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
          View Raw Output
        </button>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #065f46; cursor: pointer; font-size: 18px; line-height: 1; padding: 0;">×</button>
    </div>
  `

  document.body.appendChild(notification)

  // Add collapsible raw output
  const rawOutput = document.createElement('div')
  rawOutput.style.cssText = `
    display: none;
    margin-top: 12px;
    padding: 12px;
    background: #ecfdf5;
    border-radius: 4px;
    max-height: 300px;
    overflow: auto;
    font-family: monospace;
    font-size: 11px;
    white-space: pre-wrap;
    word-break: break-all;
  `
  rawOutput.textContent = JSON.stringify(outputData, null, 2)
  notification.appendChild(rawOutput)

  // Auto-remove after 10 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => notification.remove(), 300)
  }, 10000)
}

// Add notification animations
const animationStyle = document.createElement('style')
animationStyle.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`
document.head.appendChild(animationStyle)
