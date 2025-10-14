import { useState, useCallback } from 'preact/hooks'

export const useCommandPalette = (commands) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [filteredCommands, setFilteredCommands] = useState(commands)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const openMenu = useCallback(() => {
    setIsMenuOpen(true)
  }, [])

  const handleValueChange = useCallback((value) => {
    if (value.startsWith('/')) {
      const query = value.slice(1).toLowerCase()
      const filtered = commands.filter((command) =>
        command.name.toLowerCase().includes(query) ||
        command.description.toLowerCase().includes(query),
      )
      setFilteredCommands(filtered)
      setSelectedIndex(0)
      openMenu()
    } else {
      closeMenu()
    }
  }, [commands, closeMenu, openMenu])

  const handleKeyDown = useCallback((event, helpers) => {
    const { onSubmit, onExecuteCommand, onAutocomplete } = helpers

    if (isMenuOpen && filteredCommands.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
        return true
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        return true
      }

      if (event.key === 'Tab') {
        event.preventDefault()
        const command = filteredCommands[selectedIndex]
        if (command) {
          onAutocomplete(command)
        }
        closeMenu()
        return true
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return true
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        const command = filteredCommands[selectedIndex]
        if (command) {
          onExecuteCommand(command)
        }
        closeMenu()
        return true
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
      return true
    }

    return false
  }, [closeMenu, filteredCommands, isMenuOpen, selectedIndex])

  const selectCommand = useCallback((command, onExecuteCommand) => {
    if (!command) return
    onExecuteCommand(command)
    closeMenu()
  }, [closeMenu])

  const highlightCommand = useCallback((index) => {
    setSelectedIndex(index)
  }, [])

  return {
    isMenuOpen,
    filteredCommands,
    selectedIndex,
    handleValueChange,
    handleKeyDown,
    selectCommand,
    highlightCommand,
    closeMenu,
  }
}
