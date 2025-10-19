/**
 * Custom Input Component
 * Consistent styled text input with textarea support
 */

import { useState } from 'preact/hooks'
import '../styles/customInput.css'

export function CustomInput({ field, type = 'text' }) {
  const isTextarea = type === 'textarea' || field.type === 'textarea'
  const [value, setValue] = useState(field.default || '')
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  const commonProps = {
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
