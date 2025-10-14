/**
 * Chat Message Component
 * Displays a single message in the chat (matches n8n styling)
 */

export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'
  
  // Get user initials for avatar
  const getInitials = () => {
    // Try to get from user data, fallback to default
    return 'You'.substring(0, 2).toUpperCase()
  }
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      animation: 'slideIn 0.3s ease-out',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--color-text-base, #666)',
    },
    avatar: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '10px',
      fontWeight: 600,
      flexShrink: 0,
    },
    bubble: {
      padding: '12px 16px',
      borderRadius: '8px',
      maxWidth: '85%',
      background: isError
        ? '#fee'
        : 'var(--color-background-base, #f8f8f8)',
      color: isError
        ? '#c33'
        : 'var(--color-text-dark, #333)',
      fontSize: '14px',
      lineHeight: '1.6',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      border: '1px solid var(--color-foreground-base, #e5e7eb)',
    },
    timestamp: {
      fontSize: '11px',
      color: 'var(--color-text-light, #999)',
      padding: '0 6px',
      fontWeight: 400,
    }
  }
  
  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return ''
    }
  }
  
  return (
    <div style={styles.container}>
      {isUser && (
        <div style={styles.header}>
          <div style={styles.avatar}>
            {getInitials()}
          </div>
          <span>You</span>
        </div>
      )}
      <div style={styles.bubble}>
        {message.content}
      </div>
      {message.timestamp && (
        <div style={styles.timestamp}>
          {formatTime(message.timestamp)}
        </div>
      )}
    </div>
  )
}
