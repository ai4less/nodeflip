export const StatusBadge = ({ status, label, colors }) => {
  const isConnected = status === 'connected'
  
  const styles = {
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 500,
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#E8E8E8',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    dot: {
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      background: isConnected ? colors.connected : colors.disconnected,
    },
  }
  
  return (
    <div style={styles.badge}>
      <span style={styles.dot} />
      <span>{label}</span>
    </div>
  )
}
