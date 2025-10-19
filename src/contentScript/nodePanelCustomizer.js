/**
 * Node Panel Customizer
 * Detects when node settings panel opens and customizes AI4Less nodes
 */

import { logger } from '@src/utils/logger'
import { generatePropertyInspectorForm, extractFormData } from './schemaFormGenerator'
import { getCachedCustomNodes } from './customNodeIcons'
import { AIBuilderAPI } from './api'
import './styles/propertyInspector.css'

let nodePanelObserver = null

/**
 * Start observing for node panel opens
 */
export function startNodePanelObserver() {
  if (nodePanelObserver) {
    nodePanelObserver.disconnect()
  }

  nodePanelObserver = new MutationObserver(() => {
    const nodeSettings = document.querySelector('.node-settings[data-has-output-connection]')

    if (nodeSettings && !nodeSettings.dataset.ai4lessChecked) {
      nodeSettings.dataset.ai4lessChecked = 'true'
      checkAndInjectBranding(nodeSettings)
    }
  })

  nodePanelObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  logger.log('[nodeFlip] Node panel observer started')
}

/**
 * Stop the node panel observer
 */
export function stopNodePanelObserver() {
  if (nodePanelObserver) {
    nodePanelObserver.disconnect()
    nodePanelObserver = null
  }
}

/**
 * Check if node is an AI4Less node and inject custom interface
 */
async function checkAndInjectBranding(nodeSettings) {
  try {
    console.log('[nodeFlip] 🔍 Node panel detected, checking if it\'s a custom node...')
    
    // 1. Check if it's an HTTP Request node
    const httpIcon = nodeSettings.querySelector('img[src*="httprequest"]')
    if (!httpIcon) {
      console.log('[nodeFlip] ❌ Not an HTTP Request node')
      return
    }
    // 2. Get the node name
    const nameInput = nodeSettings.querySelector('input[data-test-id="inline-edit-input"]')
    if (!nameInput) {
      console.log('[nodeFlip] ❌ Could not find node name input')
      return
    }

    const nodeName = nameInput.value
    // 3. Fast path: Check if we just clicked this custom node
    if (window.lastClickedCustomNode) {
      const { node, timestamp } = window.lastClickedCustomNode
      const age = Date.now() - timestamp
      
      // If clicked within last 2 seconds and name matches
      if (age < 2000 && node.name === nodeName) {
        // Clear the stored data
        window.lastClickedCustomNode = null
        
        // Inject immediately without fetching
        injectAI4LessInterface(nodeSettings, node)
        return
      }
    }

    // 4. Slow path: Fetch from backend
    let customNodes = getCachedCustomNodes()
    
    // If no cache, fetch fresh
    if (!customNodes || customNodes.length === 0) {
      const api = new AIBuilderAPI()
      const isConfigured = await api.isConfigured()

      if (!isConfigured) {
        console.log('[nodeFlip] ⚙️ API not configured, skipping')
        return
      }

      customNodes = await api.getCustomNodes()
    } else {
      console.log(`[nodeFlip] ⚡ Using ${customNodes.length} cached custom nodes`)
    }
    
    const matchingNode = customNodes.find((cn) => cn.name === nodeName)

    if (!matchingNode) {
      console.log(`[nodeFlip] ❌ "${nodeName}" is not a custom node`)
      return
    }

    // 5. Inject AI4Less custom interface
    injectAI4LessInterface(nodeSettings, matchingNode)
  } catch (error) {
    logger.error('[nodeFlip] Failed to check node:', error)
  }
}

/**
 * Inject AI4Less branded interface for custom node
 */
function injectAI4LessInterface(nodeSettings, customNode) {
  // Check if already injected
  if (nodeSettings.querySelector('[data-ai4less-interface]')) {
    return
  }

  // Find the header
  const header = nodeSettings.querySelector('[class*="_header_"]')
  if (!header) {
    console.log('[nodeFlip] ❌ Could not find header element')
    return
  }

  // Create AI4Less banner
  const banner = document.createElement('div')
  banner.dataset.ai4lessInterface = 'true'
  banner.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px;
    border-bottom: 2px solid #5568d3;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `

  banner.innerHTML = `
    <div style="font-size: 24px;">🚀</div>
    <div style="flex: 1;">
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">AI4Less Node</div>
      <div style="font-size: 12px; opacity: 0.95;">${customNode.description || 'Powered by AI4Less Platform'}</div>
    </div>
    <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
      v${customNode.version || '1.0'}
    </div>
  `

  // Insert after header
  header.parentNode.insertBefore(banner, header.nextSibling)

  // Replace header icon
  replaceHeaderIcon(nodeSettings)

  // Generate clean input form FIRST
  generateCleanInputForm(nodeSettings, customNode)

  // THEN hide technical HTTP fields
  hideHttpTechnicalFields(nodeSettings)

  logger.log('[nodeFlip] AI4Less interface fully injected')
}

