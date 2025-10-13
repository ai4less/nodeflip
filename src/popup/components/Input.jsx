import { useState } from 'preact/hooks'

export const Input = ({ label, type = 'text', value, onChange, icon, colors }) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value && value.length > 0
  
  const styles = {
    wrapper: {
      position: 'relative',
      marginBottom: '24px',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      paddingRight: icon ? '45px' : '16px',
      background: 'rgba(78, 84, 200, 0.1)',
      border: `2px solid ${isFocused ? colors.purple500 : 'rgba(151, 51, 238, 0.2)'}`,
      borderRadius: '12px',
      color: colors.white,
      fontSize: '14px',
      transition: 'all 300ms ease',
      outline: 'none',
      boxShadow: isFocused ? '0 0 20px rgba(151, 51, 238, 0.4)' : 'none',
      transform: isFocused ? 'scale(1.01)' : 'scale(1)',
      boxSizing: 'border-box',
    },
    label: {
      position: 'absolute',
      left: '16px',
      top: isFocused || hasValue ? '-10px' : '14px',
      color: isFocused ? colors.purple400 : colors.purple300,
      fontSize: isFocused || hasValue ? '12px' : '14px',
      fontWeight: isFocused || hasValue ? '500' : '400',
      pointerEvents: 'none',
      transition: 'all 300ms ease',
      background: colors.purple900,
      padding: '0 4px',
    },
    icon: {
      position: 'absolute',
      right: '16px',
      top: '14px',
      color: isFocused ? colors.purple500 : colors.purple400,
      fontSize: '18px',
      pointerEvents: 'none',
      transition: 'all 300ms ease',
      transform: isFocused ? 'scale(1.1)' : 'scale(1)',
    }
  }
  
  return (
    <div style={styles.wrapper}>
      <input
        type={type}
        style={styles.input}
        value={value}
        onInput={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <label style={styles.label}>{label}</label>
      {icon && <span style={styles.icon}>{icon}</span>}
    </div>
  )
}
