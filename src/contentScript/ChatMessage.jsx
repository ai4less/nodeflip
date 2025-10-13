/**
 * Chat Message Component
 * Displays a single message in the chat
 */

export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: '4px',
      animation: 'slideIn 0.3s ease-out',
    },
    bubble: {
      padding: '12px 16px',
      borderRadius: '16px',
      maxWidth: '85%',
      background: isUser 
        ? 'linear-gradient(135deg, #9733EE 0%, #DA22FF 100%)'
        : isError
          ? '#fee'
          : 'var(--color-background-base, #f0f0f0)',
      color: isUser 
        ? '#ffffff' 
        : isError
          ? '#c33'
          : 'var(--color-text-dark, #333)',
      fontSize: '14px',
      lineHeight: '1.6',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      boxShadow: isUser 
        ? '0 2px 8px rgba(151, 51, 238, 0.2)' 
        : '0 1px 4px rgba(0, 0, 0, 0.05)',
      borderBottomRightRadius: isUser ? '4px' : '16px',
      borderBottomLeftRadius: isUser ? '16px' : '4px',
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
