export const ApprovalBanner = ({ pendingApproval, onApprove, onRequestChanges }) => {
  if (!pendingApproval) return null

  const styles = {
    container: {
      padding: '16px 20px',
      background: 'var(--color-background-base, #f8f8f8)',
      borderTop: '1px solid var(--color-foreground-base, #e5e7eb)',
      borderBottom: '1px solid var(--color-foreground-base, #e5e7eb)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
      fontSize: '14px',
      color: 'var(--color-text-dark, #333)',
    },
    icon: {
      fontSize: '18px',
      color: '#22c55e',
    },
    text: {
      flex: 1,
    },
    buttons: {
      display: 'flex',
      gap: '12px',
    },
    button: {
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
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>✓</span>
        <span style={styles.text}>
          Node added: <strong>{pendingApproval.nodeName}</strong>
        </span>
      </div>
      <div style={styles.buttons}>
        <button
          onClick={onApprove}
          style={{ ...styles.button, ...styles.approveButton }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
          }}
        >
          ✓ Approve
        </button>
        <button
          onClick={onRequestChanges}
          style={{ ...styles.button, ...styles.rejectButton }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          }}
        >
          ✗ Request Changes
        </button>
      </div>
    </div>
  )
}
