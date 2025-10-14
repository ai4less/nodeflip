/**
 * n8n Vue Store Utilities
 * Direct manipulation of n8n's Vue.js Pinia store for workflow operations
 * Based on n8n's official Chrome extension implementation
 */

/**
 * Get n8n's workflows store from Vue app context
 * @returns {Object|null} Workflows store instance or null if not available
 */
export function getWorkflowsStore() {
  try {
    const app = document.getElementById("app")?.__vue_app__;
    if (!app) {
      console.warn('[n8nStore] Vue app not found on #app element');
      return null;
    }
    
    const provides = app._context?.provides;
    if (!provides) {
      console.warn('[n8nStore] Vue app context provides not found');
      return null;
    }
    
    const symbols = Object.getOwnPropertySymbols(provides);
    
    const pinia = symbols
      .map(s => provides[s])
      .find(p => p.state && p.state.value);
    
    if (!pinia) {
      console.warn('[n8nStore] Pinia store not found in symbols');
      return null;
    }
    
    const workflowsStore = pinia._s.get("workflows");
    if (!workflowsStore) {
      console.warn('[n8nStore] Workflows store not found in Pinia');
      return null;
    }
    
    return workflowsStore;
  } catch (error) {
    console.error('[n8nStore] Failed to get workflows store:', error);
    return null;
  }
}

/**
 * Get n8n's node types store
 * @returns {Object|null} Node types store or null
 */
export function getNodeTypesStore() {
  try {
    const app = document.getElementById("app")?.__vue_app__;
    if (!app) return null;
    
    const provides = app._context?.provides;
    if (!provides) return null;
    
    const symbols = Object.getOwnPropertySymbols(provides);
    const pinia = symbols
      .map(s => provides[s])
      .find(p => p.state && p.state.value);
    
    if (!pinia) return null;
    
    const nodeTypesStore = pinia._s.get("nodeTypes");
    return nodeTypesStore || null;
  } catch (error) {
    console.error('[n8nStore] Failed to get node types store:', error);
    return null;
  }
}

/**
 * Apply default parameters based on node type definition
 * @param {Object} nodeConfig - Node configuration
 * @param {Object} nodeTypeDef - Node type definition
 * @returns {Object} Parameters with defaults applied
 */
function applyDefaultParameters(nodeConfig, nodeTypeDef) {
  const parameters = { ...nodeConfig.parameters };
  
  if (!nodeTypeDef?.properties) return parameters;
  
  function applyDefaults(properties, params) {
    properties.forEach(prop => {
      const name = prop.name;
      
      // Apply default if parameter is missing
      if (!(name in params) && prop.default !== undefined) {
        params[name] = JSON.parse(JSON.stringify(prop.default));
      }
      
      // Handle nested collection types
      if (prop.type === 'collection' && prop.options) {
        if (!params[name] || typeof params[name] !== 'object') {
          params[name] = {};
        }
        if (typeof params[name] === 'object' && params[name] !== null) {
          applyDefaults(prop.options, params[name]);
        }
      }
      
      // Handle fixedCollection types
      if (prop.type === 'fixedCollection' && prop.options) {
        if (!(name in params) || typeof params[name] !== 'object' || !('values' in params[name]) || !Array.isArray(params[name].values)) {
          params[name] = { values: [] };
        }
      }
    });
  }
  
  applyDefaults(nodeTypeDef.properties, parameters);
  return parameters;
}

/**
 * Add a node to the n8n workflow
 * @param {Object} nodeConfig - Node configuration
 * @param {string} nodeConfig.name - Node name
 * @param {string} nodeConfig.type - Node type (e.g., "n8n-nodes-base.scheduleTrigger")
 * @param {Object} nodeConfig.parameters - Node parameters
 * @param {Array} nodeConfig.position - [x, y] position on canvas
 * @returns {Promise<Object>} Added node or null on failure
 */
