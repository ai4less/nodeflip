export const StatusBadge = ({ status, label, colors }) => {
  const isConnected = status === 'connected'
  
  const styles = {
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      background: 'rgba(0, 0, 0, 0.3)',
      fontSize: '12px',
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: isConnected ? colors.success : colors.error,
      boxShadow: isConnected ? '0 0 12px rgba(124, 58, 237, 0.6)' : 'none',
      animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none',
    },
    label: {
      color: colors.white,
    }
  }
  
  return (
    <div style={styles.badge}>
      <span style={styles.dot} />
      <span style={styles.label}>{label}</span>
    </div>
  )
}
