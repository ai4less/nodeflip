import { Input } from './Input'
import { Button } from './Button'

const DEFAULT_BACKEND_URL = 'https://generator.ai4less.io'

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
  const handleResetUrl = () => {
    onBackendUrlChange(DEFAULT_BACKEND_URL)
  }

  const styles = {
    card: {
      background: colors.bg,
      padding: '20px',
    },
    title: {
      fontSize: '14px',
      fontWeight: 600,
      marginBottom: '16px',
      marginTop: 0,
      color: colors.text,
      letterSpacing: '-0.01em',
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      marginTop: status ? '0' : '12px',
      marginBottom: status ? '12px' : 0,
    },
    status: {
      padding: '10px 12px',
      borderRadius: '6px',
      background: status && status.includes('✓') ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${status && status.includes('✓') ? colors.success : colors.error}`,
      fontSize: '12px',
      color: status && status.includes('✓') ? colors.success : colors.error,
      textAlign: 'center',
      fontWeight: 500,
    },
    helpText: {
      fontSize: '12px',
      color: colors.textTertiary,
      marginTop: '8px',
      lineHeight: 1.5,
    },
    apiKeyLink: {
      color: colors.primary,
      textDecoration: 'none',
      fontWeight: 500,
      borderBottom: `1px solid ${colors.primary}`,
      transition: 'opacity 0.2s',
      cursor: 'pointer',
    },
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Backend Configuration</h3>

      <Input
        label="API URL"
        value={backendUrl}
        onChange={onBackendUrlChange}
        onReset={backendUrl !== DEFAULT_BACKEND_URL ? handleResetUrl : null}
        colors={colors}
      />

      <Input
        label="API Key"
        type="password"
        value={apiKey}
        onChange={onApiKeyChange}
        colors={colors}
      />

      <div style={styles.buttonGroup}>
        <Button onClick={onSave} colors={colors}>
          Save Settings
        </Button>
        <Button variant="secondary" onClick={onTestConnection} loading={isTesting} colors={colors}>
          Test Connection
        </Button>
      </div>

      {status && <div style={styles.status}>{status}</div>}

      <p style={styles.helpText}>
        <a
          href="https://platform.ai4less.io/register"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.apiKeyLink}
          onMouseEnter={(e) => (e.target.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          Get your API key
        </a>{' '}
        from the platform. Make sure the URL includes the protocol (https://).
      </p>
    </div>
  )
}
