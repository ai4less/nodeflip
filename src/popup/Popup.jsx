import { useState, useEffect } from 'preact/hooks'
import { Header } from './components/Header'
import { SettingsTab } from './components/SettingsTab'

// Color palette - Minimalist
const COLORS = {
  // Neutrals
  bg: '#FFFFFF',
  bgSecondary: '#F8F9FA',
  border: '#E1E4E8',
  borderHover: '#D0D7DE',
  
  // Text
  text: '#24292F',
  textSecondary: '#57606A',
  textTertiary: '#6E7781',
  
  // Accent
  primary: '#7C3AED',
  primaryHover: '#6D28D9',
  
  // Status
  success: '#2DA44E',
  error: '#CF222E',
  warning: '#BF8700',
  
  // Status badges
  connected: '#2DA44E',
  disconnected: '#8C959F',
}

export const Popup = () => {
  const [backendUrl, setBackendUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [n8nStatus, setN8nStatus] = useState('disconnected')
  const [backendStatus, setBackendStatus] = useState('disconnected')
  
  // Load settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['backendUrl', 'apiKey'], (data) => {
      setBackendUrl(data.backendUrl || 'https://generator.ai4less.io')
      setApiKey(data.apiKey || '')
    })
  }, [])
  
  // Poll status every 3s
  useEffect(() => {
    const checkStatus = async () => {
      // Check n8n status
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.url?.includes('/workflow/')) {
          setN8nStatus('connected')
        } else {
          setN8nStatus('disconnected')
        }
      } catch (error) {
        setN8nStatus('disconnected')
      }
      
      // Check backend status
      if (backendUrl && apiKey) {
        try {
          const response = await fetch(`${backendUrl}/api/v1/llm-chats/`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          })
          setBackendStatus(response.ok ? 'connected' : 'disconnected')
        } catch {
          setBackendStatus('disconnected')
        }
      } else {
        setBackendStatus('disconnected')
      }
    }
    
    checkStatus()
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [backendUrl, apiKey])
  
  const handleSaveSettings = async () => {
    await chrome.storage.sync.set({ 
      backendUrl: backendUrl.trim(), 
      apiKey: apiKey.trim() 
    })
  }
  
  const styles = {
    container: {
      width: '400px',
      minHeight: '480px',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  }
  
  return (
    <div style={styles.container}>
      <Header 
        backendStatus={backendStatus}
        colors={COLORS}
      />
      
      <SettingsTab
        backendUrl={backendUrl}
        apiKey={apiKey}
        onBackendUrlChange={setBackendUrl}
        onApiKeyChange={setApiKey}
        onSave={handleSaveSettings}
        colors={COLORS}
      />
    </div>
  )
}

export default Popup
