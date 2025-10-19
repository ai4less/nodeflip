/**
 * Node Panel Customizer
 * Detects when node settings panel opens and customizes AI4Less nodes
 */

import { logger } from '@src/utils/logger'

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
    console.log('[nodeFlip] ✓ HTTP Request node detected')

    // 2. Get the node name
    const nameInput = nodeSettings.querySelector('input[data-test-id="inline-edit-input"]')
    if (!nameInput) {
      console.log('[nodeFlip] ❌ Could not find node name input')
      return
    }

    const nodeName = nameInput.value
    console.log(`[nodeFlip] 📝 Node name: "${nodeName}"`)

    // 3. Fast path: Check if we just clicked this custom node
    if (window.lastClickedCustomNode) {
      const { node, timestamp } = window.lastClickedCustomNode
      const age = Date.now() - timestamp
      
      // If clicked within last 2 seconds and name matches
      if (age < 2000 && node.name === nodeName) {
        console.log(`[nodeFlip] ⚡ FAST PATH! Using recently clicked custom node data`)
        console.log(`[nodeFlip] 🎉 MATCH! "${nodeName}" is an AI4Less node!`, node)
        
        // Clear the stored data
        window.lastClickedCustomNode = null
        
        // Inject immediately without fetching
        injectAI4LessInterface(nodeSettings, node)
        return
      }
    }

    // 4. Slow path: Fetch from backend
    console.log('[nodeFlip] 🐌 Falling back to backend fetch...')
    const { getCachedCustomNodes } = await import('./customNodeIcons')
    let customNodes = getCachedCustomNodes()
    
    // If no cache, fetch fresh
    if (!customNodes || customNodes.length === 0) {
      const { AIBuilderAPI } = await import('./api')
      const api = new AIBuilderAPI()
      const isConfigured = await api.isConfigured()

      if (!isConfigured) {
        console.log('[nodeFlip] ⚙️ API not configured, skipping')
        return
      }

      customNodes = await api.getCustomNodes()
      console.log(`[nodeFlip] 📦 Fetched ${customNodes.length} custom nodes from backend`)
    } else {
      console.log(`[nodeFlip] ⚡ Using ${customNodes.length} cached custom nodes`)
    }
    
    const matchingNode = customNodes.find((cn) => cn.name === nodeName)

    if (!matchingNode) {
      console.log(`[nodeFlip] ❌ "${nodeName}" is not a custom node`)
      return
    }

    console.log(`[nodeFlip] 🎉 MATCH! "${nodeName}" is an AI4Less node!`, matchingNode)

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
  console.log('[nodeFlip] 🎨 Injecting AI4Less interface...')
  
  // Check if already injected
  if (nodeSettings.querySelector('[data-ai4less-interface]')) {
    console.log('[nodeFlip] ⚠️ Interface already injected, skipping')
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
  console.log('[nodeFlip] ✅ AI4Less banner injected!')

  // Replace header icon
  replaceHeaderIcon(nodeSettings)

  // Hide technical HTTP fields
  hideHttpTechnicalFields(nodeSettings)

  // Generate clean input form
  generateCleanInputForm(nodeSettings, customNode)

  logger.log('[nodeFlip] AI4Less interface fully injected')
}

/**
 * Replace the HTTP icon in the header with custom icon
 */
function replaceHeaderIcon(nodeSettings) {
  console.log('[nodeFlip] 🎨 Replacing header icon...')
  
  // Find the header icon img
  const headerIcon = nodeSettings.querySelector('img[src*="httprequest"]')
  
  if (headerIcon) {
    headerIcon.src = 'https://seleniumbase.io/img/logo3c.png'
    console.log('[nodeFlip] ✅ Header icon replaced!')
  } else {
    console.log('[nodeFlip] ⚠️ Could not find header icon')
  }
}

/**
 * Hide HTTP technical fields that users don't need to see
 */
