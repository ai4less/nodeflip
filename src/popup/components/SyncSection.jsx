import { useState, useEffect } from 'preact/hooks'
import { Button } from './Button'

export const SyncSection = ({ colors }) => {
  const [customNodeCount, setCustomNodeCount] = useState(0)
  const [globalNodeCount, setGlobalNodeCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [syncStatus, setSyncStatus] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  
  useEffect(() => {
    loadCatalogStatus()
  }, [])
  
  const loadCatalogStatus = async () => {
    const data = await chrome.storage.sync.get([
      'backendUrl',
      'apiKey',
      'customNodeCount',
      'customNodeLastSynced'
    ])
    
    setCustomNodeCount(data.customNodeCount || 0)
    setLastSyncTime(data.customNodeLastSynced || null)
    
    // Check global node count and admin status
    if (data.backendUrl && data.apiKey) {
      try {
        const response = await fetch(`${data.backendUrl}/api/v1/node-catalog/status`, {
          headers: { 'Authorization': `Bearer ${data.apiKey}` }
        })
        if (response.ok) {
          const status = await response.json()
          setGlobalNodeCount(status.global_nodes || 0)
          setIsAdmin(status.is_admin === true)
        }
      } catch (error) {
        console.error('Failed to fetch catalog status:', error)
      }
    }
  }
  
  const handleCustomSync = async () => {
    setIsSyncing(true)
    setSyncStatus('Syncing custom nodes...')
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab || !tab.url?.includes('/workflow/')) {
        setSyncStatus('❌ Please navigate to an n8n workflow page first')
        setIsSyncing(false)
        return
      }
      
      chrome.tabs.sendMessage(tab.id, { type: 'nodeFlipSyncCustomNodes' }, async (response) => {
        setIsSyncing(false)
        if (chrome.runtime.lastError) {
          setSyncStatus('❌ ' + chrome.runtime.lastError.message)
        } else if (response?.success) {
          setSyncStatus('✓ ' + response.message)
          await loadCatalogStatus()
        } else {
          setSyncStatus('❌ ' + (response?.message || 'Unknown error'))
        }
        setTimeout(() => setSyncStatus(''), 5000)
      })
    } catch (error) {
      setIsSyncing(false)
      setSyncStatus('❌ Failed: ' + error.message)
      setTimeout(() => setSyncStatus(''), 5000)
    }
  }
  
  const handleGlobalSync = async () => {
    setIsSyncing(true)
    setSyncStatus('⏳ Syncing 1162 standard nodes... This may take 2-3 minutes.')
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab || !tab.url?.includes('/workflow/')) {
        setSyncStatus('❌ Please navigate to an n8n workflow page first')
        setIsSyncing(false)
        return
      }
      
      chrome.tabs.sendMessage(tab.id, { type: 'nodeFlipSyncGlobalNodes' }, async (response) => {
        setIsSyncing(false)
        if (chrome.runtime.lastError) {
          setSyncStatus('❌ ' + chrome.runtime.lastError.message)
        } else if (response?.success) {
          setSyncStatus('✓ ' + response.message)
          await loadCatalogStatus()
        } else {
          setSyncStatus('❌ ' + (response?.message || 'Unknown error'))
        }
        setTimeout(() => setSyncStatus(''), 5000)
      })
    } catch (error) {
      setIsSyncing(false)
      setSyncStatus('❌ Failed: ' + error.message)
      setTimeout(() => setSyncStatus(''), 5000)
    }
  }
  
  const formatSyncTime = (timestamp) => {
    if (!timestamp) return 'Never'
    
    const syncDate = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now - syncDate) / 1000 / 60)
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} min ago`
    if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    }
    return syncDate.toLocaleDateString()
  }
  
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
      fontWeight: '600',
      marginBottom: '16px',
      marginTop: '0',
      background: colors.gradientPrimary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px',
    },
    statCard: {
      background: 'rgba(78, 84, 200, 0.1)',
      border: '1px solid rgba(151, 51, 238, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      background: colors.gradientAccent,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '4px',
    },
    statLabel: {
      fontSize: '12px',
      color: colors.purple300,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    syncInfo: {
      fontSize: '12px',
      color: colors.purple300,
      marginBottom: '12px',
      textAlign: 'center',
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      marginBottom: syncStatus ? '12px' : '0',
    },
    status: {
      padding: '10px',
      borderRadius: '8px',
      background: syncStatus.includes('✓') 
        ? 'rgba(124, 58, 237, 0.2)' 
        : 'rgba(236, 72, 153, 0.2)',
      border: `1px solid ${syncStatus.includes('✓') ? colors.success : colors.error}`,
      fontSize: '13px',
      color: colors.white,
      textAlign: 'center',
    }
  }
  
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Node Catalog</h3>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{globalNodeCount}</div>
          <div style={styles.statLabel}>Global Nodes</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{customNodeCount}</div>
          <div style={styles.statLabel}>Custom Nodes</div>
        </div>
      </div>
      
      <div style={styles.syncInfo}>
        Last synced: {formatSyncTime(lastSyncTime)}
      </div>
      
      <div style={styles.buttonGroup}>
        <Button 
          onClick={handleCustomSync} 
          loading={isSyncing}
          disabled={isSyncing}
          icon="🔄"
          colors={colors}
          variant="secondary"
        >
          Sync Custom
        </Button>
        {isAdmin && (
          <Button 
            onClick={handleGlobalSync} 
            loading={isSyncing}
            disabled={isSyncing}
            icon="🌐"
            colors={colors}
            variant="secondary"
          >
            Sync Global
          </Button>
        )}
      </div>
      
      {syncStatus && (
        <div style={styles.status}>{syncStatus}</div>
      )}
    </div>
  )
}
