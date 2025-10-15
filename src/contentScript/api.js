/**
 * API Client for nodeFlip AI Builder
 * Handles all communication with the backend API
 */

export class AIBuilderAPI {
  constructor() {
    this.config = null
  }

  /**
   * Get remaining quota for the API key
   */
  async getQuota() {
    try {
      const config = await this.getConfig()
      
      if (!config.backendUrl || !config.apiKey) {
        throw new Error('Backend URL or API key not configured')
      }

      const response = await fetch(`${config.backendUrl}/api/v1/api-keys/quota`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to fetch quota' }))
        throw new Error(error.detail || 'Failed to fetch quota')
      }

      return await response.json()
    } catch (error) {
      console.error('[nodeFlip API] Failed to fetch quota:', error)
      throw error
    }
  }

  /**
   * Get configuration from chrome.storage.sync
   * Always fetches fresh config from storage to ensure latest values
   */
  async getConfig() {
    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        reject(new Error('Extension context invalidated. Please reload the page.'))
        return
      }
      
      try {
        chrome.storage.sync.get(['backendUrl', 'apiKey'], (data) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
            return
          }
          
          this.config = {
            backendUrl: data.backendUrl || '',
            apiKey: data.apiKey || ''
          }
          resolve(this.config)
        })
      } catch (error) {
        reject(new Error('Extension context invalidated. Please reload the page.'))
      }
    })
  }

  /**
   * Create a new chat session
   */
  async createChat() {
    const config = await this.getConfig()
    
    if (!config.backendUrl || !config.apiKey) {
      throw new Error('Backend not configured. Please set API URL and Key in the extension popup.')
    }

    const response = await fetch(`${config.backendUrl}/api/v1/llm-chats/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        llm_provider_id: null,
        title: `Workflow ${this.getWorkflowId()} - ${new Date().toLocaleString()}`
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create chat: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    return data.id
  }

  /**
   * Get existing chat for current workflow or create new one
   */
  async getChatOrCreate() {
    const config = await this.getConfig()
    
    if (!config.backendUrl || !config.apiKey) {
      throw new Error('Backend not configured')
    }

    try {
      // Try to get list of chats (most recent first)
      const response = await fetch(
        `${config.backendUrl}/api/v1/llm-chats/`,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle different response formats
        // Some APIs return { items: [...] } or { results: [...] } or just [...]
        const chatList = Array.isArray(data) ? data : (data.items || data.results || data.data || [])
        
        if (Array.isArray(chatList) && chatList.length > 0) {
          // Look for chats with our workflow ID in the title
          const workflowId = this.getWorkflowId()
          const matchingChat = chatList.find(chat => 
            chat.title && chat.title.includes(workflowId)
          )
          
          if (matchingChat) {
            return matchingChat.id
          }
        }
      }
    } catch (error) {
      console.warn('[nodeFlip] Failed to get existing chat:', error)
    }
    
    // Create new chat if none exists
    return await this.createChat()
  }

  /**
   * Get messages for a chat session
   */
  async getMessages(chatId) {
    const config = await this.getConfig()
    
    const response = await fetch(
      `${config.backendUrl}/api/v1/llm-chats/${chatId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.messages || []
  }

  /**
   * Send a message and get streaming response
   */
  async sendMessage(chatId, message, conversationHistory = [], lastAddedNodeName = null, addedNodes = []) {
    const config = await this.getConfig()
    
    // Use the nodes we've tracked in frontend state (no need to query n8n canvas)
    const workflowNodes = addedNodes
    const workflowConnections = {} // We don't track connections, not needed for duplicate prevention
    
    // Convert frontend message format to backend format
    // Only include messages with actual content (skip tool status messages and empty messages)
    const backendHistory = conversationHistory
      .filter(msg => {
        // Skip tool status messages
        if (msg.type === 'tool') return false
        // Skip messages without content
        if (!msg.content || msg.content.trim() === '') return false
        // Skip error messages
        if (msg.role === 'error') return false
        return true
      })
      .map(msg => {
        if (msg.role === 'user') {
          return { role: 'user', content: msg.content }
        } else if (msg.role === 'assistant') {
          return { role: 'assistant', content: msg.content }
        }
        return null
      })
      .filter(msg => msg !== null)
    
    const response = await fetch(
      `${config.backendUrl}/api/v1/llm-chats/${chatId}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payload: {
            role: 'user',
            type: 'message',
            text: message,
            workflowContext: {
              currentWorkflow: {
                nodes: workflowNodes,
                connections: workflowConnections
              },
              conversationHistory: backendHistory,
              lastAddedNodeName: lastAddedNodeName
            }
          }
        })
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to send message: ${response.status} - ${errorText}`)
    }
    
    return response.body // Return readable stream
  }

  /**
   * Extract workflow ID from current URL
   */
  getWorkflowId() {
    const match = window.location.pathname.match(/\/workflow\/([^\/]+)/)
    return match ? match[1] : '__EMPTY__'
  }

  /**
   * Check if backend is configured
   */
  async isConfigured() {
    const config = await this.getConfig()
    return !!(config.backendUrl && config.apiKey)
  }
}
