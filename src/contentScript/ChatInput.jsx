
/**
 * Chat Input Component
 * Input field for sending messages with command support
 */

import { useState, useRef, useEffect, useCallback } from 'preact/hooks'
import { useCommandPalette } from './hooks/useCommandPalette'
import { CommandMenu } from './components/CommandMenu'

// Available commands
const COMMANDS = [
  {
    name: 'sync-global-nodes',
    description: 'Sync all standard n8n nodes to database (admin only)',
    icon: '🌐',
  },
  {
    name: 'sync-custom-nodes',
    description: 'Sync your custom/community nodes to database',
    icon: '🔄',
  },
]

export const ChatInput = ({ onSend, onCommand, disabled = false }) => {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const textareaRef = useRef(null)
  const commandMenuRef = useRef(null)

  const {
    isMenuOpen,
    filteredCommands,
    selectedIndex,
    handleValueChange,
    handleKeyDown: handlePaletteKeyDown,
    selectCommand,
    highlightCommand,
    closeMenu,
  } = useCommandPalette(COMMANDS)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [value])

  const executeCommand = useCallback((command) => {
    if (!command || !onCommand) return
    onCommand(command.name)
    setValue('')
    closeMenu()
  }, [closeMenu, onCommand])

  const autocompleteCommand = useCallback((command) => {
    if (!command) return
    setValue(`/${command.name}`)
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (textarea) {
        const end = textarea.value.length
        textarea.selectionStart = end
        textarea.selectionEnd = end
      }
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!value.trim() || disabled) return

    if (value.startsWith('/')) {
      const commandName = value.slice(1).split(' ')[0]
      const command = COMMANDS.find((item) => item.name === commandName)
      if (command) {
        executeCommand(command)
        return
      }
    }

    onSend(value.trim())
    setValue('')
    closeMenu()
  }, [value, disabled, executeCommand, onSend, closeMenu])

  const handleInput = (event) => {
    const nextValue = event.target.value
    setValue(nextValue)
    handleValueChange(nextValue)
  }

  const handleKeyDown = (event) => {
    const handled = handlePaletteKeyDown(event, {
      onSubmit: handleSubmit,
      onExecuteCommand: executeCommand,
      onAutocomplete: autocompleteCommand,
    })

    if (handled) {
      return
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        commandMenuRef.current &&
        !commandMenuRef.current.contains(event.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target)
      ) {
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeMenu])

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
      lineHeight: 1.5,
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
    },
  }

  return (
    <div style={styles.container}>
      {isMenuOpen && filteredCommands.length > 0 && (
        <CommandMenu
          commands={filteredCommands}
          selectedIndex={selectedIndex}
          onSelect={(command) => selectCommand(command, executeCommand)}
          onHover={highlightCommand}
          menuRef={commandMenuRef}
        />
      )}

      <textarea
        ref={textareaRef}
        style={{
          ...styles.textarea,
          ...(isFocused ? styles.textareaFocus : {}),
        }}
        placeholder="Ask me to build your workflow..."
        value={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        rows={1}
      />
      <button
        style={{
          ...styles.button,
          ...(isHovered && !disabled && value.trim() ? styles.buttonHover : {}),
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
