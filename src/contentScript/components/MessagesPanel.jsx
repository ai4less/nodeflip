import { MessageGroup } from '../MessageGroup'
import { ChatMessage } from '../ChatMessage'

const renderGroupedMessages = (messages = []) => {
  const rendered = []
  let currentGroup = []
  let showGroupHeader = false

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index]

    if (message.role === 'user' || message.role === 'error') {
      if (currentGroup.length > 0) {
        rendered.push(
          <MessageGroup
            key={`group-${index}`}
            messages={currentGroup}
            showHeader={showGroupHeader}
          />,
        )
        currentGroup = []
        showGroupHeader = false
      }

      rendered.push(<ChatMessage key={index} message={message} />)
      continue
    }

    if (message.role === 'assistant') {
      if (currentGroup.length === 0) {
        showGroupHeader = true
      }
      currentGroup.push(message)
    }
  }

  if (currentGroup.length > 0) {
    rendered.push(
      <MessageGroup key="group-final" messages={currentGroup} showHeader={showGroupHeader} />,
    )
  }

  return rendered
}

export const MessagesPanel = ({
  messages,
  isLoading,
  error,
  onRetry,
  isSending,
  messagesEndRef,
}) => {
  const handleOpenSettings = () => {
    // Open the extension popup
    chrome.runtime.sendMessage({ type: 'openPopup' })
  }
  const styles = {
    container: {
      backgroundColor: 'var(--color-background-light, #f5f5f5)',
      border: 'var(--border-base, 1px solid #e0e0e0)',
      borderTop: 0,
      borderBottom: 0,
      position: 'relative',
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    scrollArea: {
      position: 'relative',
    },
    viewport: {
      overflowY: 'scroll',
      overflowX: 'hidden',
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
      color: '#57606A',
      fontSize: '14px',
      lineHeight: 1.6,
      background: '#F8F9FA',
      borderRadius: '8px',
      margin: '20px',
      border: '1px solid #E1E4E8',
    },
    errorTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#24292F',
      marginBottom: '8px',
    },
    buttonGroup: {
      marginTop: '16px',
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
    },
    primaryButton: {
      padding: '8px 16px',
      background: '#7C3AED',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      transition: 'background 0.15s',
    },
    secondaryButton: {
      padding: '8px 16px',
      background: 'transparent',
      color: '#57606A',
      border: '1px solid #E1E4E8',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      transition: 'all 0.15s',
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
      lineHeight: 1.7,
      marginBottom: '10px',
      color: 'var(--color-text-base, #666)',
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

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading chat...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <div style={styles.errorTitle}>Configuration Required</div>
          <div>{error}</div>
          <div style={styles.buttonGroup}>
            <button 
              style={styles.primaryButton} 
              onClick={handleOpenSettings}
              onMouseEnter={(e) => e.currentTarget.style.background = '#6D28D9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#7C3AED'}
            >
              Open Settings
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={onRetry}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F8F9FA'
                e.currentTarget.style.borderColor = '#D0D7DE'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = '#E1E4E8'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.placeholder}>
          <div style={styles.placeholderTitle}>👋</div>
          <div style={styles.placeholderText}>Welcome to NodeFlip</div>
          <div style={styles.placeholderText}>I can help you build n8n workflows.</div>
          <div style={styles.placeholderText}>What would you like to create today?</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container} data-scroll-area-viewport="">
      {renderGroupedMessages(messages)}
      {isSending && (
        <div style={styles.loadingSpinner}>
          <div style={styles.spinnerCircle} />
          <span style={styles.loadingText}>AI is thinking...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
