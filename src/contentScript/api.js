/**
 * API Client for nodeFlip AI Builder
 * Handles all communication with the backend API
 */

export class AIBuilderAPI {
  constructor() {
    this.config = null
  }

  /**
   * Get configuration from chrome.storage.sync
   */
  async getConfig() {
    if (this.config) return this.config
    
    return new Promise((resolve) => {
      chrome.storage.sync.get(['backendUrl', 'apiKey'], (data) => {
        this.config = {
          backendUrl: data.backendUrl || '',
          apiKey: data.apiKey || ''
        }
        resolve(this.config)
      })
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
        // Look for chats with our workflow ID in the title
        const workflowId = this.getWorkflowId()
        const matchingChat = data.find(chat => 
          chat.title && chat.title.includes(workflowId)
        )
        
        if (matchingChat) {
          return matchingChat.id
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
  async sendMessage(chatId, message) {
    const config = await this.getConfig()
    
    const response = await fetch(
      `${config.backendUrl}/api/v1/llm-chats/${chatId}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: message,
          node_catalog: [] // Empty for now, can be populated later
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
