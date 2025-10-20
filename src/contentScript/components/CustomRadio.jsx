/**
 * Custom Radio Component
 * Modern radio button group with consistent styling
 */

import { useState } from 'preact/hooks'
import '../styles/customRadio.css'

export function CustomRadio({ field, onChange }) {
  const [selectedValue, setSelectedValue] = useState(field.default || (field.options?.[0]?.value || ''))

  const options = field.options || []

  const handleChange = (optionValue) => {
    setSelectedValue(optionValue)
    if (onChange) {
      onChange({ target: { name: field.name, value: optionValue } })
    }
  }

  return (
    <div className="custom-radio-group" data-field={field.name}>
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
