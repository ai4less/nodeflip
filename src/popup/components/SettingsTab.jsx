import { useState } from 'preact/hooks'
import { Input } from './Input'
import { Button } from './Button'

export const SettingsTab = ({
  backendUrl,
  apiKey,
  onBackendUrlChange,
  onApiKeyChange,
  onSave,
  colors
}) => {
  const [settingsStatus, setSettingsStatus] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [autoAccept, setAutoAccept] = useState(false)
  
  const handleTestConnection = async () => {
    if (!backendUrl || !apiKey) {
      setSettingsStatus('❌ Please enter both API URL and API Key first')
      setTimeout(() => setSettingsStatus(''), 3000)
      return
    }
    
    setIsTesting(true)
    setSettingsStatus('Testing connection...')
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/llm-chats/`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      
      if (response.ok) {
        setSettingsStatus('✓ Connection successful!')
      } else {
        setSettingsStatus(`❌ Connection failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      setSettingsStatus('❌ Connection failed: ' + error.message)
    }
    
    setIsTesting(false)
    setTimeout(() => setSettingsStatus(''), 5000)
  }
  
  const handleSave = async () => {
    if (!backendUrl || !apiKey) {
      setSettingsStatus('❌ Please enter both API URL and API Key')
      setTimeout(() => setSettingsStatus(''), 3000)
      return
    }
    
    await onSave()
    setSettingsStatus('✓ Settings saved successfully')
    setTimeout(() => setSettingsStatus(''), 3000)
  }
  
  const handleClearChat = async () => {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      await chrome.storage.local.remove(['chatMessages', 'chatId'])
      setSettingsStatus('✓ Chat history cleared')
      setTimeout(() => setSettingsStatus(''), 3000)
    }
  }
  
  const handleToggleChatBubble = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab) {
        setSettingsStatus('❌ No active tab found')
        setTimeout(() => setSettingsStatus(''), 3000)
        return
      }
      
      chrome.tabs.sendMessage(tab.id, { type: 'nodeFlipToggleChatBubble' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error toggling chat bubble:', chrome.runtime.lastError.message)
        }
      })
      
      window.close()
    } catch (error) {
      setSettingsStatus('❌ Failed to toggle chat bubble')
      setTimeout(() => setSettingsStatus(''), 3000)
    }
  }
  
  const styles = {
    container: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      animation: 'fadeIn 400ms ease',
    },
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
      fontWeight: '600',
      marginBottom: '16px',
      marginTop: '0',
      background: colors.gradientPrimary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: settingsStatus ? '12px' : '0',
    },
    status: {
      padding: '10px',
      borderRadius: '8px',
      background: settingsStatus.includes('✓') 
        ? 'rgba(124, 58, 237, 0.2)' 
        : 'rgba(236, 72, 153, 0.2)',
      border: `1px solid ${settingsStatus.includes('✓') ? colors.success : colors.error}`,
      fontSize: '13px',
      color: colors.white,
      textAlign: 'center',
    },
    toggleContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      background: 'rgba(78, 84, 200, 0.1)',
      borderRadius: '12px',
      marginBottom: '12px',
    },
    toggleLabel: {
      fontSize: '14px',
      color: colors.purple200,
    },
    helpText: {
      fontSize: '12px',
      color: colors.purple300,
      marginTop: '8px',
      lineHeight: '1.4',
    }
  }
  
  return (
    <div style={styles.container}>
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
          <Button onClick={handleSave} icon="💾" colors={colors}>
            Save Settings
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleTestConnection}
            loading={isTesting}
            colors={colors}
          >
            Test Connection
          </Button>
        </div>
        
        {settingsStatus && (
          <div style={styles.status}>{settingsStatus}</div>
        )}
        
        <p style={styles.helpText}>
          Get your API key from your backend dashboard. Make sure the URL includes the protocol (https://).
        </p>
      </div>
      
      <div style={styles.card}>
        <h3 style={styles.title}>💬 Chat Settings</h3>
        
        <div style={styles.buttonGroup}>
          <Button 
            onClick={handleToggleChatBubble}
            icon="💬"
            colors={colors}
          >
            Toggle Chat Bubble
          </Button>
          <Button 
            variant="secondary"
            onClick={handleClearChat}
            icon="🗑️"
            colors={colors}
          >
            Clear History
          </Button>
        </div>
        
        <p style={styles.helpText}>
          The chat bubble allows you to interact with the AI assistant directly on n8n workflow pages.
        </p>
      </div>
    </div>
  )
}
