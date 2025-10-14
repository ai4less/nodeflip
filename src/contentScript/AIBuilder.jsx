/**
 * AI Builder Sidebar Component
 * Main component for the nodeFlip AI chat interface
 */

import { useState, useEffect, useRef } from 'preact/hooks'
import { ChatMessage } from './ChatMessage'
import { MessageGroup } from './MessageGroup'
import { ChatInput } from './ChatInput'
import { AIBuilderAPI } from './api'

export const AIBuilder = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [width, setWidth] = useState(400)
  const [isResizing, setIsResizing] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const [pendingApproval, setPendingApproval] = useState(null) // Track nodes awaiting approval
  const apiRef = useRef(new AIBuilderAPI())
  const messagesEndRef = useRef(null)

  // Load chat on mount
  useEffect(() => {
    loadChat()
  }, [])

  // Listen for toggle events from button
  useEffect(() => {
    const handleToggle = () => {
      setIsVisible(prev => !prev)
      if (!isVisible && !chatId) {
        loadChat() // Reload if opening and no chat loaded
      }
    }
    window.addEventListener('nodeflip-toggle-sidebar', handleToggle)
    return () => window.removeEventListener('nodeflip-toggle-sidebar', handleToggle)
  }, [isVisible, chatId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Add canvas overlay when generating
  useEffect(() => {
    const canvasContainer = document.querySelector('.vue-flow__viewport') || 
                            document.querySelector('.vue-flow__container')
    
    if (isSending && canvasContainer) {
      // Create overlay
      const overlay = document.createElement('div')
      overlay.id = 'nodeflip-generation-overlay'
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(2px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        animation: fadeIn 0.2s ease-out;
      `
      
      // Add loading indicator
      overlay.innerHTML = `
        <div style="
          background: white;
          padding: 20px 32px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 14px;
        ">
          <div style="
            width: 24px;
            height: 24px;
            border: 3px solid #7C3AED;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          "></div>
          <span style="
            font-size: 15px;
            font-weight: 600;
            color: #333;
          ">Building workflow...</span>
        </div>
        <style>
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        </style>
      `
      
      // Append to canvas parent (so it covers the viewport)
      const parent = canvasContainer.parentElement || canvasContainer
      parent.style.position = 'relative'  // Ensure parent is positioned
      parent.appendChild(overlay)
      
      console.log('[nodeFlip] Added canvas overlay for generation')
    } else {
      // Remove overlay
      const overlay = document.getElementById('nodeflip-generation-overlay')
      if (overlay) {
        overlay.remove()
        console.log('[nodeFlip] Removed canvas overlay')
      }
    }
    
    // Cleanup on unmount
    return () => {
      const overlay = document.getElementById('nodeflip-generation-overlay')
      if (overlay) overlay.remove()
    }
  }, [isSending])

  const loadChat = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const api = apiRef.current
      
      // Check if configured
      const isConfigured = await api.isConfigured()
      if (!isConfigured) {
        setError('Please configure your backend URL and API key in the extension popup.')
        setIsLoading(false)
        return
      }
      
      // Get or create chat
      const id = await api.getChatOrCreate()
      setChatId(id)
      
      // Load messages
      const msgs = await api.getMessages(id)
      setMessages(msgs)
    } catch (err) {
      console.error('[nodeFlip] Failed to load chat:', err)
      setError(err.message || 'Failed to load chat. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  // Group messages for rendering (group consecutive assistant tool messages)
  const renderMessages = () => {
    const rendered = []
    let currentGroup = []
    let showGroupHeader = false

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      
      if (msg.role === 'user' || msg.role === 'error') {
        // Flush current group if any
        if (currentGroup.length > 0) {
          rendered.push(
            <MessageGroup 
              key={`group-${i}`}
              messages={currentGroup}
              showHeader={showGroupHeader}
            />
          )
          currentGroup = []
          showGroupHeader = false
        }
        // Render user/error message
        rendered.push(<ChatMessage key={i} message={msg} />)
      } else if (msg.role === 'assistant') {
        // Check if this starts a new group (first assistant message or after user message)
        if (currentGroup.length === 0) {
          showGroupHeader = true
        }
        currentGroup.push(msg)
      }
    }

    // Flush remaining group
    if (currentGroup.length > 0) {
      rendered.push(
        <MessageGroup 
          key={`group-final`}
          messages={currentGroup}
          showHeader={showGroupHeader}
        />
      )
    }

    return rendered
  }

  const handleCommand = async (commandName) => {
    console.log('[nodeFlip] Executing command:', commandName)
    
    // Add command message to UI
    const commandMsg = {
      role: 'user',
      content: `/${commandName}`,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, commandMsg])
    setIsSending(true)
    
    try {
      if (commandName === 'sync-global-nodes' || commandName === 'sync-custom-nodes') {
        // Add status message
        const statusMsg = {
          role: 'assistant',
          content: `⏳ Extracting ${commandName === 'sync-global-nodes' ? 'standard' : 'custom'} nodes from n8n...`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, statusMsg])
        
        // Execute catalog sync via page context
        const messageId = `${commandName}-${Date.now()}`
        const catalogType = commandName === 'sync-global-nodes' ? 'standard' : 'custom'
        
        // Request extraction from page context
        const catalogPromise = new Promise((resolve, reject) => {
          const handler = (event) => {
            if (event.data.type === 'nodeflip-catalog-response' && event.data.messageId === messageId) {
              window.removeEventListener('message', handler)
              resolve(event.data.catalog)
            }
          }
          window.addEventListener('message', handler)
          setTimeout(() => {
            window.removeEventListener('message', handler)
            reject(new Error('Timeout waiting for catalog extraction'))
          }, 15000)
        })
        
        window.postMessage({
          type: 'nodeflip-extract-catalog',
          messageId: messageId,
          catalogType: catalogType
        }, '*')
        
        const catalog = await catalogPromise
        
        if (!catalog || catalog.length === 0) {
          throw new Error('No nodes found. Make sure n8n is fully loaded.')
        }
        
        // Update status
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: `✓ Extracted ${catalog.length} nodes. Syncing to backend...`
          }
          return newMessages
        })
        
        // Send to backend
        const api = apiRef.current
        const config = await api.getConfig()
        
        // Map catalog type to endpoint
        const endpoint = catalogType === 'standard' ? 'sync-global' : 'sync-custom'
        
        const response = await fetch(`${config.backendUrl}/api/v1/node-catalog/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ catalog })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Backend error: ${response.status} ${errorText}`)
        }
        
        const result = await response.json()
        
        // Update with success
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: `✅ ${result.message || `Synced ${result.indexed} nodes successfully!`}`
          }
          return newMessages
        })
      }
    } catch (error) {
      console.error('[nodeFlip] Command failed:', error)
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          role: 'error',
          content: `❌ ${error.message}`,
          timestamp: new Date().toISOString()
        }
        return newMessages
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleApproval = async (approved, customMessage = null) => {
    // Clear pending approval state
    setPendingApproval(null)
    
    // Send approval/rejection message
    const message = customMessage || (approved ? 'yes' : 'no')
    await handleSendMessage(message)
  }

  const handleSendMessage = async (text) => {
    if (!chatId || isSending) return
    
    try {
      setIsSending(true)
      setError(null)
      
      // Add user message optimistically
      const userMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, userMessage])

      // Send to backend (streaming)
      const api = apiRef.current
      const stream = await api.sendMessage(chatId, text)
      
      // Read stream
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }
      
      // Track full messages to prevent duplicates
      const seenMessages = []
      
      setMessages(prev => [...prev, assistantMessage])
      
      // n8n-style streaming with custom delimiter
      const N8N_DELIMITER = '⧉⇋⇋➽⌑⧉§§'
      let buffer = ''
      
      let hasToolCalls = false
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        // Split by n8n delimiter
        const messageParts = buffer.split(N8N_DELIMITER)
        buffer = messageParts.pop() || '' // Keep incomplete message in buffer
        
        for (const part of messageParts) {
          if (!part.trim()) continue
          
          try {
            const parsed = JSON.parse(part)
            const messages = parsed.messages || []
            
            for (const msg of messages) {
              if (msg.type === 'tool') {
                // Mark that we've seen tool calls
                hasToolCalls = true
                
                // Tool execution message - add as separate message
                const toolMessage = {
                  role: 'assistant',
                  type: 'tool',
                  toolName: msg.toolName || msg.displayTitle || 'Processing',
                  toolCallId: msg.toolCallId,
                  status: msg.status || 'running',
                  timestamp: new Date().toISOString()
                }
                
                // Check if tool message already exists (update status)
                setMessages(prev => {
                  const existingIndex = prev.findIndex(
                    m => m.type === 'tool' && m.toolCallId === msg.toolCallId
                  )
                  
                  if (existingIndex >= 0) {
                    // Update existing tool message status
                    const updated = [...prev]
                    updated[existingIndex] = { ...updated[existingIndex], status: msg.status }
                    return updated
                  } else {
                    // Add new tool message
                    return [...prev, toolMessage]
                  }
                })
              } else if (msg.type === 'message' && msg.text) {                
                seenMessages.push(msg.text)
                assistantMessage.content += msg.text
                
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = { ...assistantMessage }
                  
                  // If tools were called, check for duplicates immediately
                  if (hasToolCalls) {
                    const assistantMessages = newMessages.filter(m => m.role === 'assistant' && !m.type)
                    
                    if (assistantMessages.length >= 2) {
                      const lastMsg = assistantMessages[assistantMessages.length - 1]
                      const secondLastMsg = assistantMessages[assistantMessages.length - 2]
                      
                      const getFirst10Words = (text) => text.trim().split(/\s+/).slice(0, 10).join(' ')
                      
                      if (lastMsg.content && secondLastMsg.content) {
                        const lastFirst10 = getFirst10Words(lastMsg.content)
                        const secondLastFirst10 = getFirst10Words(secondLastMsg.content)
                        
                        if (lastFirst10 === secondLastFirst10) {
                          const secondLastIndex = newMessages.indexOf(secondLastMsg)
                          if (secondLastIndex >= 0) {
                            newMessages.splice(secondLastIndex, 1)
                          }
                        }
                      }
                    }
                  }
                  
                  return newMessages
                })
              } else if (msg.type === 'node_suggestion' && msg.data) {
                // Node suggestion - add node to workflow automatically via page context
                console.log('[DEBUG] Node suggestion received:', {
                  nodeName: msg.data.node?.name,
                  previousNode: msg.data.previousNode,
                  hasPreviousNode: !!msg.data.previousNode
                })
                if (msg.data.node) {
                  try {
                    console.log('[nodeFlip] Received node suggestion:', msg.data.node)
                    console.log('[nodeFlip] Node parameters:', JSON.stringify(msg.data.node.parameters, null, 2))
                    
                    // Send message to page context to add node
                    const addNodePromise = new Promise((resolve, reject) => {
                      const messageId = `add-node-${Date.now()}`
                      
                      const handleResponse = (event) => {
                        if (event.data?.type === 'n8nStore-response' && event.data.messageId === messageId) {
                          window.removeEventListener('message', handleResponse)
                          if (event.data.success) {
                            resolve(event.data.result)
                          } else {
                            reject(new Error(event.data.error || 'Failed to add node'))
                          }
                        }
                      }
                      
                      window.addEventListener('message', handleResponse)
                      
                      // Send request to page context - use JSON to ensure cloneable
                      window.postMessage({
                        type: 'n8nStore-addNode',
                        messageId: messageId,
                        nodeConfig: JSON.parse(JSON.stringify(msg.data.node))
                      }, '*')
                      
                      // Timeout after 5 seconds
                      setTimeout(() => {
                        window.removeEventListener('message', handleResponse)
                        reject(new Error('Timeout waiting for node addition'))
                      }, 5000)
                    })
                    
                    await addNodePromise
                    console.log('[nodeFlip] Node added successfully')
                    
                    // Auto-connect to previous node if specified
                    if (msg.data.previousNode) {
                      console.log(`[nodeFlip] Auto-connecting: ${msg.data.previousNode} → ${msg.data.node.name}`)
                      
                      try {
                        // Wait a bit for node to be fully added
                        await new Promise(resolve => setTimeout(resolve, 500))
                        
                        // Send connection request to page context
                        const connectionPromise = new Promise((resolve, reject) => {
                          const messageId = `add-connection-${Date.now()}`
                          
                          const handleResponse = (event) => {
                            if (event.data?.type === 'n8nStore-response' && event.data.messageId === messageId) {
                              window.removeEventListener('message', handleResponse)
                              if (event.data.success) {
                                resolve(event.data.result)
                              } else {
                                reject(new Error(event.data.error || 'Failed to add connection'))
                              }
                            }
                          }
                          
                          window.addEventListener('message', handleResponse)
                          
                          // Send connection request
                          window.postMessage({
                            type: 'n8nStore-addConnection',
                            messageId: messageId,
                            sourceNodeName: msg.data.previousNode,
                            targetNodeName: msg.data.node.name,
                            sourceOutputType: 'main',
                            targetInputType: 'main',
                            sourceOutputIndex: 0,
                            targetInputIndex: 0
                          }, '*')
                          
                          // Timeout after 5 seconds
                          setTimeout(() => {
                            window.removeEventListener('message', handleResponse)
                            reject(new Error('Timeout waiting for connection'))
                          }, 5000)
                        })
                        
                        await connectionPromise
                        console.log(`[nodeFlip] Connection created: ${msg.data.previousNode} → ${msg.data.node.name}`)
                      } catch (error) {
                        // Log but don't fail - connection is optional
                        console.error('[nodeFlip] Failed to create connection:', error)
                      }
                    }
                    
                    // Set pending approval state
                    setPendingApproval({
                      nodeName: msg.data.node.name,
                      nodeType: msg.data.node.type
                    })
                    
                    // Don't show auto-generated message - backend handles explanations
                    // Only show if backend explicitly sends chat_message
                    if (msg.data.chat_message) {
                      assistantMessage.content += msg.data.chat_message
                    }
                  } catch (error) {
                    console.error('[nodeFlip] Failed to add node:', error)
                    assistantMessage.content += `\n\n⚠️ Failed to add node: ${error.message}`
                  }
                } else if (msg.data.chat_message) {
                  // Just a chat message without node
                  assistantMessage.content += msg.data.chat_message
                }
                
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = { ...assistantMessage }
                  return newMessages
                })
              } else if (msg.type === 'node_update' && msg.data) {
                // Node update - update existing node parameters on canvas
                console.log('[nodeFlip] Received node update:', msg.data.nodeName, msg.data.parameters)
                
                try {
                  // Send message to page context to update node
                  const updateNodePromise = new Promise((resolve, reject) => {
                    const messageId = `update-node-${Date.now()}`
                    
                    const handleResponse = (event) => {
                      if (event.data?.type === 'n8nStore-response' && event.data.messageId === messageId) {
                        window.removeEventListener('message', handleResponse)
                        if (event.data.success) {
                          resolve(event.data.result)
                        } else {
                          reject(new Error(event.data.error || 'Failed to update node'))
                        }
                      }
                    }
                    
                    window.addEventListener('message', handleResponse)
                    
                    // Send update request to page context
                    window.postMessage({
                      type: 'n8nStore-updateNode',
                      messageId: messageId,
                      nodeName: msg.data.nodeName,
                      parameters: msg.data.parameters
                    }, '*')
                    
                    // Timeout after 5 seconds
                    setTimeout(() => {
                      window.removeEventListener('message', handleResponse)
                      reject(new Error('Timeout waiting for node update'))
                    }, 5000)
                  })
                  
                  await updateNodePromise
                  console.log('[nodeFlip] Node updated successfully')
                } catch (error) {
                  console.error('[nodeFlip] Failed to update node:', error)
                  assistantMessage.content += `\n\n⚠️ Failed to update node: ${error.message}`
                }
              }
              // Ignore tool messages for now - they're just progress indicators
            }
          } catch (parseError) {
            console.warn('[nodeFlip] Failed to parse n8n message:', parseError, part)
          }
        }
      }
      
      // After stream completes, check for duplicates if tools were called
      if (hasToolCalls) {
        setMessages(prev => {
          const newMessages = [...prev]
          
          // Find messages with same role in the group
          const assistantMessages = newMessages.filter(m => m.role === 'assistant' && !m.type)
          
          if (assistantMessages.length >= 2) {
            const lastMsg = assistantMessages[assistantMessages.length - 1]
            const secondLastMsg = assistantMessages[assistantMessages.length - 2]
            
            // Check if first 10 words match
            const getFirst10Words = (text) => text.trim().split(/\s+/).slice(0, 10).join(' ')
            
            if (lastMsg.content && secondLastMsg.content) {
              const lastFirst10 = getFirst10Words(lastMsg.content)
              const secondLastFirst10 = getFirst10Words(secondLastMsg.content)
              
              if (lastFirst10 === secondLastFirst10) {
                console.log('[nodeFlip] Removing duplicate message before tools')
                // Remove the second-to-last message (the one before tools)
                const secondLastIndex = newMessages.indexOf(secondLastMsg)
                if (secondLastIndex >= 0) {
                  newMessages.splice(secondLastIndex, 1)
                }
              }
            }
          }
          
          return newMessages
        })
      }
      
    } catch (err) {
      console.error('[nodeFlip] Failed to send message:', err)
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Failed to send message. Please check your connection and try again.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsSending(false)
    }
  }

  // Resize handling
  const handleMouseDown = (e) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX
      setWidth(Math.max(300, Math.min(800, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  if (!isVisible) return null

  const styles = {
    container: {
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: `${width}px`,
      background: 'var(--color-background-xlight, #ffffff)',
      boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      borderLeft: '1px solid var(--color-foreground-base, #e0e0e0)',
      fontFamily: 'var(--font-family, system-ui, -apple-system, BlinkMacSystemFont, sans-serif)',
    },
    resizeHandle: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '6px',
      cursor: 'ew-resize',
      background: isResizing ? 'rgba(151, 51, 238, 0.15)' : 'transparent',
      transition: 'background 0.2s',
      zIndex: 10,
    },
    resizeHoverOverlay: {
      position: 'absolute',
      left: '-2px',
      top: 0,
      bottom: 0,
      width: '10px',
    },
    header: {
      padding: '18px 20px',
      borderBottom: '1px solid var(--color-foreground-base, #e0e0e0)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'var(--color-background-base, #f8f8f8)',
      minHeight: '64px',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '16px',
      fontWeight: 600,
    },
    titleText: {
      background: 'linear-gradient(135deg, #9733EE 0%, #DA22FF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      color: 'var(--color-text-base, #666)',
      borderRadius: '6px',
      transition: 'background 0.2s',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: 'var(--color-background-xlight, #fafafa)',
    },
    placeholder: {
      textAlign: 'center',
      padding: '60px 30px',
      color: 'var(--color-text-light, #999)',
    },
    placeholderTitle: {
      fontSize: '32px',
      marginBottom: '16px',
    },
    placeholderText: {
      fontSize: '15px',
      lineHeight: '1.7',
      marginBottom: '10px',
      color: 'var(--color-text-base, #666)',
    },
    loader: {
      textAlign: 'center',
      padding: '60px 30px',
      color: 'var(--color-text-light, #999)',
      fontSize: '15px',
    },
    error: {
      textAlign: 'center',
      padding: '40px 30px',
      color: '#c33',
      fontSize: '14px',
      lineHeight: '1.6',
      background: '#fee',
      borderRadius: '8px',
      margin: '20px',
    },
    retryButton: {
      marginTop: '16px',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #9733EE 0%, #DA22FF 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
    },
    approvalContainer: {
      padding: '16px 20px',
      background: 'var(--color-background-base, #f8f8f8)',
      borderTop: '1px solid var(--color-foreground-base, #e5e7eb)',
      borderBottom: '1px solid var(--color-foreground-base, #e5e7eb)',
    },
    approvalHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
      fontSize: '14px',
      color: 'var(--color-text-dark, #333)',
    },
    approvalIcon: {
      fontSize: '18px',
      color: '#22c55e',
    },
    approvalText: {
      flex: 1,
    },
    approvalButtons: {
      display: 'flex',
      gap: '12px',
    },
    approvalButton: {
      flex: 1,
      padding: '12px 16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    },
    approveButton: {
      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      color: '#fff',
    },
    rejectButton: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
    },
    loadingSpinner: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      fontSize: '14px',
      color: 'var(--color-text-light, #999)',
      animation: 'slideIn 0.3s ease-out',
    },
    spinnerCircle: {
      width: '18px',
      height: '18px',
      border: '3px solid var(--color-primary, #7C3AED)',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
      fontWeight: 500,
    },
  }

  const aiIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19.9658 14.0171C19.9679 14.3549 19.8654 14.6851 19.6722 14.9622C19.479 15.2393 19.2046 15.4497 18.8869 15.5645L13.5109 17.5451L11.5303 22.9211C11.4137 23.2376 11.2028 23.5107 10.9261 23.7037C10.6494 23.8966 10.3202 24 9.9829 24C9.64559 24 9.3164 23.8966 9.0397 23.7037C8.76301 23.5107 8.55212 23.2376 8.43549 22.9211L6.45487 17.5451L1.07888 15.5645C0.762384 15.4479 0.489262 15.237 0.296347 14.9603C0.103431 14.6836 0 14.3544 0 14.0171C0 13.6798 0.103431 13.3506 0.296347 13.0739C0.489262 12.7972 0.762384 12.5863 1.07888 12.4697L6.45487 10.4891L8.43549 5.11309C8.55212 4.79659 8.76301 4.52347 9.0397 4.33055C9.3164 4.13764 9.64559 4.0342 9.9829 4.0342C10.3202 4.0342 10.6494 4.13764 10.9261 4.33055C11.2028 4.52347 11.4137 4.79659 11.5303 5.11309L13.5109 10.4891L18.8869 12.4697C19.2046 12.5845 19.479 12.7949 19.6722 13.072C19.8654 13.3491 19.9679 13.6793 19.9658 14.0171ZM14.1056 4.12268H15.7546V5.77175C15.7546 5.99043 15.8415 6.20015 15.9961 6.35478C16.1508 6.50941 16.3605 6.59628 16.5792 6.59628C16.7979 6.59628 17.0076 6.50941 17.1622 6.35478C17.3168 6.20015 17.4037 5.99043 17.4037 5.77175V4.12268H19.0528C19.2715 4.12268 19.4812 4.03581 19.6358 3.88118C19.7905 3.72655 19.8773 3.51682 19.8773 3.29814C19.8773 3.07946 19.7905 2.86974 19.6358 2.71511C19.4812 2.56048 19.2715 2.47361 19.0528 2.47361H17.4037V0.824535C17.4037 0.605855 17.3168 0.396131 17.1622 0.241501C17.0076 0.0868704 16.7979 0 16.5792 0C16.3605 0 16.1508 0.0868704 15.9961 0.241501C15.8415 0.396131 15.7546 0.605855 15.7546 0.824535V2.47361H14.1056C13.8869 2.47361 13.6772 2.56048 13.5225 2.71511C13.3679 2.86974 13.281 3.07946 13.281 3.29814C13.281 3.51682 13.3679 3.72655 13.5225 3.88118C13.6772 4.03581 13.8869 4.12268 14.1056 4.12268ZM23.1755 7.42082H22.3509V6.59628C22.3509 6.3776 22.2641 6.16788 22.1094 6.01325C21.9548 5.85862 21.7451 5.77175 21.5264 5.77175C21.3077 5.77175 21.098 5.85862 20.9434 6.01325C20.7887 6.16788 20.7019 6.3776 20.7019 6.59628V7.42082H19.8773C19.6586 7.42082 19.4489 7.50769 19.2943 7.66232C19.1397 7.81695 19.0528 8.02667 19.0528 8.24535C19.0528 8.46404 19.1397 8.67376 19.2943 8.82839C19.4489 8.98302 19.6586 9.06989 19.8773 9.06989H20.7019V9.89443C20.7019 10.1131 20.7887 10.3228 20.9434 10.4775C21.098 10.6321 21.3077 10.719 21.5264 10.719C21.7451 10.719 21.9548 10.6321 22.1094 10.4775C22.2641 10.3228 22.3509 10.1131 22.3509 9.89443V9.06989H23.1755C23.3941 9.06989 23.6039 8.98302 23.7585 8.82839C23.9131 8.67376 24 8.46404 24 8.24535C24 8.02667 23.9131 7.81695 23.7585 7.66232C23.6039 7.50769 23.3941 7.42082 23.1755 7.42082Z" fill="url(#nodeflip-header-gradient)"/>
      <defs>
        <linearGradient id="nodeflip-header-gradient" x1="0" y1="0" x2="28.8315" y2="9.82667" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9733EE"/>
          <stop offset="0.495" stopColor="#DA22FF"/>
          <stop offset="1" stopColor="#8F94FB"/>
        </linearGradient>
      </defs>
    </svg>
  )

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={styles.container}>
        <div 
          style={styles.resizeHandle}
          onMouseDown={handleMouseDown}
        >
          <div style={styles.resizeHoverOverlay} />
        </div>
      
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <div style={styles.title}>
            {aiIcon}
            <span style={styles.titleText}>nodeFlip AI</span>
          </div>
        </div>
        <button 
          style={styles.closeButton}
          onClick={() => setIsVisible(false)}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-background-base, #eee)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title="Close sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {isLoading ? (
          <div style={styles.loader}>
            <div>Loading chat...</div>
          </div>
        ) : error ? (
          <div style={styles.error}>
            <div>{error}</div>
            <button style={styles.retryButton} onClick={loadChat}>
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.placeholder}>
            <div style={styles.placeholderTitle}>👋</div>
            <div style={styles.placeholderText}>Hi! I'm nodeFlip AI</div>
            <div style={styles.placeholderText}>I can help you build n8n workflows.</div>
            <div style={styles.placeholderText}>What would you like to create today?</div>
          </div>
        ) : (
          <>
            {renderMessages()}
            
            {/* Loading spinner when AI is generating */}
            {isSending && (
              <div style={styles.loadingSpinner}>
                <div style={styles.spinnerCircle} />
                <span style={styles.loadingText}>AI is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Approval buttons - show when node is awaiting approval */}
      {pendingApproval && !isSending && (
        <div style={styles.approvalContainer}>
          <div style={styles.approvalHeader}>
            <span style={styles.approvalIcon}>✓</span>
            <span style={styles.approvalText}>
              Node added: <strong>{pendingApproval.nodeName}</strong>
            </span>
          </div>
          <div style={styles.approvalButtons}>
            <button
              onClick={() => handleApproval(true)}
              style={{...styles.approvalButton, ...styles.approveButton}}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'}
            >
              ✓ Approve
            </button>
            <button
              onClick={() => {
                const feedback = prompt("What would you like to change?")
                if (feedback) {
                  handleApproval(false, `no, ${feedback}`)
                }
              }}
              style={{...styles.approvalButton, ...styles.rejectButton}}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}
            >
              ✗ Request Changes
            </button>
          </div>
        </div>
      )}

      <ChatInput 
        onSend={handleSendMessage}
        onCommand={handleCommand}
        disabled={isSending || !chatId || !!error || !!pendingApproval} 
      />
      </div>
    </>
  )
}
