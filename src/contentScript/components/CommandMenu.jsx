export const CommandMenu = ({
  commands,
  selectedIndex,
  onSelect,
  onHover,
  menuRef,
}) => {
  if (!commands || commands.length === 0) return null

  const styles = {
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
    selectedItem: {
      background: 'rgba(151, 51, 238, 0.1)',
      borderLeft: '3px solid #9733EE',
    },
    commandName: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 600,
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
  }

  return (
    <div ref={menuRef} style={styles.commandMenu}>
      {commands.map((command, index) => (
        <div
          key={command.name}
          style={{
            ...styles.commandItem,
            ...(index === selectedIndex ? styles.selectedItem : {}),
            ...(index === commands.length - 1 ? { borderBottom: 'none' } : {}),
          }}
          onClick={() => onSelect(command)}
          onMouseEnter={() => onHover(index)}
        >
          <div style={styles.commandName}>
            <span style={styles.commandIcon}>{command.icon}</span>
            <span>/{command.name}</span>
          </div>
          <div style={styles.commandDesc}>{command.description}</div>
        </div>
      ))}
    </div>
  )
}
