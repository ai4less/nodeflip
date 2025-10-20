/**
 * Custom Radio Component
 * Modern radio button group with consistent styling
 */

import { useState, useRef, useEffect } from 'preact/hooks'
import '../styles/customRadio.css'

export function CustomRadio({ field, onChange }) {
  const [selectedValue, setSelectedValue] = useState(field.default || (field.options?.[0]?.value || ''))
  const radioGroupRef = useRef(null)

  const options = field.options || []

  // Listen for external value changes (from loadExistingValues)
  useEffect(() => {
    if (!radioGroupRef.current) return

    const handleExternalChange = (e) => {
      // Find which radio button was changed externally
      if (e.target.type === 'radio' && e.target.value !== selectedValue) {
        console.log(`[CustomRadio] External value change detected for ${field.name}:`, e.target.value)
        setSelectedValue(e.target.value)
      }
    }

    const element = radioGroupRef.current
    element.addEventListener('change', handleExternalChange)

    // Check if any radio already has a value on mount (from loadExistingValues)
    const checkedRadio = element.querySelector(`input[name="${field.name}"]:checked`)
    if (checkedRadio && checkedRadio.value !== selectedValue) {
      console.log(`[CustomRadio] Initial value detected for ${field.name}:`, checkedRadio.value)
      setSelectedValue(checkedRadio.value)
    }

    return () => {
      element.removeEventListener('change', handleExternalChange)
    }
  }, [field.name, selectedValue])

  const handleChange = (optionValue) => {
    setSelectedValue(optionValue)
    if (onChange) {
      onChange({ target: { name: field.name, value: optionValue } })
    }
  }

  return (
    <div ref={radioGroupRef} className="custom-radio-group" data-field={field.name}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`custom-radio-option ${selectedValue === option.value ? 'selected' : ''}`}
        >
          <input
            type="radio"
            name={field.name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => handleChange(option.value)}
            className="custom-radio-input"
          />
          <span className="custom-radio-circle">
            <span className="custom-radio-dot"></span>
          </span>
          <span className="custom-radio-label">
            {option.label || option.value}
          </span>
          {option.description && (
            <span className="custom-radio-description">{option.description}</span>
          )}
        </label>
      ))}
    </div>
  )
}
