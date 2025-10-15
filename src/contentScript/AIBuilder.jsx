/**
 * AI Builder Sidebar Component
 * Main component for the nodeFlip AI chat interface
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { ChatInput } from './ChatInput'
import { AIBuilderAPI } from './api'
import { useResizableSidebar } from './hooks/useResizableSidebar'
import { useCanvasOverlay } from './hooks/useCanvasOverlay'
import { useSidebarToggle } from './hooks/useSidebarToggle'
import { AIBuilderHeader } from './components/AIBuilderHeader'
import { MessagesPanel } from './components/MessagesPanel'
import { ApprovalBanner } from './components/ApprovalBanner'

const N8N_DELIMITER = '⧉⇋⇋➽⌑⧉§§'

const createContainerStyles = (width, isResizing, isVisible) => ({
  resizeWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: `${width}px`,
    zIndex: 'var(--z-index-ask-assistant-chat, 9999)',
  },
  resizer: {
    position: 'absolute',
    zIndex: 3,
    width: '4px',
    height: '100%',
    top: 0,
    left: 0,
    cursor: 'ew-resize',
    background: isResizing ? 'rgba(151, 51, 238, 0.15)' : 'transparent',
    transition: 'background 0.2s',
  },
  wrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  container: {
    height: '100%',
    width: '100%',
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    backgroundColor: 'var(--color-background-light, #f5f5f5)',
    fontFamily: 'var(--font-family, system-ui, -apple-system, BlinkMacSystemFont, sans-serif)',
  },
})

export const AIBuilder = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const [pendingApproval, setPendingApproval] = useState(null)
  const [lastAddedNodeName, setLastAddedNodeName] = useState(null)
  const apiRef = useRef(new AIBuilderAPI())
  const messagesEndRef = useRef(null)

  const { width, isResizing, handleMouseDown } = useResizableSidebar()

  // Update app-grid margin when width or visibility changes
  useEffect(() => {
    const appGrid = document.getElementById('app-grid')
    if (!appGrid) return

    if (isVisible) {
      appGrid.style.marginRight = `${width}px`
    } else {
      appGrid.style.marginRight = '0'
    }
  }, [width, isVisible])

  const loadChat = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const api = apiRef.current

      const isConfigured = await api.isConfigured()
      if (!isConfigured) {
        setError('Please configure your backend URL and API key in the extension popup.')
        setIsLoading(false)
        return
      }

      const id = await api.getChatOrCreate()
      setChatId(id)

      // Don't load messages from backend - we manage history in frontend
      // Load from local storage instead
      try {
        const savedState = await chrome.storage.local.get(['chatMessages', 'lastAddedNodeName'])
        if (savedState.chatMessages && Array.isArray(savedState.chatMessages)) {
          setMessages(savedState.chatMessages)
        } else {
          setMessages([])
        }
        setLastAddedNodeName(savedState.lastAddedNodeName || null)
      } catch (storageError) {
        console.warn('[nodeFlip] Could not load from storage (extension context may be invalid):', storageError)
        setMessages([])
        setLastAddedNodeName(null)
      }
    } catch (err) {
      console.error('[nodeFlip] Failed to load chat:', err)
      
      // Check if it's an authentication error
      if (err.message && (err.message.includes('401') || err.message.includes('Invalid credentials'))) {
        setError('Please configure your API credentials in the extension popup, then refresh the page.')
      } else if (err.message && err.message.includes('Backend not configured')) {
        setError('Please configure your backend URL and API key in the extension popup.')
      } else {
        setError(err.message || 'Failed to load chat. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadChat()
  }, [loadChat])

  const handleToggleSidebar = useCallback(() => {
    setIsVisible(prev => {
      const next = !prev
      // Update container display
      const container = document.getElementById('nodeflip-ai-builder')
      if (container) {
        container.style.display = next ? 'block' : 'none'
      }
      if (!prev && !chatId) {
        loadChat()
      }
      return next
    })
  }, [chatId, loadChat])

  useSidebarToggle(handleToggleSidebar)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    
    // Save messages to local storage whenever they change
    if (messages.length > 0 && typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ chatMessages: messages }).catch(err => {
        console.warn('[nodeFlip] Failed to save messages (extension context may be invalid):', err)
      })
    }
  }, [messages])
  
  // Save lastAddedNodeName to local storage whenever it changes
  useEffect(() => {
    if (chatId && typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ lastAddedNodeName }).catch(err => {
        console.warn('[nodeFlip] Failed to save lastAddedNodeName (extension context may be invalid):', err)
      })
    }
  }, [lastAddedNodeName, chatId])

  useCanvasOverlay(isSending)

  const handleCommand = useCallback(async commandName => {
    const commandMsg = {
      role: 'user',
      content: `/${commandName}`,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, commandMsg])
    setIsSending(true)

    try {
      if (commandName === 'sync-global-nodes' || commandName === 'sync-custom-nodes') {
        const statusMsg = {
          role: 'assistant',
          content: `⏳ Extracting ${
            commandName === 'sync-global-nodes' ? 'standard' : 'custom'
          } nodes from n8n...`,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, statusMsg])

        const messageId = `${commandName}-${Date.now()}`
        const catalogType = commandName === 'sync-global-nodes' ? 'standard' : 'custom'

        const catalogPromise = new Promise((resolve, reject) => {
          const handler = event => {
            if (
              event.data.type === 'nodeflip-catalog-response' &&
              event.data.messageId === messageId
            ) {
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

        window.postMessage(
          {
            type: 'nodeflip-extract-catalog',
            messageId,
            catalogType,
          },
          '*',
        )

        const catalog = await catalogPromise

        if (!catalog || catalog.length === 0) {
          throw new Error('No nodes found. Make sure n8n is fully loaded.')
        }

        setMessages(prev => {
          const nextMessages = [...prev]
          nextMessages[nextMessages.length - 1] = {
            ...nextMessages[nextMessages.length - 1],
            content: `✓ Extracted ${catalog.length} nodes. Syncing to backend...`,
          }
          return nextMessages
        })

        const api = apiRef.current
        const config = await api.getConfig()
        const endpoint = catalogType === 'standard' ? 'sync-global' : 'sync-custom'

        const response = await fetch(`${config.backendUrl}/api/v1/node-catalog/${endpoint}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ catalog }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Backend error: ${response.status} ${errorText}`)
        }

        const result = await response.json()

        setMessages(prev => {
          const nextMessages = [...prev]
          nextMessages[nextMessages.length - 1] = {
            ...nextMessages[nextMessages.length - 1],
            content: `✅ ${result.message || `Synced ${result.indexed} nodes successfully!`}`,
          }
          return nextMessages
        })
      }
    } catch (error) {
      console.error('[nodeFlip] Command failed:', error)
      setMessages(prev => {
        const nextMessages = [...prev]
        nextMessages[nextMessages.length - 1] = {
          role: 'error',
          content: `❌ ${error.message}`,
          timestamp: new Date().toISOString(),
        }
        return nextMessages
      })
    } finally {
      setIsSending(false)
    }
  }, [])

  const handleSendMessage = useCallback(
    async text => {
      if (!chatId || isSending) return

      try {
        setIsSending(true)
        setError(null)

        const userMessage = {
          role: 'user',
          content: text,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, userMessage])

        const api = apiRef.current
        const stream = await api.sendMessage(chatId, text, messages, lastAddedNodeName)

        const reader = stream.getReader()
        const decoder = new TextDecoder()
        const assistantMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        }

        setMessages(prev => [...prev, assistantMessage])

        let buffer = ''
        let hasToolCalls = false

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const messageParts = buffer.split(N8N_DELIMITER)
          buffer = messageParts.pop() || ''

          for (const part of messageParts) {
            if (!part.trim()) continue

            try {
              const parsed = JSON.parse(part)
              const streamedMessages = parsed.messages || []

              for (const msg of streamedMessages) {
                if (msg.type === 'tool') {
                  hasToolCalls = true

                  const toolMessage = {
                    role: 'assistant',
                    type: 'tool',
                    toolName: msg.toolName || msg.displayTitle || 'Processing',
                    toolCallId: msg.toolCallId,
                    status: msg.status || 'running',
                    timestamp: new Date().toISOString(),
                  }

                  setMessages(prev => {
                    const existingIndex = prev.findIndex(
                      item => item.type === 'tool' && item.toolCallId === msg.toolCallId,
                    )

                    if (existingIndex >= 0) {
                      const nextMessages = [...prev]
                      nextMessages[existingIndex] = {
                        ...nextMessages[existingIndex],
                        status: msg.status,
                      }
                      return nextMessages
                    }

                    return [...prev, toolMessage]
                  })
                } else if (msg.type === 'message' && msg.text) {
                  assistantMessage.content += msg.text

                  setMessages(prev => {
                    const nextMessages = [...prev]
                    nextMessages[nextMessages.length - 1] = { ...assistantMessage }

                    if (hasToolCalls) {
                      const assistantMessages = nextMessages.filter(
                        item => item.role === 'assistant' && !item.type,
                      )

                      if (assistantMessages.length >= 2) {
                        const lastMsg = assistantMessages[assistantMessages.length - 1]
                        const secondLastMsg = assistantMessages[assistantMessages.length - 2]

                        const getFirst10Words = value =>
                          value.trim().split(/\s+/).slice(0, 10).join(' ')

                        if (lastMsg.content && secondLastMsg.content) {
                          const lastFirst10 = getFirst10Words(lastMsg.content)
                          const secondLastFirst10 = getFirst10Words(secondLastMsg.content)

                          if (lastFirst10 === secondLastFirst10) {
                            const secondLastIndex = nextMessages.indexOf(secondLastMsg)
                            if (secondLastIndex >= 0) {
                              nextMessages.splice(secondLastIndex, 1)
                            }
                          }
                        }
                      }
                    }

                    return nextMessages
                  })
                } else if (msg.type === 'node_suggestion' && msg.data) {
                  if (msg.data.node) {
                    try {
                      const addNodePromise = new Promise((resolve, reject) => {
                        const messageId = `add-node-${Date.now()}`

                        const handleResponse = event => {
                          if (
                            event.data?.type === 'n8nStore-response' &&
                            event.data.messageId === messageId
                          ) {
                            window.removeEventListener('message', handleResponse)
                            if (event.data.success) {
                              resolve(event.data.result)
                            } else {
                              reject(new Error(event.data.error || 'Failed to add node'))
                            }
                          }
                        }

                        window.addEventListener('message', handleResponse)

                        const nodeConfig = JSON.parse(JSON.stringify(msg.data.node))

                        window.postMessage(
                          {
                            type: 'n8nStore-addNode',
                            messageId,
                            nodeConfig,
                            previousNodeName: msg.data.previousNode || null,
                          },
                          '*',
                        )

                        setTimeout(() => {
                          window.removeEventListener('message', handleResponse)
                          reject(new Error('Timeout waiting for node addition'))
                        }, 5000)
                      })

                      await addNodePromise
                      
                      // Track the node that was just added
                      setLastAddedNodeName(msg.data.node.name)

                      if (msg.data.previousNode) {
                        try {
                          await new Promise(resolve => setTimeout(resolve, 500))

                          const connectionPromise = new Promise((resolve, reject) => {
                            const messageId = `add-connection-${Date.now()}`

                            const handleResponse = event => {
                              if (
                                event.data?.type === 'n8nStore-response' &&
                                event.data.messageId === messageId
                              ) {
                                window.removeEventListener('message', handleResponse)
                                if (event.data.success) {
                                  resolve(event.data.result)
                                } else {
                                  reject(new Error(event.data.error || 'Failed to add connection'))
                                }
                              }
                            }

                            window.addEventListener('message', handleResponse)

                            window.postMessage(
                              {
                                type: 'n8nStore-addConnection',
                                messageId,
                                sourceNodeName: msg.data.previousNode,
                                targetNodeName: msg.data.node.name,
                                sourceOutputType: 'main',
                                targetInputType: 'main',
                                sourceOutputIndex: 0,
                                targetInputIndex: 0,
                              },
                              '*',
                            )

                            setTimeout(() => {
                              window.removeEventListener('message', handleResponse)
                              reject(new Error('Timeout waiting for connection'))
                            }, 5000)
                          })

                          await connectionPromise
                        } catch (error) {
                          console.error('[nodeFlip] Failed to create connection:', error)
                        }
                      }

                      setPendingApproval({
                        nodeName: msg.data.node.name,
                        nodeType: msg.data.node.type,
                      })

                      if (msg.data.chat_message) {
                        assistantMessage.content += msg.data.chat_message
                      }
                    } catch (error) {
                      console.error('[nodeFlip] Failed to add node:', error)
                      assistantMessage.content += `

⚠️ Failed to add node: ${error.message}`
                    }
                  } else if (msg.data.chat_message) {
                    assistantMessage.content += msg.data.chat_message
                  }

                  setMessages(prev => {
                    const nextMessages = [...prev]
                    nextMessages[nextMessages.length - 1] = { ...assistantMessage }
                    return nextMessages
                  })
                } else if (msg.type === 'node_update' && msg.data) {
                  try {
                    const updateNodePromise = new Promise((resolve, reject) => {
                      const messageId = `update-node-${Date.now()}`

                      const handleResponse = event => {
                        if (
                          event.data?.type === 'n8nStore-response' &&
                          event.data.messageId === messageId
                        ) {
                          window.removeEventListener('message', handleResponse)
                          if (event.data.success) {
                            resolve(event.data.result)
                          } else {
                            reject(new Error(event.data.error || 'Failed to update node'))
                          }
                        }
                      }

                      window.addEventListener('message', handleResponse)

                      window.postMessage(
                        {
                          type: 'n8nStore-updateNode',
                          messageId,
                          nodeName: msg.data.nodeName,
                          parameters: msg.data.parameters,
                        },
                        '*',
                      )

                      setTimeout(() => {
                        window.removeEventListener('message', handleResponse)
                        reject(new Error('Timeout waiting for node update'))
                      }, 5000)
                    })

                    await updateNodePromise
                  } catch (error) {
                    console.error('[nodeFlip] Failed to update node:', error)
                    assistantMessage.content += `

⚠️ Failed to update node: ${error.message}`
                  }
                }
              }
            } catch (parseError) {
              console.warn('[nodeFlip] Failed to parse n8n message:', parseError, part)
            }
          }
        }

        if (hasToolCalls) {
          setMessages(prev => {
            const nextMessages = [...prev]
            const assistantMessages = nextMessages.filter(
              item => item.role === 'assistant' && !item.type,
            )

            if (assistantMessages.length >= 2) {
              const lastMsg = assistantMessages[assistantMessages.length - 1]
              const secondLastMsg = assistantMessages[assistantMessages.length - 2]

              const getFirst10Words = value => value.trim().split(/\s+/).slice(0, 10).join(' ')

              if (lastMsg.content && secondLastMsg.content) {
                const lastFirst10 = getFirst10Words(lastMsg.content)
                const secondLastFirst10 = getFirst10Words(secondLastMsg.content)

                if (lastFirst10 === secondLastFirst10) {
                  const secondLastIndex = nextMessages.indexOf(secondLastMsg)
                  if (secondLastIndex >= 0) {
                    nextMessages.splice(secondLastIndex, 1)
                  }
                }
              }
            }

            return nextMessages
          })
        }
      } catch (err) {
        console.error('[nodeFlip] Failed to send message:', err)
        setMessages(prev => [
          ...prev,
          {
            role: 'error',
            content: 'Failed to send message. Please check your connection and try again.',
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setIsSending(false)
      }
    },
    [chatId, isSending],
  )

  const handleApprovalDecision = useCallback(
    async (approved, customMessage = null) => {
      setPendingApproval(null)
      const message = customMessage || (approved ? 'yes' : 'no')
      await handleSendMessage(message)
    },
    [handleSendMessage],
  )

  const handleApprove = useCallback(() => {
    handleApprovalDecision(true)
  }, [handleApprovalDecision])

  const handleRequestChanges = useCallback(() => {
    const feedback = prompt('What would you like to change?')
    if (feedback) {
      handleApprovalDecision(false, `no, ${feedback}`)
    }
  }, [handleApprovalDecision])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    // Also hide the container element
    const container = document.getElementById('nodeflip-ai-builder')
    if (container) {
      container.style.display = 'none'
    }
    // Reset app-grid margin
    const appGrid = document.getElementById('app-grid')
    if (appGrid) {
      appGrid.style.marginRight = '0'
    }
  }, [])

  const handleNewChat = useCallback(async () => {
    // Clear chat data from storage
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(['chatMessages', 'chatId', 'lastAddedNodeName'])
      }
    } catch (err) {
      console.warn('[nodeFlip] Failed to clear storage:', err)
    }
    
    // Reset state
    setChatId(null)
    setMessages([])
    setPendingApproval(null)
    setLastAddedNodeName(null)
    
    // Load new chat
    await loadChat()
  }, [loadChat])

  const styles = createContainerStyles(width, isResizing, isVisible)
  const inputDisabled = isSending || !chatId || !!error || !!pendingApproval
  const approvalData = !isSending ? pendingApproval : null

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
        /* Hide scrollbars but keep scrolling */
        [data-scroll-area-viewport] {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        [data-scroll-area-viewport]::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={styles.resizeWrapper}>
        <div style={styles.resizer} onMouseDown={handleMouseDown} />
        <div style={styles.wrapper}>
          <div style={styles.container}>
            <AIBuilderHeader onClose={handleClose} onNewChat={handleNewChat} />

            <MessagesPanel
              messages={messages}
              isLoading={isLoading}
              error={error}
              onRetry={loadChat}
              isSending={isSending}
              messagesEndRef={messagesEndRef}
            />

            {approvalData && (
              <ApprovalBanner
                pendingApproval={approvalData}
                onApprove={handleApprove}
                onRequestChanges={handleRequestChanges}
              />
            )}

            <ChatInput onSend={handleSendMessage} onCommand={handleCommand} disabled={inputDisabled} />
          </div>
        </div>
      </div>
    </>
  )
}
