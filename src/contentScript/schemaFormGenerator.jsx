/**
 * Schema Form Generator
 * Generates Property Inspector UI from custom node input schema
 */

import { logger } from '@src/utils/logger'
import { render } from 'preact'
import { CustomSelect } from './components/CustomSelect'
import { CustomInput } from './components/CustomInput'
import { CustomRadio } from './components/CustomRadio'

/**
 * Generate Property Inspector form from schema
 * @param {Object} schema - Input schema with fields array
 * @returns {HTMLElement} Form container
 */
export function generatePropertyInspectorForm(schema) {
  logger.log('[SchemaForm] Generating form from schema:', schema)

  if (!schema || !schema.fields || !Array.isArray(schema.fields)) {
    logger.warn('[SchemaForm] Invalid schema format')
    return createEmptyForm()
  }

  const container = document.createElement('div')
  container.className = 'ai4less-property-inspector'
  container.dataset.ai4lessForm = 'true'

  // Add INPUT SETTINGS header
  const header = document.createElement('div')
  header.className = 'property-section-header'
  header.textContent = 'INPUT SETTINGS'
  container.appendChild(header)

  const separator = document.createElement('div')
  separator.className = 'property-separator'
  container.appendChild(separator)

  // Generate fields
  schema.fields.forEach((field) => {
    const fieldElement = generateField(field)
    if (fieldElement) {
      container.appendChild(fieldElement)
    }
  })

  logger.log(`[SchemaForm] Generated ${schema.fields.length} fields`)
  return container
}

/**
 * Generate a single form field based on type
 */
function generateField(field) {
  const wrapper = document.createElement('div')
  wrapper.className = 'property-field'
  wrapper.dataset.fieldName = field.name
  wrapper.dataset.fieldType = field.type

  // Field label row
  const labelRow = document.createElement('div')
  labelRow.className = 'property-field-label'

  const label = document.createElement('label')
  label.className = 'property-label'
  label.innerHTML = `
    ${field.icon ? `<span class="property-icon">${field.icon}</span>` : ''}
    <span class="property-label-text">${field.label || field.name}</span>
    ${field.required ? '<span class="property-required">*</span>' : ''}
  `
  labelRow.appendChild(label)

  wrapper.appendChild(labelRow)

  // Field description (if present)
  if (field.description) {
    const desc = document.createElement('div')
    desc.className = 'property-description'
    desc.textContent = field.description
    wrapper.appendChild(desc)
  }

  // Field input
  const inputElement = createInput(field)
  if (inputElement) {
    wrapper.appendChild(inputElement)
  }

  // Expression hint (if allowed)
  if (field.allow_expressions) {
    const hint = document.createElement('div')
    hint.className = 'property-hint'
    hint.innerHTML = '💡 You can use <code>{{ $json.fieldName }}</code>'
    wrapper.appendChild(hint)
  }

  return wrapper
}

/**
 * Create input element based on field type
 */
function createInput(field) {
  switch (field.type) {
    case 'string':
      return createTextInput(field)
    case 'number':
      return createNumberInput(field)
    case 'textarea':
      return createTextArea(field)
    case 'boolean':
      return createToggle(field)
    case 'select':
      return createSelect(field)
    case 'radio':
      return createRadioGroup(field)
    case 'slider':
      return createSlider(field)
    default:
      logger.warn(`[SchemaForm] Unknown field type: ${field.type}`)
      return createTextInput(field)
  }
}

/**
 * Create text input (using Preact CustomInput component)
 */
function createTextInput(field) {
  const container = document.createElement('div')
  container.className = 'property-input-wrapper'
  
  render(
    <CustomInput field={field} type="text" />,
    container
  )
  
  return container
}

/**
 * Create number input (using Preact CustomInput component)
 */
function createNumberInput(field) {
  const container = document.createElement('div')
  container.className = 'property-input-wrapper'
  
  render(
    <CustomInput field={field} type="number" />,
    container
  )
  
  return container
}

/**
 * Create textarea (using Preact CustomInput component)
 */
function createTextArea(field) {
  const container = document.createElement('div')
  container.className = 'property-input-wrapper'
  
  render(
    <CustomInput field={field} type="textarea" />,
    container
  )
  
  return container
}

