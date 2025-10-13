/**
 * Chat Input Component
 * Input field for sending messages
 */

import { useState, useRef, useEffect } from 'preact/hooks'

export const ChatInput = ({ onSend, disabled = false }) => {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [value])

  const handleSubmit = () => {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
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
