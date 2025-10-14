import { Button } from './Button'

export const ChatSettingsCard = ({
  onToggleChatBubble,
  onClearChat,
  status,
  colors,
}) => {
  const styles = {
    card: {
      background: 'rgba(45, 27, 78, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(151, 51, 238, 0.2)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    title: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '16px',
      marginTop: 0,
      background: colors.gradientPrimary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: status ? '12px' : 0,
    },
    status: {
      padding: '10px',
      borderRadius: '8px',
      background: status && status.includes('✓')
        ? 'rgba(124, 58, 237, 0.2)'
        : 'rgba(236, 72, 153, 0.2)',
      border: `1px solid ${status && status.includes('✓') ? colors.success : colors.error}`,
      fontSize: '13px',
      color: colors.white,
      textAlign: 'center',
    },
    helpText: {
      fontSize: '12px',
      color: colors.purple300,
      marginTop: '8px',
      lineHeight: 1.4,
    },
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>💬 Chat Settings</h3>

      <div style={styles.buttonGroup}>
        <Button
          onClick={onToggleChatBubble}
          icon="💬"
          colors={colors}
        >
          Toggle Chat Bubble
        </Button>
        <Button
          variant="secondary"
          onClick={onClearChat}
          icon="🗑️"
          colors={colors}
        >
          Clear History
        </Button>
      </div>

      {status && (
        <div style={styles.status}>{status}</div>
      )}

      <p style={styles.helpText}>
        The chat bubble allows you to interact with the AI assistant directly on n8n workflow pages.
      </p>
    </div>
  )
}
