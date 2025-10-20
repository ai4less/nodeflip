/**
 * Custom Input Component
 * Consistent styled text input with textarea support
 */

import { useState, useEffect, useRef } from 'preact/hooks'
import '../styles/customInput.css'

export function CustomInput({ field, type = 'text' }) {
  const isTextarea = type === 'textarea' || field.type === 'textarea'
  const [value, setValue] = useState(field.default || '')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // Listen for external value changes (from loadExistingValues)
  useEffect(() => {
    if (!inputRef.current) return

    const handleExternalChange = (e) => {
      // Check if this was an external change (not from user input)
      if (!isFocused && e.target.value !== value) {
        console.log(`[CustomInput] External value change detected for ${field.name}:`, e.target.value)
        setValue(e.target.value)
      }
    }

    const element = inputRef.current
    element.addEventListener('change', handleExternalChange)

    // Check if input already has a value on mount (from loadExistingValues)
    if (element.value && element.value !== value) {
      console.log(`[CustomInput] Initial value detected for ${field.name}:`, element.value)
      setValue(element.value)
    }

    return () => {
      element.removeEventListener('change', handleExternalChange)
    }
  }, [field.name, isFocused, value])

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  const commonProps = {
    ref: inputRef,
    name: field.name,
    value: value,
    placeholder: field.placeholder || '',
    required: field.required || false,
    onInput: handleChange,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    className: `custom-input ${isFocused ? 'focused' : ''}`,
  }

  if (isTextarea) {
    return (
      <textarea
        {...commonProps}
        rows={field.rows || 3}
      />
    )
  }

  if (type === 'number' || field.type === 'number') {
    return (
      <input
        {...commonProps}
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
      />
    )
  }

  return (
    <input
      {...commonProps}
      type="text"
      pattern={field.pattern}
    />
  )
}
