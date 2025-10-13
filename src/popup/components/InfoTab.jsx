export const InfoTab = ({ colors }) => {
  const styles = {
    container: {
      padding: '20px',
      animation: 'fadeIn 400ms ease',
    },
    card: {
      background: 'rgba(45, 27, 78, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(151, 51, 238, 0.2)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      marginBottom: '16px',
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      marginTop: '0',
      background: colors.gradientPrimary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    list: {
      paddingLeft: '20px',
      lineHeight: '1.6',
      color: colors.purple100,
      marginBottom: '16px',
    },
    listItem: {
      marginBottom: '8px',
    },
    paragraph: {
      lineHeight: '1.6',
      color: colors.purple200,
      marginBottom: '12px',
    },
    code: {
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '2px 8px',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '13px',
      color: colors.accentBlue,
      border: '1px solid rgba(151, 51, 238, 0.2)',
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    featureCard: {
      background: 'rgba(78, 84, 200, 0.1)',
      border: '1px solid rgba(151, 51, 238, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
    },
    featureIcon: {
      fontSize: '32px',
      marginBottom: '8px',
    },
    featureLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: colors.purple200,
    }
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={styles.title}>🚀 How to Use</h3>
        <ol style={styles.list}>
          <li style={styles.listItem}>Navigate to an n8n workflow page</li>
          <li style={styles.listItem}>Configure your backend API in Settings tab</li>
          <li style={styles.listItem}>Use the chat interface to build workflows</li>
          <li style={styles.listItem}>Sync node catalogs for better AI suggestions</li>
        </ol>
      </div>
      
      <div style={styles.card}>
        <h3 style={styles.title}>💻 Console Access</h3>
        <p style={styles.paragraph}>
          You can use <code style={styles.code}>window.nodeFlip</code> in the browser 
          console to programmatically add nodes and connections to your workflow.
        </p>
        <p style={styles.paragraph}>
          This allows for advanced automation and testing of workflow configurations.
        </p>
      </div>
      
      <div style={styles.card}>
        <h3 style={styles.title}>✨ Features</h3>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💬</div>
            <div style={styles.featureLabel}>AI Chat</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔄</div>
            <div style={styles.featureLabel}>Auto Sync</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📦</div>
            <div style={styles.featureLabel}>Node Catalog</div>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <div style={styles.featureLabel}>Fast Build</div>
          </div>
        </div>
      </div>
      
      <div style={styles.card}>
        <h3 style={styles.title}>ℹ️ About</h3>
        <p style={styles.paragraph}>
          nodeFlip is an AI-powered assistant for building n8n workflows. 
          It helps you create complex automation workflows through natural language 
          conversations.
        </p>
        <p style={styles.paragraph}>
          Version 1.0.0 • Built with 💜
        </p>
      </div>
    </div>
  )
}
