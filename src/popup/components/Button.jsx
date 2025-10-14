export const Button = ({ 
  children, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  onClick,
  icon,
  colors 
}) => {
  const isPrimary = variant === 'primary'
  
  const styles = {
    button: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '8px 14px',
      fontSize: '13px',
      fontWeight: 500,
      border: isPrimary ? 'none' : `1px solid ${colors.border}`,
      borderRadius: '6px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s',
      opacity: disabled ? 0.5 : 1,
      background: isPrimary 
        ? colors.primary
        : colors.bg,
      color: isPrimary ? '#FFFFFF' : colors.text,
      fontFamily: 'inherit',
    },
    spinner: {
      width: '12px',
      height: '12px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTopColor: '#FFFFFF',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }
  }

  return (
    <button
      style={styles.button}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={event => {
        if (!disabled) {
          event.currentTarget.style.background = isPrimary 
            ? colors.primaryHover
            : colors.bgSecondary
        }
      }}
      onMouseLeave={event => {
        if (!disabled) {
          event.currentTarget.style.background = isPrimary 
            ? colors.primary
            : colors.bg
        }
      }}
    >
      {loading && <span style={styles.spinner} />}
      {icon && !loading && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