/**
 * Replace the HTTP icon in the header with custom icon
 */
function replaceHeaderIcon(nodeSettings) {
  // Find the header icon img
  const headerIcon = nodeSettings.querySelector('img[src*="httprequest"]')
  
  if (headerIcon) {
    headerIcon.src = 'https://seleniumbase.io/img/logo3c.png'
  } else {
    console.log('[nodeFlip] ⚠️ Could not find header icon')
  }
}

/**
 * Hide HTTP technical fields that users don't need to see
 */
function hideHttpTechnicalFields(nodeSettings) {
  const fieldsToHide = [
    'method', 'url', 'authentication', 'genericAuthType',
    'sendQuery', 'sendHeaders', 'specifyHeaders', 'headerParameters',
    'sendBody', 'contentType', 'specifyBody', 'jsonBody',
    'options', 'timeout'
  ]

  let hiddenCount = 0
  
  // Get all parameter items
  const parameterItems = nodeSettings.querySelectorAll('[data-test-id="parameter-item"]')
  
  parameterItems.forEach((item) => {
    // IMPORTANT: Don't hide our AI4Less form!
    if (item.querySelector('[data-ai4less-form]')) {
      return
    }
    
    // Check if this item contains any field we want to hide
    const shouldHide = fieldsToHide.some(fieldName => {
      // Check by data-test-id (parameter-input-, fixed-collection-, etc.)
      if (item.querySelector(`[data-test-id*="${fieldName}"]`)) return true
      
      // Check by label for attribute
      if (item.querySelector(`label[for="${fieldName}"]`)) return true
      
      // Check by label text content
      const labels = item.querySelectorAll('label')
      return Array.from(labels).some(label => 
        label.textContent.toLowerCase().includes(fieldName.toLowerCase().replace(/([A-Z])/g, ' $1').trim())
      )
    })
    
    // Also hide import sections and callouts
    if (item.querySelector('[class*="_importSection_"]') || 
        item.querySelector('.n8n-callout') ||
        item.querySelector('.notice, [class*="_notice_"]')) {
      item.style.display = 'none'
      hiddenCount++
      return
    }
    
    if (shouldHide) {
      item.style.display = 'none'
      hiddenCount++
    }
  })
}

/**
 * Generate Property Inspector form based on custom node schema
 */
function generateCleanInputForm(nodeSettings, customNode) {
  // Find the parameter list wrapper
  const parameterList = nodeSettings.querySelector('.parameter-input-list-wrapper')
  if (!parameterList) {
    return
  }

  // Generate form from schema
  const formContainer = generatePropertyInspectorForm(customNode.input_schema)
  formContainer.style.cssText = `
    padding-block: 16px;
  `

  // Insert at the beginning of parameter list
  parameterList.insertBefore(formContainer, parameterList.firstChild)

  // Set up form synchronization with hidden JSON field
  setupFormSync(nodeSettings, formContainer)
}

/**
 * Set up form synchronization with hidden JSON body field
 */
function setupFormSync(nodeSettings, formContainer) {
  // Find the JSON body code editor
  const jsonBodyInput = nodeSettings.querySelector(
    '[data-test-id="parameter-input-jsonBody"] .cm-content',
  )

  if (!jsonBodyInput) {
    console.log('[nodeFlip] ⚠️ Could not find JSON body input for syncing')
    return
  }

  // Function to sync form to JSON
  const syncFormToJson = () => {
    const formData = extractFormData(formContainer)
    const jsonValue = JSON.stringify({ input_data: formData })

    // Update the CodeMirror editor
    jsonBodyInput.textContent = jsonValue
    // Trigger change event
    const event = new Event('input', { bubbles: true })
    jsonBodyInput.dispatchEvent(event)
  }

  // Listen for changes on all form inputs
  const inputs = formContainer.querySelectorAll('input, select, textarea')
  inputs.forEach((input) => {
    input.addEventListener('input', syncFormToJson)
    input.addEventListener('change', syncFormToJson)
  })

  // Initial sync
  syncFormToJson()
}