export async function addNodeToWorkflow(nodeConfig, options = {}) {
  try {
    // Try to get workflows store with retries
    let workflowsStore = getWorkflowsStore();
    let retries = 0;
    const maxRetries = 3;
    
    while (!workflowsStore && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 500));
      workflowsStore = getWorkflowsStore();
      retries++;
    }
    
    if (!workflowsStore) {
      // Check if we're on a workflow page
      const isWorkflowPage = window.location.pathname.includes('/workflow/');
      if (!isWorkflowPage) {
        throw new Error('Not on a workflow page. Please open or create a workflow first.');
      }
      throw new Error('Workflows store not available. Make sure you are on an n8n workflow page.');
    }
    
    const nodeTypesStore = getNodeTypesStore();
    
    // Generate ID if missing
    if (!nodeConfig.id) {
      nodeConfig.id = `generated-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    // Set default name if missing
    if (!nodeConfig.name) {
      nodeConfig.name = `Node ${nodeConfig.id}`;
    }
    
    // Set default type if missing
    if (!nodeConfig.type) {
      nodeConfig.type = 'n8n-nodes-base.set';
    }
    
    // Skip applying defaults if parameters are already provided
    // The LLM has already configured the parameters correctly
    // Applying defaults would overwrite the configured values
    if (!nodeConfig.parameters || Object.keys(nodeConfig.parameters).length === 0) {
      // Only apply defaults if no parameters provided
      if (nodeTypesStore && nodeConfig.type) {
        const nodeTypeDef = nodeTypesStore.getNodeType(nodeConfig.type);
        if (nodeTypeDef) {
          nodeConfig.parameters = applyDefaultParameters(nodeConfig, nodeTypeDef);
        }
      }
    }
    
    const { previousNodeName } = options;

    if (previousNodeName) {
      try {
        const previousNode = typeof workflowsStore.getNodeByName === 'function'
          ? workflowsStore.getNodeByName(previousNodeName)
          : workflowsStore.workflow?.nodes?.find(n => n.name === previousNodeName);

        if (previousNode && Array.isArray(previousNode.position) && previousNode.position.length === 2) {
          const xSpacing = 320;
          const ySpacing = 120;
          const targetX = previousNode.position[0] + xSpacing;

          const connections = workflowsStore.workflow?.connections || {};
          
          const previousNodeConnections = connections[previousNodeName];
          
          let siblingCount = 0;

          if (previousNodeConnections) {
            // Count existing downstream nodes from this previous node
            Object.values(previousNodeConnections).forEach((outputIndices) => {
              if (!outputIndices) return;
              Object.values(outputIndices).forEach((connectionList) => {
                if (Array.isArray(connectionList)) {
                  siblingCount += connectionList.length;
                }
              });
            });
          }

          const targetY = previousNode.position[1] + siblingCount * ySpacing;
          const calculatedPosition = [targetX, targetY];
          
          nodeConfig.position = calculatedPosition;
        } else {
          console.warn('[n8nStore] Position calculation - previousNode not found or invalid position');
        }
      } catch (positionError) {
        console.warn('[n8nStore] Failed to derive position from previous node:', positionError);
      }
    }

    if (!nodeConfig.position || !Array.isArray(nodeConfig.position) || nodeConfig.position.length !== 2) {
      if (typeof window !== 'undefined') {
        if (!window.n8nChatPositionOffsetCounter) {
          window.n8nChatPositionOffsetCounter = 0;
        }
        const offset = window.n8nChatPositionOffsetCounter++;
        nodeConfig.position = [250 + (offset * 50), 250 + (offset * 120)];
      } else {
        nodeConfig.position = [250, 250];
      }
    }
    
    // Ensure parameters object exists
    if (!nodeConfig.parameters) {
      nodeConfig.parameters = {};
    }
    
    // Add node to store
    workflowsStore.addNode(nodeConfig);
    
    // Find the added node in the workflow
    const addedNode = workflowsStore.workflow.nodes.find(n => n.id === nodeConfig.id);
    
    if (addedNode) {
      // Trigger reactivity to update UI
      workflowsStore.setNodes([...workflowsStore.workflow.nodes]);
      
      // Zoom to fit after a delay
      setTimeout(() => {
        const zoomButton = document.querySelector('[data-test-id="zoom-to-fit"]');
        if (zoomButton) {
          zoomButton.click();
        }
      }, 500);
      
      return addedNode;
    }
    
    console.warn('[n8nStore] Node not found after adding');
    return null;
  } catch (error) {
    console.error('[n8nStore] Failed to add node:', error);
    throw error;
  }
}

/**
 * Add a connection between two nodes
 * @param {string} sourceNodeName - Source node name
 * @param {string} targetNodeName - Target node name
 * @param {string} sourceOutputType - Output type (default: "main")
 * @param {string} targetInputType - Input type (default: "main")
 * @param {number} sourceOutputIndex - Output index (default: 0)
 * @param {number} targetInputIndex - Input index (default: 0)
 * @returns {boolean} True if connection added successfully
 */
export function addConnection(
  sourceNodeName,
  targetNodeName,
  sourceOutputType = 'main',
  targetInputType = 'main',
  sourceOutputIndex = 0,
  targetInputIndex = 0
) {
  try {
    const workflowsStore = getWorkflowsStore();
    if (!workflowsStore) {
      console.error('[n8nStore] Workflows store not available');
      return false;
    }
    
    // Verify both nodes exist
    const sourceExists = workflowsStore.workflow.nodes.some(n => n.name === sourceNodeName);
    const targetExists = workflowsStore.workflow.nodes.some(n => n.name === targetNodeName);
    
    if (!sourceExists || !targetExists) {
      console.error('[n8nStore] Source or target node not found');
      return false;
    }
    
    const connection = {
      connection: [
        { node: sourceNodeName, type: sourceOutputType, index: sourceOutputIndex },
        { node: targetNodeName, type: targetInputType, index: targetInputIndex }
      ]
    };
    workflowsStore.addConnection(connection);
    
    return true;
  } catch (error) {
    console.error('[n8nStore] Failed to add connection:', error);
    return false;
  }
}

/**
 * Get current workflow data
 * @returns {Object} Workflow data with nodes and connections
 */
export function getCurrentWorkflow() {
  try {
    const store = getWorkflowsStore();
    if (!store || !store.workflow) {
      return { error: 'Cannot access workflow data' };
    }
    
    return {
      connections: JSON.parse(JSON.stringify(store.workflow.connections || {})),
      nodes: JSON.parse(JSON.stringify(store.workflow.nodes || []))
    };
  } catch (error) {
    return { error: error.message };
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('message', async (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;
    
    const message = event.data;
    
    if (message.type === 'n8nStore-addNode') {
      try {
        const result = await addNodeToWorkflow(message.nodeConfig, {
          previousNodeName: message.previousNodeName
        });
        
        // Only send serializable data back (not the full Vue node object)
        // Use JSON parse/stringify to ensure deep clone and remove any Vue reactivity
        const serializableResult = result ? JSON.parse(JSON.stringify({
          id: result.id,
          name: result.name,
          type: result.type,
          position: result.position
        })) : null;
        
        window.postMessage({
          type: 'n8nStore-response',
          messageId: message.messageId,
          success: true,
          result: serializableResult
        }, '*');
      } catch (error) {
        console.error('[n8nStore] Failed to add node:', error);
        window.postMessage({
          type: 'n8nStore-response',
          messageId: message.messageId,
          success: false,
          error: error.message
        }, '*');
      }
    }
    
    if (message.type === 'n8nStore-updateNode') {
      try {
        const workflowsStore = getWorkflowsStore();
        if (!workflowsStore) {
          throw new Error('Workflows store not available');
        }
        
        // Find the node by name
        const node = workflowsStore.getNodeByName(message.nodeName);
        if (!node) {
          throw new Error(`Node not found: ${message.nodeName}`);
        }
        
        // Merge parameters (deep merge)
        const updatedParameters = { ...node.parameters, ...message.parameters };
        
        // Update the node
        workflowsStore.updateNodeProperties({
          name: message.nodeName,
          properties: {
            parameters: updatedParameters
          }
        });
        window.postMessage({
          type: 'n8nStore-response',
          messageId: message.messageId,
          success: true,
          result: { nodeName: message.nodeName, parameters: updatedParameters }
        }, '*');
      } catch (error) {
        console.error('[n8nStore] Failed to update node:', error);
        window.postMessage({
          type: 'n8nStore-response',
          messageId: message.messageId,
          success: false,
          error: error.message
        }, '*');
      }
    }
    
    if (message.type === 'n8nStore-addConnection') {
      try {
        const result = addConnection(
          message.sourceNodeName,
          message.targetNodeName,
          message.sourceOutputType || 'main',
          message.targetInputType || 'main',
          message.sourceOutputIndex || 0,
          message.targetInputIndex || 0
        );
        
        if (result) {
          window.postMessage({
            type: 'n8nStore-response',
            messageId: message.messageId,
            success: true,
            result: {
              source: message.sourceNodeName,
              target: message.targetNodeName
            }
          }, '*');
        } else {
          throw new Error('Failed to add connection');
        }
      } catch (error) {
        console.error('[n8nStore] Failed to add connection:', error);
        window.postMessage({
          type: 'n8nStore-response',
          messageId: message.messageId,
          success: false,
          error: error.message
        }, '*');
      }
    }
  });
  
  // Listen for catalog extraction requests
  window.addEventListener('message', async (event) => {
    if (event.source !== window) return
    
    if (event.data.type === 'nodeflip-extract-catalog') {
      try {
        // Import catalog extractor functions
        const { extractNodeCatalog, extractStandardNodes, extractCustomNodes } = await import('./catalogExtractor.js')
        
        // Extract catalog
        let catalog = []
        if (event.data.catalogType === 'standard') {
          catalog = extractStandardNodes()
        } else if (event.data.catalogType === 'custom') {
          catalog = extractCustomNodes()
        } else {
          catalog = extractNodeCatalog()
        }

        // Serialize catalog to ensure it can be cloned (remove Vue reactivity)
        const serializedCatalog = JSON.parse(JSON.stringify(catalog))
        
        // Send response back
        window.postMessage({
          type: 'nodeflip-catalog-response',
          messageId: event.data.messageId,
          catalog: serializedCatalog
        }, '*')
      } catch (error) {
        console.error('[n8nStore] Error extracting catalog:', error)
        window.postMessage({
          type: 'nodeflip-catalog-response',
          messageId: event.data.messageId,
          catalog: [],
          error: error.message
        }, '*')
      }
    }
  })
  
}
