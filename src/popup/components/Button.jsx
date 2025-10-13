import { useState } from 'preact/hooks'

export const Button = ({ 
  children, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  onClick,
  icon,
  colors 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const baseStyles = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 300ms ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
  }
  
  const variantStyles = {
    primary: {
      background: colors.gradientPrimary,
      color: colors.white,
      boxShadow: isHovered && !disabled && !loading 
        ? '0 8px 25px rgba(151, 51, 238, 0.4)' 
        : '0 4px 15px rgba(151, 51, 238, 0.3)',
      transform: isHovered && !disabled && !loading 
        ? 'translateY(-2px)' 
        : 'translateY(0)',
    },
    secondary: {
      background: isHovered && !disabled 
        ? 'rgba(151, 51, 238, 0.1)' 
        : 'transparent',
      border: `2px solid ${colors.purple500}`,
      color: colors.purple400,
      transform: isHovered && !disabled ? 'scale(1.02)' : 'scale(1)',
    }
  }
  
  const spinnerStyles = {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: colors.white,
    borderRadius: '50%',
    animation: 'spin 800ms linear infinite',
  }
  
  const styles = {
    ...baseStyles,
    ...variantStyles[variant],
  }
  
  return (
    <button
      style={styles}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {loading && <span style={spinnerStyles} />}
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
