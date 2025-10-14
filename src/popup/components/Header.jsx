import { StatusBadge } from './StatusBadge'
import nodeflipIcon from '@src/assets/nodeflip.svg'

const nodeflipIconUrl =
  typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function'
    ? chrome.runtime.getURL(nodeflipIcon)
    : nodeflipIcon

export const Header = ({ backendStatus, colors }) => {
  const styles = {
    header: {
      background: '#414244',
      borderBottom: `1px solid ${colors.border}`,
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logoIcon: {
      width: '24px',
      height: '24px',
      display: 'block',
    },
    logo: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#FFFFFF',
      margin: 0,
      letterSpacing: '-0.01em',
    },
    statusContainer: {
      display: 'flex',
      gap: '6px',
    },
  }

  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <img src={nodeflipIconUrl} alt="NodeFlip" style={styles.logoIcon} />
        <h1 style={styles.logo}>NodeFlip</h1>
      </div>
      <div style={styles.statusContainer}>
        <StatusBadge status={backendStatus} label="API" colors={colors} />
      </div>
    </header>
  )
}
