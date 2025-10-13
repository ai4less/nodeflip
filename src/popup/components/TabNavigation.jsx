import { useState } from 'preact/hooks'

export const TabNavigation = ({ activeTab, onTabChange, colors }) => {
  const [hoveredTab, setHoveredTab] = useState(null)
  
  const getTabStyle = (tabName) => {
    const isActive = activeTab === tabName
    const isHovered = hoveredTab === tabName
    
    return {
      flex: 1,
      padding: '12px 20px',
      border: 'none',
      borderRadius: '12px',
      background: isActive 
        ? colors.gradientPrimary 
        : isHovered 
          ? 'rgba(151, 51, 238, 0.1)' 
          : 'transparent',
      color: isActive ? colors.white : colors.purple300,
      cursor: 'pointer',
      transition: 'all 300ms ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: isActive ? '600' : '400',
      boxShadow: isActive ? '0 10px 40px rgba(151, 51, 238, 0.25)' : 'none',
      transform: isHovered && !isActive ? 'translateY(-2px)' : 'translateY(0)',
      outline: 'none',
    }
  }
  
  const iconStyle = (tabName) => ({
    fontSize: '18px',
    transition: 'transform 300ms ease',
    transform: hoveredTab === tabName ? 'rotate(15deg) scale(1.1)' : 'rotate(0) scale(1)',
  })
  
  const styles = {
    navigation: {
      display: 'flex',
      gap: '8px',
      padding: '16px 20px',
      background: 'rgba(26, 11, 46, 0.4)',
    }
  }
  
  return (
    <nav style={styles.navigation}>
      <button
        style={getTabStyle('settings')}
        onClick={() => onTabChange('settings')}
        onMouseEnter={() => setHoveredTab('settings')}
        onMouseLeave={() => setHoveredTab(null)}
      >
        <span style={iconStyle('settings')}>⚙️</span>
        <span>Settings</span>
      </button>
      <button
        style={getTabStyle('info')}
        onClick={() => onTabChange('info')}
        onMouseEnter={() => setHoveredTab('info')}
        onMouseLeave={() => setHoveredTab(null)}
      >
        <span style={iconStyle('info')}>ℹ️</span>
        <span>Info</span>
      </button>
    </nav>
  )
}
