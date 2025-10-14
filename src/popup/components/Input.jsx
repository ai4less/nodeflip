export const Input = ({ label, type = 'text', value, onChange, onReset, colors }) => {
  const styles = {
    wrapper: {
      marginBottom: '14px',
    },
    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: 500,
      marginBottom: '6px',
      color: colors.textSecondary,
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      padding: '8px 10px',
      fontSize: '13px',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      color: colors.text,
      outline: 'none',
      transition: 'border-color 0.15s',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    },
    resetButton: {
      background: 'transparent',
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      padding: '8px 10px',
      cursor: 'pointer',
      fontSize: '12px',
      color: colors.textSecondary,
      transition: 'all 0.15s',
      flexShrink: 0,
    }
  }

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrapper}>
        <input
          type={type}
          style={styles.input}
          value={value}
          onInput={(e) => onChange(e.target.value)}
          onFocus={event => {
            event.currentTarget.style.borderColor = colors.primary
            event.currentTarget.style.boxShadow = `0 0 0 3px rgba(124, 58, 237, 0.08)`
          }}
          onBlur={event => {
            event.currentTarget.style.borderColor = colors.border
            event.currentTarget.style.boxShadow = 'none'
          }}
        />
        {onReset && (
          <button
            type="button"
            style={styles.resetButton}
            onClick={onReset}
            onMouseEnter={event => {
              event.currentTarget.style.background = colors.bgSecondary
              event.currentTarget.style.borderColor = colors.borderHover
            }}
            onMouseLeave={event => {
              event.currentTarget.style.background = 'transparent'
              event.currentTarget.style.borderColor = colors.border
            }}
            title="Reset to default URL"
          >
            ↺
          </button>
        )}
      </div>
    </div>
  )
}
