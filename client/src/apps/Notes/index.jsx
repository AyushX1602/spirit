import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import useOsStore from '../../store/osStore'
import { showToast } from '../../components/Toast'

function Notes({ content = '', filePath = '', fileName = '' }) {
  const userName = useOsStore((s) => s.userName)
  const [text, setText] = useState(content || '')
  const [currentFileName, setCurrentFileName] = useState(fileName || 'untitled.txt')
  const [currentFilePath, setCurrentFilePath] = useState(filePath || '')
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('') // 'saved', 'error', ''
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [aiPrompt, setAiPrompt] = useState('Summarize this note')
  const [aiReplaceRange, setAiReplaceRange] = useState(null)
  const [aiResultActionable, setAiResultActionable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
  const textareaRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  // Always points at the latest text so a pending autosave timer (scheduled on a
  // previous render) saves the current content instead of a stale closure value.
  const textRef = useRef(text)
  useEffect(() => { textRef.current = text }, [text])
  // Clear any pending autosave timer on unmount to avoid a state update after
  // the component is gone.
  useEffect(() => () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
  }, [])

  // Load content from props when they change
  useEffect(() => {
    if (content) {
      setText(content)
      setHasChanges(false)
    }
  }, [content])

  useEffect(() => {
    if (filePath) setCurrentFilePath(filePath)
    if (fileName) setCurrentFileName(fileName)
  }, [filePath, fileName])

  useEffect(() => {
    const handleVoiceEdit = (event) => {
      const detail = event.detail || {}
      const voiceText = typeof detail.text === 'string' ? detail.text : ''
      if (!voiceText.trim()) return

      const action = detail.action || 'insert'
      const textarea = textareaRef.current

      setText(prev => {
        if (action === 'replace') return voiceText
        if (action === 'append') return prev ? `${prev}\n${voiceText}` : voiceText

        const start = textarea?.selectionStart ?? prev.length
        const end = textarea?.selectionEnd ?? start
        return prev.slice(0, start) + voiceText + prev.slice(end)
      })
      setHasChanges(true)
      setSaveStatus('')
      showToast(action === 'replace' ? 'Note replaced from voice' : 'Note updated from voice', {
        icon: '🎙️',
        duration: 2500
      })
    }

    window.addEventListener('spiritos:notes-edit', handleVoiceEdit)
    return () => window.removeEventListener('spiritos:notes-edit', handleVoiceEdit)
  }, [])

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const lineCount = text.split('\n').length

  const handleChange = (e) => {
    setText(e.target.value)
    setHasChanges(true)
    setSaveStatus('')

    // Calculate cursor position
    const textarea = e.target
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart)
    const lines = textBeforeCursor.split('\n')
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    })

    // Auto-save after 3 seconds of no typing
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    if (currentFilePath) {
      saveTimeoutRef.current = setTimeout(() => {
        saveFile()
      }, 3000)
    }
  }

  const saveFile = async () => {
    if (!currentFilePath || saving) return

    setSaving(true)
    try {
      await axios.put('/api/fs/write', {
        path: currentFilePath,
        content: textRef.current
      })
      setHasChanges(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    } catch (err) {
      console.error('Save failed:', err)
      setSaveStatus('error')

      // If file doesn't exist yet, try creating it
      if (err.response?.status === 404) {
        try {
          const pathParts = currentFilePath.split('/')
          const name = pathParts.pop()
          const parentPath = pathParts.join('/') || '/'
          await axios.post('/api/fs/create', {
            path: parentPath,
            name: name,
            type: 'file',
            content: textRef.current
          })
          setHasChanges(false)
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus(''), 2000)
        } catch (createErr) {
          console.error('Create also failed:', createErr)
          setSaveStatus('error')
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAs = () => {
    const newName = prompt('Save as:', currentFileName)
    if (!newName) return

    const parentPath = currentFilePath
      ? currentFilePath.split('/').slice(0, -1).join('/') || '/'
      : '/'

    const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`

    setCurrentFileName(newName)
    setCurrentFilePath(newPath)

    // Create the file
    axios.post('/api/fs/create', {
      path: parentPath,
      name: newName,
      type: 'file',
      content: textRef.current
    }).then(() => {
      setHasChanges(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }).catch(err => {
      console.error('Save As failed:', err)
      setSaveStatus('error')
    })
  }

  const handleNew = () => {
    if (hasChanges && !confirm('Discard unsaved changes?')) return
    setText('')
    setCurrentFileName('untitled.txt')
    setCurrentFilePath('')
    setHasChanges(false)
    setSaveStatus('')
  }

  const handleKeyDown = (e) => {
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (currentFilePath) {
        saveFile()
      } else {
        handleSaveAs()
      }
    }
    // Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = text.substring(0, start) + '  ' + text.substring(end)
      setText(newText)
      setHasChanges(true)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const getSelectionRange = () => {
    const el = textareaRef.current
    if (!el) return null
    if (el.selectionStart === el.selectionEnd) return null
    return { start: el.selectionStart, end: el.selectionEnd }
  }

  const getSelectedText = (range = getSelectionRange()) => {
    if (!range) return ''
    return text.slice(range.start, range.end).trim()
  }

  const askAI = async (prompt = aiPrompt) => {
    const selectedRange = getSelectionRange()
    const selectedText = getSelectedText(selectedRange)
    const noteText = (selectedText || text).trim()
    const instruction = (prompt || '').trim() || 'Summarize this note'

    setAiPanelOpen(true)
    setAiReplaceRange(selectedText ? selectedRange : null)
    setAiResultActionable(false)
    if (!noteText) {
      setAiResponse('Write or open a note first, then ask me to summarize, improve, continue, or explain it.')
      return
    }

    setIsLoading(true)
    setAiResponse('')
    try {
      const response = await axios.post('/api/agent/chat', {
        message: `${instruction}\n\nText:\n${noteText.substring(0, 3000)}`,
        osState: { userName }
      })
      setAiResponse(response.data.message || 'No response returned.')
      setAiResultActionable(Boolean(response.data.message))
    } catch (err) {
      const detail = err.response?.data?.message || err.response?.data?.error || err.message
      setAiResponse(`AI is not available right now.${detail ? `\n\n${detail}` : ''}`)
      setAiResultActionable(false)
    } finally {
      setIsLoading(false)
    }
  }

  const copyAIResponse = async () => {
    if (!aiResponse.trim()) return
    try {
      await navigator.clipboard.writeText(aiResponse)
      showToast('AI text copied', { icon: '📋', duration: 2500 })
    } catch (_) {
      showToast("Couldn't copy text", { icon: '⚠️', duration: 3000 })
    }
  }

  const replaceWithAIResponse = () => {
    const nextText = aiResponse.trim()
    if (!nextText || isLoading || !aiResultActionable) return

    if (aiReplaceRange) {
      setText(prev => prev.slice(0, aiReplaceRange.start) + nextText + prev.slice(aiReplaceRange.end))
      setTimeout(() => {
        if (!textareaRef.current) return
        const pos = aiReplaceRange.start + nextText.length
        textareaRef.current.focus()
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = pos
      }, 0)
    } else {
      setText(nextText)
      setTimeout(() => {
        if (!textareaRef.current) return
        textareaRef.current.focus()
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = nextText.length
      }, 0)
    }

    setHasChanges(true)
    setSaveStatus('')
    showToast(aiReplaceRange ? 'Selection replaced' : 'Note replaced', { icon: '✨', duration: 2500 })
  }

  return (
    <div className="h-full flex flex-col bg-os-bg-primary">
      {/* Top Toolbar */}
      <div className="h-12 flex items-center px-4 gap-2 bg-os-surface border-b border-os-border">
        <div className="flex items-center gap-1 bg-os-bg-secondary p-1 rounded-lg border border-os-border">
          <button onClick={handleNew} className="w-8 h-8 rounded flex items-center justify-center text-os-text-secondary hover:bg-os-bg-secondary hover:text-os-text-primary transition-colors" title="New">
            <span className="text-lg">📄</span>
          </button>
          <button onClick={handleSaveAs} className="w-8 h-8 rounded flex items-center justify-center text-os-text-secondary hover:bg-os-bg-secondary hover:text-os-text-primary transition-colors" title="Save As">
            <span className="text-lg">📂</span>
          </button>
          <button
            onClick={currentFilePath ? saveFile : handleSaveAs}
            disabled={saving || !hasChanges}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              hasChanges
                ? 'text-white bg-indigo-500/50 hover:bg-indigo-500'
                : 'text-os-text-secondary bg-os-bg-secondary/30'
            }`}
            title="Save (Ctrl+S)"
          >
            <span className="text-lg">{saving ? '⏳' : '💾'}</span>
          </button>
        </div>

        {/* File name */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-os-text-secondary font-mono truncate max-w-[200px]">{currentFileName}</span>
          {hasChanges && <span className="text-yellow-400 text-xs">●</span>}
          {saveStatus === 'saved' && <span className="text-green-400 text-xs">✓ Saved</span>}
          {saveStatus === 'error' && <span className="text-red-400 text-xs">✕ Error</span>}
        </div>

        <div className="flex-1" />

        {/* Ask AI Button */}
        <button
          onClick={() => askAI()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all duration-200 group disabled:opacity-50"
          title="Ask AI about selected text or this note"
        >
          <span className="group-hover:scale-110 transition-transform">{isLoading ? '⏳' : '✨'}</span>
          <span className="text-sm font-semibold">Ask AI</span>
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Line Numbers */}
        <div className="w-12 flex-shrink-0 bg-os-bg-primary text-right pr-3 py-4 font-mono text-sm text-os-text-secondary border-r border-os-border select-none overflow-hidden">
          {text.split('\n').map((_, i) => (
            <div key={i} className="leading-[1.6]">{i + 1}</div>
          ))}
        </div>

        {/* Text Editor */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 h-full p-4 bg-os-bg-primary font-mono text-sm text-os-text-primary leading-[1.6] outline-none resize-none"
          placeholder="Start typing or open a file from File Explorer..."
          spellCheck={false}
        />

        {/* AI Response Panel */}
        {aiPanelOpen && (
          <div className="w-80 border-l border-os-border flex flex-col bg-os-surface">
            <div className="flex items-center justify-between px-3 py-2 border-b border-os-border">
              <span className="text-xs text-os-text-secondary uppercase tracking-wider">Notes AI</span>
              <button onClick={() => setAiPanelOpen(false)} className="text-os-text-secondary hover:text-os-text-primary">✕</button>
            </div>
            <div className="p-3 border-b border-os-border space-y-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') askAI()
                }}
                className="w-full h-20 resize-none rounded-lg border border-os-border bg-os-bg-primary p-2 text-sm text-os-text-primary outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Ask about this note..."
              />
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Summarize', 'Summarize this note'],
                  ['Improve', 'Rewrite this note to be clearer and more polished'],
                  ['Fix grammar', 'Fix grammar and spelling without changing the meaning'],
                  ['Continue', 'Continue writing this note in the same style']
                ].map(([label, prompt]) => (
                  <button
                    key={label}
                    onClick={() => { setAiPrompt(prompt); askAI(prompt) }}
                    disabled={isLoading}
                    className="px-2 py-2 rounded-lg bg-os-bg-tertiary hover:bg-indigo-500/20 text-xs text-os-text-secondary hover:text-indigo-300 disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => askAI()}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-sm font-semibold text-indigo-300 disabled:opacity-50"
              >
                {isLoading ? 'Thinking...' : 'Run'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 text-sm text-os-text-primary whitespace-pre-wrap">
              {isLoading ? 'Thinking...' : aiResponse}
            </div>
            {!isLoading && aiResultActionable && aiResponse.trim() && (
              <div className="p-3 border-t border-os-border grid grid-cols-2 gap-2">
                <button
                  onClick={replaceWithAIResponse}
                  className="px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-sm font-semibold text-indigo-300"
                >
                  {aiReplaceRange ? 'Replace selection' : 'Replace note'}
                </button>
                <button
                  onClick={copyAIResponse}
                  className="px-3 py-2 rounded-lg bg-os-bg-tertiary hover:bg-os-bg-secondary text-sm font-semibold text-os-text-secondary hover:text-os-text-primary"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-8 flex items-center justify-between px-4 bg-os-surface border-t border-os-border font-mono text-xs text-os-text-secondary select-none">
        <div className="flex items-center gap-4">
          <span className="hover:text-os-text-primary cursor-pointer transition-colors">UTF-8</span>
          <span className="hover:text-os-text-primary cursor-pointer transition-colors">
            {currentFileName.endsWith('.md') ? 'Markdown' :
             currentFileName.endsWith('.json') ? 'JSON' :
             currentFileName.endsWith('.js') || currentFileName.endsWith('.jsx') ? 'JavaScript' :
             currentFileName.endsWith('.html') ? 'HTML' :
             currentFileName.endsWith('.css') ? 'CSS' :
             currentFileName.endsWith('.py') ? 'Python' : 'Plain Text'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{wordCount} words</span>
          <span>{lineCount} lines</span>
          {currentFilePath && (
            <span className="text-os-text-secondary/50 truncate max-w-[200px]" title={currentFilePath}>{currentFilePath}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notes