function hideHttpTechnicalFields(nodeSettings) {
  console.log('[nodeFlip] 🙈 Hiding technical HTTP fields...')
  
  const fieldsToHide = [
    'url',
    'authentication',
    'genericAuthType',
    'sendHeaders',
    'specifyHeaders',
    'headerParameters',
    'sendBody',
    'contentType',
    'specifyBody',
    'jsonBody',
  ]

  let hiddenCount = 0
  fieldsToHide.forEach((fieldName) => {
    const paramItem = nodeSettings.querySelector(`[data-test-id="parameter-input-${fieldName}"]`)
    if (paramItem) {
      const parentItem = paramItem.closest('[data-test-id="parameter-item"]')
      if (parentItem) {
        parentItem.style.display = 'none'
        hiddenCount++
      }
    }
  })

  // Also hide the "Import cURL" section and callout
  const importSection = nodeSettings.querySelector('[class*="_importSection_"]')
  if (importSection) {
    const parentItem = importSection.closest('[data-test-id="parameter-item"]')
    if (parentItem) {
      parentItem.style.display = 'none'
      hiddenCount++
    }
  }

  const callout = nodeSettings.querySelector('.n8n-callout')
  if (callout) {
    const parentItem = callout.closest('[data-test-id="parameter-item"]')
    if (parentItem) {
      parentItem.style.display = 'none'
      hiddenCount++
    }
  }
  
  console.log(`[nodeFlip] ✅ Hidden ${hiddenCount} technical fields`)
}

/**
 * Generate clean input form based on custom node schema
 */
function generateCleanInputForm(nodeSettings, customNode) {
  console.log('[nodeFlip] 📝 Generating clean input form...')
  
  // Find the parameter list wrapper
  const parameterList = nodeSettings.querySelector('.parameter-input-list-wrapper')
  if (!parameterList) {
    console.log('[nodeFlip] ❌ Could not find parameter list wrapper')
    return
  }

  // Create clean input section
  const inputSection = document.createElement('div')
  inputSection.dataset.ai4lessInputs = 'true'
  inputSection.style.cssText = `
    background: #f9fafb;
    padding: 16px;
    margin: 16px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  `

  // For now, show a simple input data field
  // TODO: Parse actual schema from backend and generate dynamic fields
  inputSection.innerHTML = `
    <div style="margin-bottom: 12px;">
      <label style="display: block; font-weight: 600; font-size: 13px; color: #374151; margin-bottom: 6px;">
        Input Data
      </label>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
        Enter the data to process. You can use n8n expressions like <code>{{ $json.fieldName }}</code>
      </div>
      <textarea 
        data-ai4less-input="input_data"
        placeholder="Enter your input data or use {{ $json }} to pass previous node data"
        style="
          width: 100%;
          min-height: 80px;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-family: monospace;
          font-size: 13px;
          resize: vertical;
        "
      >={{ $json }}</textarea>
    </div>
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; font-size: 12px; color: #1e40af;">
      <strong>💡 Tip:</strong> This AI4Less node will automatically format and send your data to the backend. No need to configure URLs or authentication!
    </div>
  `

  // Insert at the beginning of parameter list
  parameterList.insertBefore(inputSection, parameterList.firstChild)
  console.log('[nodeFlip] ✅ Clean input form generated')

  // Set up input synchronization with hidden JSON field
  const textarea = inputSection.querySelector('textarea[data-ai4less-input]')
  if (textarea) {
    syncInputWithJsonBody(nodeSettings, textarea)
  }
}

/**
 * Sync user-friendly input with the hidden JSON body field
 */
function syncInputWithJsonBody(nodeSettings, textarea) {
  console.log('[nodeFlip] 🔄 Setting up input synchronization...')
  
  // Find the JSON body code editor
  const jsonBodyInput = nodeSettings.querySelector(
    '[data-test-id="parameter-input-jsonBody"] .cm-content',
  )

  if (!jsonBodyInput) {
    console.log('[nodeFlip] ⚠️ Could not find JSON body input for syncing')
    return
  }

  // Initialize textarea with current JSON value
  try {
    const currentText = jsonBodyInput.textContent
    if (currentText) {
      const parsed = JSON.parse(currentText)
      if (parsed.input_data) {
        textarea.value = parsed.input_data.replace(/^"=|"$/g, '').replace(/={{ \$json }}/, '={{ $json }}')
        console.log('[nodeFlip] ✅ Initialized textarea with existing value')
      }
    }
  } catch (e) {
    // Ignore parse errors
    console.log('[nodeFlip] ⚠️ Could not parse existing JSON value')
  }

  // Listen for changes and update JSON
  textarea.addEventListener('input', () => {
    const inputValue = textarea.value
    const jsonValue = JSON.stringify({ input_data: `=${inputValue}` })

    // Update the CodeMirror editor
    if (jsonBodyInput) {
      jsonBodyInput.textContent = jsonValue
      // Trigger change event
      const event = new Event('input', { bubbles: true })
      jsonBodyInput.dispatchEvent(event)
      console.log('[nodeFlip] 🔄 Synced input to JSON body:', jsonValue)
    }
  })
  
  console.log('[nodeFlip] ✅ Input synchronization active')
}
