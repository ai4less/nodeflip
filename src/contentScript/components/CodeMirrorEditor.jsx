/**
 * CodeMirror Code Editor Component
 * Modern code editor with n8n expression support
 */

import { useEffect, useRef, useState } from 'preact/hooks'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { getPreviousNodesForAutocomplete } from '../codemirrorN8nProvider'

export function CodeMirrorEditor({
  field,
  initialValue = '',
  onChange,
  language = 'python',
  height = '450px'
}) {
  const [availableNodes, setAvailableNodes] = useState([])
  const editorRef = useRef(null)
  const viewRef = useRef(null)
  const containerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const isExternalUpdateRef = useRef(false)

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Fetch available nodes for autocomplete
  useEffect(() => {
    async function fetchNodes() {
      const nodes = await getPreviousNodesForAutocomplete()
      setAvailableNodes(nodes)
      console.log('[CodeMirror] Loaded available nodes for autocomplete:', nodes)
    }
    fetchNodes()
  }, [])

  // Listen for external value updates via custom event
  useEffect(() => {
    const handleExternalUpdate = (event) => {
      const newValue = event.detail?.value
      if (newValue !== undefined && viewRef.current) {
        console.log('[CodeMirror] Received external update:', newValue?.substring(0, 50) + '...')

        // Mark this as an external update to prevent onChange from firing
        isExternalUpdateRef.current = true

        const view = viewRef.current
        const currentValue = view.state.doc.toString()

        if (newValue !== currentValue) {
          view.dispatch({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: newValue
            }
          })
        }

        // Reset flag after a tick
        setTimeout(() => {
          isExternalUpdateRef.current = false
        }, 0)
      }
    }

    // Find the parent container (property-input-wrapper)
    const container = containerRef.current?.closest('.property-input-wrapper')
    if (container) {
      container.addEventListener('ai4less-update-code', handleExternalUpdate)
      return () => {
        container.removeEventListener('ai4less-update-code', handleExternalUpdate)
      }
    }
  }, [])

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return

    // Create n8n autocomplete extension
    const n8nAutocomplete = autocompletion({
      override: [
        (context) => {
          const word = context.matchBefore(/\{\{[\s\S]*?$/)
          if (!word && !context.explicit) return null

          const suggestions = [
            { label: '{{ $json }}', type: 'variable', info: 'Access all data from previous node' },
            { label: '{{ $json.fieldName }}', type: 'variable', info: 'Access specific field from previous node' },
            { label: '{{ $input.item.json }}', type: 'variable', info: 'Access current input item' },
            { label: '{{ $input.all() }}', type: 'function', info: 'Get all input items' },
            { label: '{{ $now }}', type: 'variable', info: 'Current timestamp' },
            { label: '{{ $today }}', type: 'variable', info: 'Today\'s date' },
            { label: '{{ $workflow }}', type: 'variable', info: 'Workflow metadata' },
            ...availableNodes.map(node => ({
              label: `{{ $node["${node.name}"].json }}`,
              type: 'variable',
              info: `Access data from ${node.name} node`
            }))
          ]

          return {
            from: word ? word.from : context.pos,
            options: suggestions,
            validFor: /[\w$\{\}\[\]"\.]*$/
          }
        }
      ]
    })

    // Get language extension
    const langExtension = language === 'javascript' ? javascript() : python()

    // Create editor state
    const startState = EditorState.create({
      doc: initialValue,
      extensions: [
        langExtension,
        oneDark,
        n8nAutocomplete,
        keymap.of(completionKeymap),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            // Don't fire onChange if this is an external update
            if (isExternalUpdateRef.current) {
              console.log('[CodeMirror] Skipping onChange for external update')
              return
            }

            const newValue = update.state.doc.toString()
            console.log('[CodeMirror] Document changed, firing onChange with value:', newValue?.substring(0, 50) + '...')
            console.log('[CodeMirror] onChangeRef.current exists?', !!onChangeRef.current)

            if (onChangeRef.current) {
              onChangeRef.current(newValue)
            } else {
              console.warn('[CodeMirror] onChange callback is not defined!')
            }
          }
        }),
        EditorView.theme({
          '&': {
            height: height,
            fontSize: '13px'
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace'
          },
          '.cm-content': {
            padding: '16px 0'
          },
          '.cm-gutters': {
            borderRight: '1px solid rgba(255,255,255,0.1)'
          }
        })
      ]
    })

    // Create editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    })

    viewRef.current = view
    console.log('[CodeMirror] Editor initialized')

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, [language, height, initialValue, availableNodes])

  function insertText(text) {
    if (viewRef.current) {
      const view = viewRef.current
      const pos = view.state.selection.main.head

      view.dispatch({
        changes: {
          from: pos,
          to: pos,
          insert: text
        },
        selection: {
          anchor: pos + text.length
        }
      })

      view.focus()
    }
  }

  return (
    <div class="property-monaco-editor-container" ref={containerRef}>
      {/* Expression Helper */}
      <div class="property-expression-helper">
        <div class="property-expression-helper-title">
          💡 n8n Expression Support
        </div>
        <div style="font-size: 10px; margin-bottom: 6px; color: #aaa;">
          Type <code style="background: #1e1e1e; padding: 2px 4px; border-radius: 3px; color: #9eccff;">{'{{'}</code> to use n8n variables. Access input data with <code style="background: #1e1e1e; padding: 2px 4px; border-radius: 3px; color: #9eccff;">input_data</code> variable.
        </div>
        <div class="property-expression-examples">
          <div
            class="property-expression-tag"
            onClick={() => insertText('{{ $json }}')}
            title="Click to insert - Access all data from previous node"
          >
            {'{{'} $json {'}}'}
          </div>
          <div
            class="property-expression-tag"
            onClick={() => insertText('{{ $json.fieldName }}')}
            title="Click to insert - Access specific field"
          >
            {'{{'} $json.fieldName {'}}'}
          </div>
          <div
            class="property-expression-tag"
            onClick={() => insertText('{{ $input.item.json }}')}
            title="Click to insert - Access current input"
          >
            {'{{'} $input.item.json {'}}'}
          </div>
          {availableNodes.slice(0, 2).map(node => (
            <div
              class="property-expression-tag"
              onClick={() => insertText(`{{ $node["${node.name}"].json }}`)}
              title={`Click to insert - Access data from ${node.name} node`}
              key={node.name}
            >
              {'{{'} $node["{node.name}"] {'}}'}
            </div>
          ))}
        </div>
      </div>

      {/* CodeMirror Editor */}
      <div class="property-monaco-wrapper">
        <div ref={editorRef} />
      </div>

      {/* Helper text */}
      <div class="property-code-helper-text">
        <span style="color: #667eea;">ℹ️</span> Use <code>input_data</code> to access data passed from previous nodes.
        This code will execute in a secure Beam.cloud sandbox when the workflow runs.
      </div>
    </div>
  )
}
