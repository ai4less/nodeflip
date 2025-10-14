import { useEffect } from 'preact/hooks'

export const useSidebarToggle = (onToggle) => {
  useEffect(() => {
    const handleToggle = () => {
      onToggle()
    }

    window.addEventListener('nodeflip-toggle-sidebar', handleToggle)
    return () => window.removeEventListener('nodeflip-toggle-sidebar', handleToggle)
  }, [onToggle])
}
