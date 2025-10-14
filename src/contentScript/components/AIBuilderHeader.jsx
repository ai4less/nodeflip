import nodeflipIcon from '@src/assets/nodeflip.svg'

const nodeflipIconUrl =
  typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function'
    ? chrome.runtime.getURL(nodeflipIcon)
    : nodeflipIcon

export const AIBuilderHeader = ({ onClose, onNewChat }) => {
  const styles = {
    header: {
      height: '65px',
      padding: '0 var(--spacing-l, 16px)',
      borderBottom: 'var(--border-base, 1px solid #e0e0e0)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'var(--color-background-xlight, #ffffff)',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '15px',
      fontWeight: 600,
    },
    titleText: {
      color: 'var(--color-text-dark, #333)',
    },
    betaBadge: {
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 600,
      color: 'var(--color-success, #16a34a)',
      background: 'var(--color-success-tint, #dcfce7)',
      borderRadius: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
    },
    iconButton: {
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
  }

  const aiIcon = (
    <img 
      src={nodeflipIconUrl} 
      alt="NodeFlip icon" 
      style={{ width: '18px', height: '18px', display: 'block' }}
    />
  )

  const handleNewChat = () => {
    if (confirm('Start a new chat? This will clear your current conversation history.')) {
      onNewChat()
    }
  }

  return (
    <div style={styles.header}>
      <div style={styles.titleContainer}>
        <div style={styles.title}>
          {aiIcon}
          <span style={styles.titleText}>NodeFlip AI</span>
        </div>
        <span style={styles.betaBadge}>Beta</span>
      </div>
      <div style={styles.buttonGroup}>
        <button
          style={styles.iconButton}
          onClick={handleNewChat}
          onMouseEnter={event => {
            event.currentTarget.style.background = 'var(--color-background-base, #eee)'
          }}
          onMouseLeave={event => {
            event.currentTarget.style.background = 'transparent'
          }}
          title="New chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14m-7-7h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          style={styles.iconButton}
          onClick={onClose}
          onMouseEnter={event => {
            event.currentTarget.style.background = 'var(--color-background-base, #eee)'
          }}
          onMouseLeave={event => {
            event.currentTarget.style.background = 'transparent'
          }}
          title="Close sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
