/**
 * Catalog Extractor
 * Extracts complete n8n node schemas from the node types store
 * This file is designed to run in the PAGE CONTEXT where it has access to n8n's Vue store
 */

import { getNodeTypesStore } from './n8nStore.js'

/**
 * Check if a node is a custom/community node (not built-in)
 */
function isCustomNode(nodeType) {
  const builtInPrefixes = [
    'n8n-nodes-base.',
    '@n8n/n8n-nodes-langchain.'
  ]
  return !builtInPrefixes.some(prefix => nodeType.startsWith(prefix))
}

/**
 * Get category from node group
 */
function getCategory(groups) {
  if (!groups) return 'Other'
  if (Array.isArray(groups) && groups.length > 0) {
    return groups[0]
  }
  return 'Other'
}

/**
 * Extract complete parameter schemas with all metadata
 */
function extractParameters(properties) {
  if (!Array.isArray(properties)) return []
  
  return properties.map(prop => {
    const param = {
      displayName: prop.displayName,
      name: prop.name,
      type: prop.type,
      required: prop.required || false,
      default: prop.default,
      description: prop.description || '',
      placeholder: prop.placeholder
    }
    
    // Remove undefined fields
    Object.keys(param).forEach(key => {
      if (param[key] === undefined) delete param[key]
    })
    
    // Extract options for select fields
    if (prop.options && Array.isArray(prop.options)) {
      const hasNestedValues = prop.options.some(opt => opt.values)
      
      if (hasNestedValues) {
        // FixedCollection with nested parameters
        param.options = prop.options.map(opt => ({
          name: opt.name,
          displayName: opt.displayName,
          values: extractParameters(opt.values || [])
        }))
      } else {
        // Simple select options
        param.options = prop.options.map(opt => ({
          name: opt.name,
          value: opt.value,
          description: opt.description
        })).filter(opt => opt.name || opt.value)
      }
    }
    
    // Extract typeOptions (validation rules)
    if (prop.typeOptions) {
      param.typeOptions = {}
      const validKeys = ['minValue', 'maxValue', 'numberPrecision', 'maxLength', 'password', 'multipleValues', 'rows']
      validKeys.forEach(key => {
        if (prop.typeOptions[key] !== undefined) {
          param.typeOptions[key] = prop.typeOptions[key]
        }
      })
      if (Object.keys(param.typeOptions).length === 0) delete param.typeOptions
    }
    
    // Extract displayOptions (show/hide conditions)
    if (prop.displayOptions) {
      param.displayOptions = {}
      if (prop.displayOptions.show) param.displayOptions.show = prop.displayOptions.show
      if (prop.displayOptions.hide) param.displayOptions.hide = prop.displayOptions.hide
      if (Object.keys(param.displayOptions).length === 0) delete param.displayOptions
    }
    
    return param
  })
}

/**
 * Extract complete node catalog
 */
export function extractNodeCatalog() {
  try {
    const nodeTypesStore = getNodeTypesStore()
    
    if (!nodeTypesStore) {
      console.error('[Catalog Extractor] Node types store not available')
      return []
    }
    
    // Try different ways to access node types
    let allNodeTypes = nodeTypesStore.allNodeTypes || 
                       nodeTypesStore.allLatestNodeTypes || 
                       nodeTypesStore.nodeTypes ||
                       []
    
    // If it's a getter function, call it
    if (typeof allNodeTypes === 'function') {
      allNodeTypes = allNodeTypes()
    }
    
    if (!allNodeTypes || allNodeTypes.length === 0) {
      console.error('[Catalog Extractor] No node types found')
      return []
    }
    
    return allNodeTypes.map(nodeType => {      
      return {
        type: nodeType.name,
        name: nodeType.displayName || nodeType.name,
        description: nodeType.description || '',
        category: getCategory(nodeType.group),
        isCustom: isCustomNode(nodeType.name),
        version: nodeType.version || 1,
        parameters: extractParameters(nodeType.properties || [])
      }
    })
  } catch (error) {
    console.error('[Catalog Extractor] Error:', error)
    return []
  }
}

/**
 * Extract only standard nodes
 */
export function extractStandardNodes() {
  return extractNodeCatalog().filter(n => !n.isCustom)
}

/**
 * Extract only custom nodes
 */
export function extractCustomNodes() {
  return extractNodeCatalog().filter(n => n.isCustom)
}
