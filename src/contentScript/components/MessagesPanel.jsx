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
      color: '#c33',
      fontSize: '14px',
      lineHeight: 1.6,
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
          <div>{error}</div>
          <button style={styles.retryButton} onClick={onRetry}>
            Retry
          </button>
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
