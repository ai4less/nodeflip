import { useState, useRef, useCallback, useEffect } from 'preact/hooks'

export const useStatusMessage = (defaultDuration = 3000) => {
  const [status, setStatus] = useState('')
  const timeoutRef = useRef(null)

  const clearStatus = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setStatus('')
  }, [])

  const showStatus = useCallback((message, duration = defaultDuration) => {
    clearStatus()
    setStatus(message)

    if (duration && duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setStatus('')
        timeoutRef.current = null
      }, duration)
    }
  }, [clearStatus, defaultDuration])

  useEffect(() => () => {
    clearStatus()
  }, [clearStatus])

  return {
    status,
    showStatus,
    clearStatus,
  }
}
