/**
 * Custom Select Component
 * Modern, searchable dropdown with keyboard navigation
 */

import { useState, useRef, useEffect } from 'preact/hooks'
import '../styles/customSelect.css'

export function CustomSelect({ field, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [selectedValue, setSelectedValue] = useState(field.default || (field.options?.[0]?.value || ''))
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)
  const hiddenInputRef = useRef(null)

  const options = field.options || []

  // Listen for external value changes (from loadExistingValues)
  useEffect(() => {
    if (!hiddenInputRef.current) return

    const handleExternalChange = (e) => {
      // Only update if the value is different
      if (e.target.value !== selectedValue) {
        console.log(`[CustomSelect] External value change detected for ${field.name}:`, e.target.value)
        setSelectedValue(e.target.value)
      }
    }

    const element = hiddenInputRef.current
    element.addEventListener('change', handleExternalChange)

    // Check if input already has a value on mount (from loadExistingValues)
    if (element.value && element.value !== selectedValue) {
      console.log(`[CustomSelect] Initial value detected for ${field.name}:`, element.value)
      setSelectedValue(element.value)
    }

    return () => {
      element.removeEventListener('change', handleExternalChange)
    }
  }, [field.name, selectedValue])
  
  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter(opt =>
        (opt.label || opt.value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // Get current selected option
  const selectedOption = options.find(opt => opt.value === selectedValue)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 10)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
        break
    }
  }

  const selectOption = (option) => {
    setSelectedValue(option.value)
    onChange({ target: { name: field.name, value: option.value } })
    setIsOpen(false)
    setSearchQuery('')
    setHighlightedIndex(-1)
  }

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && isOpen) {
      const highlightedElement = containerRef.current?.querySelector(
        `[data-index="${highlightedIndex}"]`
      )
      highlightedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex, isOpen])

  return (
    <div
      ref={containerRef}
      className="custom-select"
      data-field={field.name}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for form synchronization */}
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={field.name}
        value={selectedValue}
      />

      {/* Select trigger button */}
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-value">
          {selectedOption ? (selectedOption.label || selectedOption.value) : field.placeholder || 'Select...'}
        </span>
        <svg
          className="custom-select-arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <path fill="currentColor" d="M6 8L2 4h8z" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="custom-select-dropdown">
          {/* Search input */}
          {options.length > 5 && (
            <div className="custom-select-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onInput={(e) => {
                  setSearchQuery(e.target.value)
                  setHighlightedIndex(0)
                }}
                placeholder="Search..."
                className="custom-select-search-input"
              />
            </div>
          )}

          {/* Options list */}
          <div className="custom-select-options" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="custom-select-option empty">No options found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  data-index={index}
                  className={`custom-select-option ${
                    option.value === selectedValue ? 'selected' : ''
                  } ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => selectOption(option)}
                  role="option"
                  aria-selected={option.value === selectedValue}
                >
                  {option.label || option.value}
                  {option.value === selectedValue && (
                    <svg
                      className="custom-select-check"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
