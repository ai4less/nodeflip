
import { useState, useCallback } from 'preact/hooks'

import { BackendSettingsCard } from './BackendSettingsCard'
import { useStatusMessage } from '../hooks/useStatusMessage'

export const SettingsTab = ({
  backendUrl,
  apiKey,
  onBackendUrlChange,
  onApiKeyChange,
  onSave,
  colors,
}) => {
  const [isTesting, setIsTesting] = useState(false)
  const backendStatus = useStatusMessage()

  const handleTestConnection = useCallback(async () => {
    if (!backendUrl || !apiKey) {
      backendStatus.showStatus('❌ Please enter both API URL and API Key first')
      return
    }

    setIsTesting(true)
    backendStatus.showStatus('Testing connection...', 0)

    try {
      const response = await fetch(`${backendUrl}/api/v1/llm-chats/`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })

      if (response.ok) {
        backendStatus.showStatus('✓ Connection successful!', 5000)
      } else {
        backendStatus.showStatus(`❌ Connection failed: ${response.status} ${response.statusText}`, 5000)
      }
    } catch (error) {
      backendStatus.showStatus(`❌ Connection failed: ${error.message}`, 5000)
    }

    setIsTesting(false)
  }, [apiKey, backendStatus, backendUrl])

  const handleSave = useCallback(async () => {
    if (!backendUrl || !apiKey) {
      backendStatus.showStatus('❌ Please enter both API URL and API Key')
      return
    }

    await onSave()
    backendStatus.showStatus('✓ Settings saved successfully')
  }, [apiKey, backendStatus, backendUrl, onSave])



  const styles = {
    container: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      animation: 'fadeIn 400ms ease',
    },
  }

  return (
    <div style={styles.container}>
      <BackendSettingsCard
        backendUrl={backendUrl}
        apiKey={apiKey}
        onBackendUrlChange={onBackendUrlChange}
        onApiKeyChange={onApiKeyChange}
        onSave={handleSave}
        onTestConnection={handleTestConnection}
        status={backendStatus.status}
        isTesting={isTesting}
        colors={colors}
      />
    </div>
  )
}

export default SettingsTab
