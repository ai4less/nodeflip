import { useState, useEffect } from 'preact/hooks'
import { Header } from './components/Header'
import { TabNavigation } from './components/TabNavigation'
import { SettingsTab } from './components/SettingsTab'
import { InfoTab } from './components/InfoTab'

// Color palette
const COLORS = {
  // Purple shades
  purple900: '#1a0b2e',
  purple800: '#2d1b4e',
  purple700: '#4E54C8',
  purple600: '#673AB7',
  purple500: '#9733EE',
  purple400: '#B57FFF',
  purple300: '#C8A2F2',
  purple200: '#E5D4FF',
  purple100: '#F5F0FF',
  
  // Accents
  accentPink: '#DA22FF',
  accentBlue: '#8F94FB',
  success: '#7C3AED',
  error: '#EC4899',
  
  // Neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #9733EE 0%, #DA22FF 100%)',
  gradientAccent: 'linear-gradient(135deg, #4E54C8 0%, #8F94FB 100%)',
  gradientDark: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 100%)',
}

export const Popup = () => {
  const [activeTab, setActiveTab] = useState('settings')
  const [backendUrl, setBackendUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [n8nStatus, setN8nStatus] = useState('disconnected')
  const [backendStatus, setBackendStatus] = useState('disconnected')
  
  // Load settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['backendUrl', 'apiKey'], (data) => {
      setBackendUrl(data.backendUrl || '')
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
      width: '450px',
      minHeight: '620px',
      background: COLORS.gradientDark,
      color: COLORS.white,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
    },
    content: {
      animation: 'fadeIn 400ms ease',
    }
  }
  
  return (
    <div style={styles.container}>
      <Header 
        n8nStatus={n8nStatus} 
        backendStatus={backendStatus}
        colors={COLORS}
      />
      
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        colors={COLORS}
      />
      
      <div style={styles.content}>
        {activeTab === 'settings' && (
          <SettingsTab
            backendUrl={backendUrl}
            apiKey={apiKey}
            onBackendUrlChange={setBackendUrl}
            onApiKeyChange={setApiKey}
            onSave={handleSaveSettings}
            colors={COLORS}
          />
        )}
        {activeTab === 'info' && (
          <InfoTab colors={COLORS} />
        )}
      </div>
    </div>
  )
}

export default Popup
