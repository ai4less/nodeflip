import { StatusBadge } from './StatusBadge'

export const Header = ({ n8nStatus, backendStatus, colors }) => {
  const styles = {
    header: {
      background: 'rgba(42, 27, 78, 0.6)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(151, 51, 238, 0.3)',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '24px',
      fontWeight: '700',
      background: colors.gradientPrimary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
    },
    statusContainer: {
      display: 'flex',
      gap: '8px',
    }
  }
  
  return (
    <header style={styles.header}>
      <h1 style={styles.logo}>nodeFlip</h1>
      <div style={styles.statusContainer}>
        <StatusBadge status={n8nStatus} label="n8n" colors={colors} />
        <StatusBadge status={backendStatus} label="API" colors={colors} />
      </div>
    </header>
  )
}
