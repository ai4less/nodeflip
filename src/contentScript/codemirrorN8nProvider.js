/**
 * CodeMirror n8n Provider
 * Provides autocomplete suggestions for n8n expressions
 */

/**
 * Get list of previous nodes in the workflow for autocomplete
 * @returns {Promise<Array>} List of node objects with name and type
 */
export async function getPreviousNodesForAutocomplete() {
  try {
    // Query the n8n canvas for all nodes
    const nodes = []
    const nodeElements = document.querySelectorAll('[data-name]')

    nodeElements.forEach((nodeEl) => {
      const nodeName = nodeEl.getAttribute('data-name')
      if (nodeName) {
        nodes.push({
          name: nodeName,
          type: 'node'
        })
      }
    })

    console.log('[CodeMirror] Found nodes for autocomplete:', nodes)
    return nodes
  } catch (error) {
    console.error('[CodeMirror] Error fetching nodes:', error)
    return []
  }
}