/**
 * Create toggle switch (boolean)
 */
function createToggle(field) {
  const container = document.createElement('div')
  container.className = 'property-toggle-container'

  const label = document.createElement('label')
  label.className = 'property-toggle'

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.name = field.name
  input.checked = field.default || false

  const slider = document.createElement('span')
  slider.className = 'property-toggle-slider'

  label.appendChild(input)
  label.appendChild(slider)
  container.appendChild(label)

  return container
}

/**
 * Create select dropdown (using Preact CustomSelect component)
 */
function createSelect(field) {
  if (!field.options || !Array.isArray(field.options)) {
    logger.warn(`[SchemaForm] Select field missing options: ${field.name}`)
    return document.createElement('div')
  }

  // Create container for the Preact component
  const container = document.createElement('div')
  container.className = 'property-input-wrapper'
  container.dataset.fieldName = field.name

  // Render Preact component (it will create its own hidden input)
  render(
    <CustomSelect
      field={field}
      onChange={(e) => {
        // Update hidden input value and dispatch change event for form sync
        const hiddenInput = container.querySelector(`input[name="${field.name}"]`)
        if (hiddenInput) {
          hiddenInput.value = e.target.value
          const event = new Event('change', { bubbles: true })
          hiddenInput.dispatchEvent(event)
        }
      }}
    />,
    container
  )

  return container
}

/**
 * Create radio button group (using Preact CustomRadio component)
 */
function createRadioGroup(field) {
  if (!field.options || !Array.isArray(field.options)) {
    logger.warn(`[SchemaForm] Radio field missing options: ${field.name}`)
    return document.createElement('div')
  }

  // Create container for the Preact component
  const container = document.createElement('div')
  container.className = 'property-input-wrapper'
  container.dataset.fieldName = field.name

  // Render Preact component (it will create its own hidden input)
  render(
    <CustomRadio
      field={field}
      onChange={(e) => {
        // Update hidden input value and dispatch change event for form sync
        const hiddenInput = container.querySelector(`input[name="${field.name}"]`)
        if (hiddenInput) {
          hiddenInput.value = e.target.value
          const event = new Event('change', { bubbles: true })
          hiddenInput.dispatchEvent(event)
        }
      }}
    />,
    container
  )

  return container
}

/**
 * Create range slider
 */
function createSlider(field) {
  const container = document.createElement('div')
  container.className = 'property-slider-container'

  const input = document.createElement('input')
  input.type = 'range'
  input.className = 'property-input property-input-slider'
  input.name = field.name
  input.min = field.min || 0
  input.max = field.max || 100
  input.step = field.step || 1
  input.value = field.default || field.min || 0

  const valueDisplay = document.createElement('span')
  valueDisplay.className = 'property-slider-value'
  valueDisplay.textContent = input.value

  input.addEventListener('input', () => {
    valueDisplay.textContent = input.value
  })

  container.appendChild(input)
  container.appendChild(valueDisplay)

  return container
}

/**
 * Create empty form fallback
 */
function createEmptyForm() {
  const container = document.createElement('div')
  container.className = 'ai4less-property-inspector'
  container.innerHTML = `
    <div class="property-error">
      <p>⚠️ No input configuration available for this node.</p>
    </div>
  `
  return container
}

/**
 * Extract form data as JSON object
 * @param {HTMLElement} formContainer 
 * @returns {Object} Field values
 */
export function extractFormData(formContainer) {
  const data = {}
  
  // Find all input wrappers and native inputs/textareas
  const fields = formContainer.querySelectorAll(
    'input[name], select[name], textarea[name]'
  )

  fields.forEach((field) => {
    const name = field.name
    if (!name) return // Skip fields without name
    
    let value

    if (field.type === 'checkbox') {
      value = field.checked
    } else if (field.type === 'radio') {
      if (field.checked) {
        value = field.value
      } else {
        return // Skip unchecked radios
      }
    } else if (field.type === 'number' || field.type === 'range') {
      value = field.value ? parseFloat(field.value) : null
    } else if (field.type === 'hidden') {
      // For selects, we use hidden inputs
      value = field.value
    } else {
      value = field.value
    }

    // Only set if not already set (prevents duplicates)
    if (!(name in data)) {
      data[name] = value
    }
  })

  return data
}
