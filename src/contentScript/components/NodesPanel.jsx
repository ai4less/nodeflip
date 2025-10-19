/**
 * NodesPanel Component
 * Displays available custom nodes in a collapsible panel
 */

import { useState, useEffect } from 'preact/hooks'
import { AIBuilderAPI } from '../api'

export const NodesPanel = ({ onNodeSelect, isDisabled }) => {
  const [nodes, setNodes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCustomNodes()
  }, [])

  const fetchCustomNodes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const api = new AIBuilderAPI()
      const fetchedNodes = await api.getCustomNodes()
      setNodes(fetchedNodes)
    } catch (err) {
      console.error('[NodesPanel] Failed to fetch custom nodes:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const styles = {
    container: {
      borderTop: '1px solid var(--color-border, #e0e0e0)',
      backgroundColor: 'var(--color-background-light, #f5f5f5)',
    },
    header: {
      padding: '12px 16px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--color-text-base, #333)',
      transition: 'background 0.15s',
    },
    nodesList: {
      maxHeight: '200px',
      overflowY: 'auto',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    nodeCard: {
      padding: '8px 12px',
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      transition: 'all 0.15s',
    },
    nodeName: {
      fontSize: '13px',
      fontWeight: 500,
      color: '#333',
      marginBottom: '4px',
    },
    nodeDescription: {
      fontSize: '12px',
      color: '#666',
      lineHeight: 1.4,
    },
    loading: {
      padding: '12px',
      textAlign: 'center',
      fontSize: '12px',
      color: '#999',
    },
    error: {
      padding: '12px',
      fontSize: '12px',
      color: '#d73a49',
    },
  }

  return (
    <div style={styles.container}>
      <div
        style={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>📦 Custom Nodes {nodes.length > 0 && `(${nodes.length})`}</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <>
          {isLoading && <div style={styles.loading}>Loading nodes...</div>}
          {error && <div style={styles.error}>Failed to load: {error}</div>}
          {!isLoading && !error && nodes.length === 0 && (
            <div style={styles.loading}>No custom nodes available</div>
          )}
          {!isLoading && !error && nodes.length > 0 && (
            <div style={styles.nodesList}>
              {nodes.map((node) => (
                <div
                  key={node.id}
                  style={styles.nodeCard}
                  onClick={() => !isDisabled && onNodeSelect(node)}
                  onMouseEnter={(e) => {
                    if (!isDisabled) {
                      e.currentTarget.style.borderColor = '#7C3AED'
                      e.currentTarget.style.backgroundColor = '#f9f5ff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0'
                    e.currentTarget.style.backgroundColor = '#fff'
                  }}
                >
                  <div style={styles.nodeName}>{node.name}</div>
                  {node.description && <div style={styles.nodeDescription}>{node.description}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
