/**
 * Node Panel Customizer
 * Detects when node settings panel opens and customizes AI4Less nodes
 */

import { logger } from '@src/utils/logger'
import { generatePropertyInspectorForm, extractFormData } from './schemaFormGenerator'
import { getCachedCustomNodes } from './customNodeIcons'
import { AIBuilderAPI } from './api'
import { addExecuteButton } from './customNodeExecutor'
import { showSaveReminder, markWorkflowAsModified } from './workflowSaver'
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
    background: #323334;
    color: white;
    padding: 16px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
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

  // Make panel wider for code editor
  makeNodePanelWider(nodeSettings)

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
 * Add expand/collapse toggle button for n8n main panel
 */
function addPanelExpandToggle(nodeSettings) {
  // Find the main panel with n8n class that constrains width
  const mainPanel = document.querySelector('[class*="_mainPanel_"]')

  if (!mainPanel) {
    console.log('[nodeFlip] ⚠️ Could not find main panel')
    return
  }

  // Check if toggle already exists
  if (document.querySelector('.ai4less-panel-expand-toggle')) {
    return
  }

  // Check if panel has code editor
  setTimeout(() => {
    const hasCodeEditor = nodeSettings.querySelector('.property-monaco-editor-container')
    if (!hasCodeEditor) {
      return
    }

    // Create toggle button
    const toggleButton = document.createElement('button')
    toggleButton.className = 'ai4less-panel-expand-toggle'
    toggleButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1 3h14v2H1V3zm0 4h14v2H1V7zm0 4h14v2H1v-2z"/>
      </svg>
      <span class="expand-text">Expand Panel</span>
      <span class="collapse-text" style="display:none;">Collapse Panel</span>
    `

    // Store original left/right values
    const originalStyles = {
      left: getComputedStyle(mainPanel).left,
      right: getComputedStyle(mainPanel).right
    }

    let isExpanded = false

    toggleButton.addEventListener('click', () => {
      isExpanded = !isExpanded

      if (isExpanded) {
        // Expand to full width
        mainPanel.style.left = '60px'  // Keep minimal left sidebar
        mainPanel.style.right = '60px' // Keep minimal right sidebar
        toggleButton.classList.add('expanded')
        toggleButton.querySelector('.expand-text').style.display = 'none'
        toggleButton.querySelector('.collapse-text').style.display = 'inline'
        console.log('[nodeFlip] 📐 Panel expanded to full width')
      } else {
        // Collapse to original width
        mainPanel.style.left = originalStyles.left
        mainPanel.style.right = originalStyles.right
        toggleButton.classList.remove('expanded')
        toggleButton.querySelector('.expand-text').style.display = 'inline'
        toggleButton.querySelector('.collapse-text').style.display = 'none'
        console.log('[nodeFlip] 📐 Panel collapsed to default width')
      }
    })

    // Insert button at top of node settings panel
    const nodeSettingsHeader = nodeSettings.querySelector('[class*="_header_"]') || nodeSettings
    nodeSettingsHeader.style.position = 'relative'
    nodeSettingsHeader.insertBefore(toggleButton, nodeSettingsHeader.firstChild)

    console.log('[nodeFlip] ✓ Added panel expand toggle button')
  }, 500) // Wait for form to be generated
}

/**
 * Make node settings panel wider for code editor
 * @deprecated - Now using addPanelExpandToggle instead
 */
function makeNodePanelWider(nodeSettings) {
  // Replaced by addPanelExpandToggle
  addPanelExpandToggle(nodeSettings)
}

/**
 * Hide HTTP technical fields that users don't need to see
 */
function hideHttpTechnicalFields(nodeSettings) {
  const fieldsToHide = [
    'method', 'url', 'authentication', 'genericAuthType',
    'sendQuery', 'sendHeaders', 'specifyHeaders', 'headerParameters',
    'sendBody', 'contentType', 'specifyBody',
    // NOTE: We keep jsonBody visible because we need to sync our form data to it
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

  // Check if form already exists (prevent double injection)
  if (parameterList.querySelector('[data-ai4less-form]')) {
    console.log('[nodeFlip] ⚠️ Form already exists, skipping generation')
    return
  }

  // Read existing saved values from n8n BEFORE generating form
  const savedValues = readSavedValuesFromN8n(nodeSettings)
  console.log('[nodeFlip] Saved values from n8n:', savedValues)

  // Merge saved values with schema defaults
  const schemaWithValues = {
    ...customNode.input_schema,
    fields: customNode.input_schema.fields.map(field => ({
      ...field,
      default: savedValues[field.name] !== undefined ? savedValues[field.name] : field.default
    }))
  }

  // Generate form from schema with saved values
  const formContainer = generatePropertyInspectorForm(schemaWithValues)
  formContainer.style.cssText = `
    padding-block: 16px;
  `

  // Insert at the beginning of parameter list
  parameterList.insertBefore(formContainer, parameterList.firstChild)

  // Set up form synchronization with hidden JSON field
  setupFormSync(nodeSettings, formContainer)
}

/**
 * Read saved values from n8n's jsonBody field
 */
function readSavedValuesFromN8n(nodeSettings) {
  const jsonBodyContainer = nodeSettings.querySelector('[data-test-id="parameter-input-jsonBody"]')
  if (!jsonBodyContainer) return {}

  try {
    const lines = jsonBodyContainer.querySelectorAll('.cm-line')
    const jsonText = Array.from(lines).map(line => line.textContent).join('\n')

    if (!jsonText || jsonText === '{}') return {}

    const existingData = JSON.parse(jsonText)

    // Return merged fields from config and code
    return {
      ...(existingData.config || {}),
      ...(existingData.code ? { code: existingData.code } : {})
    }
  } catch (error) {
    console.log('[nodeFlip] No saved values to read:', error)
    return {}
  }
}

/**
 * Set up form synchronization with hidden JSON body field
 */
function setupFormSync(nodeSettings, formContainer) {
  console.log('[nodeFlip] 🔧 setupFormSync called')

  // Find n8n's jsonBody CodeMirror container
  const jsonBodyContainer = nodeSettings.querySelector('[data-test-id="parameter-input-jsonBody"]')

  if (!jsonBodyContainer) {
    console.log('[nodeFlip] ⚠️ Could not find JSON body container')
    return
  }

  console.log('[nodeFlip] ✓ Found jsonBody container')

  // Simple n8n jsonBody accessor
  const n8nJsonBody = {
    // Read value from n8n's CodeMirror
    get: () => {
      const lines = jsonBodyContainer.querySelectorAll('.cm-line')
      return Array.from(lines).map(line => line.textContent).join('\n')
    },

    // Write value to n8n's CodeMirror (completely silent - no events)
    // n8n will read this value when the user saves the workflow
    set: (value) => {
      const cmContent = jsonBodyContainer.querySelector('.cm-content')
      if (!cmContent) return

      // Silently update the DOM - no events to avoid external change detection
      cmContent.textContent = value
      console.log('[nodeFlip] Silently updated jsonBody')
    }
  }

  // Sync form data to n8n's jsonBody
  const syncFormToJson = () => {
    console.log('[nodeFlip] 🔄 syncFormToJson called')
    const formData = extractFormData(formContainer)

    // Build payload structure
    const payload = formData.code !== undefined
      ? {
          // SANDBOX NODE: Structure for Beam sandbox execution
          code: formData.code,
          input_data: '={{ $json }}',
          config: Object.fromEntries(
            Object.entries(formData).filter(([key]) => key !== 'code')
          )
        }
      : {
          // ENDPOINT NODE: Simple structure for endpoint proxying
          input_data: {
            ...formData,
            workflow_data: '={{ $json }}'
          }
        }

    // Write to n8n
    n8nJsonBody.set(JSON.stringify(payload, null, 2))
    console.log('[nodeFlip] ✓ Synced to n8n:', payload)
  }


  // Debounced sync with save reminder
  let syncTimeout, saveReminderTimeout
  const debouncedSync = () => {
    clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
      syncFormToJson()
      clearTimeout(saveReminderTimeout)
      saveReminderTimeout = setTimeout(() => showSaveReminder(), 2000)
    }, 300)
  }

  // Attach event listeners to form inputs (after Preact components render)
  setTimeout(() => {
    const inputs = formContainer.querySelectorAll('input, select, textarea')
    console.log('[nodeFlip] Attaching listeners to', inputs.length, 'inputs')

    inputs.forEach((input) => {
      input.addEventListener('input', debouncedSync)
      input.addEventListener('change', syncFormToJson)
      input.addEventListener('blur', () => {
        syncFormToJson()
        setTimeout(() => showSaveReminder(), 500)
      })
    })
  }, 100)

  // Initial sync if no existing data
  setTimeout(() => {
    const existing = n8nJsonBody.get()
    if (!existing || existing === '{}') {
      console.log('[nodeFlip] Performing initial sync')
      syncFormToJson()
    }
  }, 300)
}

