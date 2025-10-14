/**
 * Chat Input Component
 * Input field for sending messages with command support
 */

import { useState, useRef, useEffect } from 'preact/hooks'

// Available commands
const COMMANDS = [
  {
    name: 'sync-global-nodes',
    description: 'Sync all standard n8n nodes to database (admin only)',
    icon: '🌐'
  },
  {
    name: 'sync-custom-nodes',
    description: 'Sync your custom/community nodes to database',
    icon: '🔄'
  }
]

export const ChatInput = ({ onSend, onCommand, disabled = false }) => {
  const [value, setValue] = useState('')
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const textareaRef = useRef(null)
  const commandMenuRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [value])

  // Detect command input and filter commands
  useEffect(() => {
    if (value.startsWith('/')) {
      const query = value.slice(1).toLowerCase()
      const filtered = COMMANDS.filter(cmd => 
        cmd.name.toLowerCase().includes(query) || 
        cmd.description.toLowerCase().includes(query)
      )
      setFilteredCommands(filtered)
      setShowCommandMenu(true)
      setSelectedIndex(0)
    } else {
      setShowCommandMenu(false)
    }
  }, [value])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (commandMenuRef.current && !commandMenuRef.current.contains(e.target) &&
          textareaRef.current && !textareaRef.current.contains(e.target)) {
        setShowCommandMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = () => {
    if (!value.trim() || disabled) return
    
    // Check if it's a command
    if (value.startsWith('/')) {
      const cmdName = value.slice(1).split(' ')[0]
      const cmd = COMMANDS.find(c => c.name === cmdName)
      if (cmd && onCommand) {
        onCommand(cmd.name)
        setValue('')
        setShowCommandMenu(false)
        return
      }
    }
    
    // Regular message
    onSend(value.trim())
    setValue('')
  }

  const selectCommand = (cmd) => {
    if (onCommand) {
      onCommand(cmd.name)
      setValue('')
      setShowCommandMenu(false)
    }
  }

  const handleKeyDown = (e) => {
    // Handle command menu navigation
    if (showCommandMenu && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const cmd = filteredCommands[selectedIndex]
        setValue(`/${cmd.name}`)
        setShowCommandMenu(false)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowCommandMenu(false)
        return
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // If command menu is open, select the highlighted command
      if (showCommandMenu && filteredCommands.length > 0) {
        selectCommand(filteredCommands[selectedIndex])
      } else {
        handleSubmit()
      }
    }
  }

  const styles = {
    container: {
      padding: '12px 16px',
      borderTop: '1px solid var(--color-foreground-base, #e0e0e0)',
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-end',
      background: 'var(--color-background-xlight, #ffffff)',
      minHeight: '72px',
      position: 'relative',
    },
    commandMenu: {
      position: 'absolute',
      bottom: '100%',
      left: '16px',
      right: '68px',
      marginBottom: '8px',
      background: 'var(--color-background-xlight, #ffffff)',
      border: '1px solid var(--color-foreground-base, #e0e0e0)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 1000,
    },
    commandItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      borderBottom: '1px solid var(--color-foreground-xlight, #f0f0f0)',
    },
    commandItemHover: {
      background: 'var(--color-background-light, #f5f5f5)',
    },
    commandItemSelected: {
      background: 'rgba(151, 51, 238, 0.1)',
      borderLeft: '3px solid #9733EE',
    },
    commandName: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--color-text-dark, #333)',
      marginBottom: '4px',
    },
    commandIcon: {
      fontSize: '16px',
    },
    commandDesc: {
      fontSize: '12px',
      color: 'var(--color-text-base, #666)',
      paddingLeft: '24px',
    },
    textarea: {
      flex: 1,
      padding: '10px 14px',
      border: '1px solid var(--color-foreground-base, #ddd)',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'none',
      outline: 'none',
      minHeight: '42px',
      maxHeight: '120px',
      lineHeight: '1.5',
      color: 'var(--color-text-dark, #333)',
      background: 'var(--color-background-xlight, #fff)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    textareaFocus: {
      borderColor: '#9733EE',
      boxShadow: '0 0 0 2px rgba(151, 51, 238, 0.1)',
    },
    button: {
      width: '42px',
      height: '42px',
      borderRadius: '10px',
      border: 'none',
      background: disabled || !value.trim()
        ? 'var(--color-foreground-base, #ccc)'
        : 'linear-gradient(135deg, #9733EE 0%, #DA22FF 100%)',
      color: '#ffffff',
      cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'transform 0.2s, box-shadow 0.2s',
      opacity: disabled || !value.trim() ? 0.5 : 1,
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(151, 51, 238, 0.3)',
    }
  }

  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div style={styles.container}>
      {/* Command menu popover */}
      {showCommandMenu && filteredCommands.length > 0 && (
        <div ref={commandMenuRef} style={styles.commandMenu}>
          {filteredCommands.map((cmd, index) => (
            <div
              key={cmd.name}
              style={{
                ...styles.commandItem,
                ...(index === selectedIndex ? styles.commandItemSelected : {}),
                ...(index === filteredCommands.length - 1 ? {borderBottom: 'none'} : {})
              }}
              onClick={() => selectCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={styles.commandName}>
                <span style={styles.commandIcon}>{cmd.icon}</span>
                <span>/{cmd.name}</span>
              </div>
              <div style={styles.commandDesc}>{cmd.description}</div>
            </div>
          ))}
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        style={{
          ...styles.textarea,
          ...(isFocused ? styles.textareaFocus : {})
        }}
        placeholder="Ask me to build your workflow..."
        value={value}
        onInput={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        rows={1}
      />
      <button 
        style={{
          ...styles.button,
          ...(isHovered && !disabled && value.trim() ? styles.buttonHover : {})
        }}
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path 
            d="M5 12l7-7 7 7M12 19V5" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
