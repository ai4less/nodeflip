/**
 * Message Group Component
 * Groups related messages together (e.g., multiple tool executions under one "Assistant" header)
 */

import { ToolMessage } from './ToolMessage'
import { ChatMessage } from './ChatMessage'

export const MessageGroup = ({ messages, showHeader = false }) => {
  if (!messages || messages.length === 0) return null

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--color-text-base, #666)',
    },
    aiIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      background: 'linear-gradient(135deg, #9733EE 0%, #DA22FF 100%)',
      borderRadius: '4px',
    },
    messagesContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }
  }

  const aiIcon = (
    <div style={styles.aiIcon}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path 
          d="M19.9658 14.0171C19.9679 14.3549 19.8654 14.6851 19.6722 14.9622C19.479 15.2393 19.2046 15.4497 18.8869 15.5645L13.5109 17.5451L11.5303 22.9211C11.4137 23.2376 11.2028 23.5107 10.9261 23.7037C10.6494 23.8966 10.3202 24 9.9829 24C9.64559 24 9.3164 23.8966 9.0397 23.7037C8.76301 23.5107 8.55212 23.2376 8.43549 22.9211L6.45487 17.5451L1.07888 15.5645C0.762384 15.4479 0.489262 15.237 0.296347 14.9603C0.103431 14.6836 0 14.3544 0 14.0171C0 13.6798 0.103431 13.3506 0.296347 13.0739C0.489262 12.7972 0.762384 12.5863 1.07888 12.4697L6.45487 10.4891L8.43549 5.11309C8.55212 4.79659 8.76301 4.52347 9.0397 4.33055C9.3164 4.13764 9.64559 4.0342 9.9829 4.0342C10.3202 4.0342 10.6494 4.13764 10.9261 4.33055C11.2028 4.52347 11.4137 4.79659 11.5303 5.11309L13.5109 10.4891L18.8869 12.4697C19.2046 12.5845 19.479 12.7949 19.6722 13.072C19.8654 13.3491 19.9679 13.6793 19.9658 14.0171Z" 
          fill="white"
        />
      </svg>
    </div>
  )

  return (
    <div style={styles.container}>
      {showHeader && (
        <div style={styles.header}>
          {aiIcon}
          <span>Assistant</span>
        </div>
      )}
      <div style={styles.messagesContainer}>
        {messages.map((msg, idx) => {
          if (msg.type === 'tool') {
            return (
              <ToolMessage 
                key={idx}
                toolName={msg.toolName || msg.displayTitle || 'Processing'}
                status={msg.status || 'completed'}
              />
            )
          } else {
            return (
              <ChatMessage 
                key={idx}
                message={msg}
              />
            )
          }
        })}
      </div>
    </div>
  )
}
