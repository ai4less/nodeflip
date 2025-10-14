import { useState, useEffect } from 'preact/hooks'

export const useResizableSidebar = ({
  initialWidth = 400,
  minWidth = 300,
  maxWidth = 800,
} = {}) => {
  const [width, setWidth] = useState(initialWidth)
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = (event) => {
    setIsResizing(true)
    event.preventDefault()
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (event) => {
      const nextWidth = window.innerWidth - event.clientX
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, nextWidth))
      setWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth])

  return {
    width,
    isResizing,
    handleMouseDown,
  }
}
