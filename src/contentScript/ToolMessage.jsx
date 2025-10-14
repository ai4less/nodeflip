/**
 * Tool Message Component
 * Displays a tool execution status (searching, adding nodes, etc.)
 */

export const ToolMessage = ({ toolName, status }) => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'var(--color-background-base, #f8f8f8)',
      borderRadius: '6px',
      fontSize: '13px',
    },
    statusIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '16px',
      height: '16px',
    },
    toolName: {
      fontWeight: 600,
      color: 'var(--color-text-dark, #333)',
    }
  }

  // Status icons
  const renderIcon = () => {
    if (status === 'running') {
      return (
        <svg 
          viewBox="0 0 24 24" 
          width="16px" 
          height="16px"
          style={{ color: 'var(--color-text-light, #999)', animation: 'spin 1s linear infinite' }}
        >
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="50" opacity="0.25"/>
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/>
        </svg>
      )
    } else if (status === 'completed') {
      return (
        <svg 
          viewBox="0 0 24 24" 
          width="16px" 
          height="16px"
          style={{ color: 'var(--color-success, #10b981)' }}
        >
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12l2 2l4-4"/>
          </g>
        </svg>
      )
    } else if (status === 'error') {
      return (
        <svg 
          viewBox="0 0 24 24" 
          width="16px" 
          height="16px"
          style={{ color: 'var(--color-danger, #ef4444)' }}
        >
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6m0-6l6 6"/>
          </g>
        </svg>
      )
    }
    return null
  }

  return (
    <div style={styles.container}>
      <div style={styles.statusIcon}>
        {renderIcon()}
      </div>
      <span style={styles.toolName}>
        {toolName}
      </span>
    </div>
  )
}
