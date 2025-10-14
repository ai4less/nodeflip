import { Input } from './Input'
import { Button } from './Button'

export const BackendSettingsCard = ({
  backendUrl,
  apiKey,
  onBackendUrlChange,
  onApiKeyChange,
  onSave,
  onTestConnection,
  status,
  isTesting,
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
      <h3 style={styles.title}>⚙️ Backend Configuration</h3>

      <Input
        label="API URL"
        value={backendUrl}
        onChange={onBackendUrlChange}
        icon="🔗"
        colors={colors}
      />

      <Input
        label="API Key"
        type="password"
        value={apiKey}
        onChange={onApiKeyChange}
        icon="🔑"
        colors={colors}
      />

      <div style={styles.buttonGroup}>
        <Button onClick={onSave} icon="💾" colors={colors}>
          Save Settings
        </Button>
        <Button
          variant="secondary"
          onClick={onTestConnection}
          loading={isTesting}
          colors={colors}
        >
          Test Connection
        </Button>
      </div>

      {status && (
        <div style={styles.status}>{status}</div>
      )}

      <p style={styles.helpText}>
        Get your API key from your backend dashboard. Make sure the URL includes the protocol (https://).
      </p>
    </div>
  )
}
