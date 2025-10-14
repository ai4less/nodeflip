import './Options.css'

export const Options = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px',
      background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
      background: 'rgba(45, 27, 78, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(151, 51, 238, 0.3)',
      borderRadius: '20px',
      padding: '48px',
      maxWidth: '500px',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    logo: {
      fontSize: '48px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #9733EE 0%, #DA22FF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#E5D4FF',
    },
    description: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#C8A2F2',
      marginBottom: '32px',
    },
    button: {
      background: 'linear-gradient(135deg, #9733EE 0%, #DA22FF 100%)',
      color: '#fff',
      border: 'none',
      padding: '12px 32px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 4px 16px rgba(151, 51, 238, 0.4)',
    },
  }

  const handleOpenPopup = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>NodeFlip</div>
        <h2 style={styles.title}>Settings</h2>
        <p style={styles.description}>
          Configure NodeFlip by clicking the extension icon in your browser toolbar to open the
          popup settings panel.
        </p>
        <p style={styles.description}>
          Advanced settings and options will be available here in future updates.
        </p>
      </div>
    </div>
  )
}

export default Options
