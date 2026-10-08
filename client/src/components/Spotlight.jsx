/**
 * Spotlight.jsx — Universal Search + Command Palette
 *
 * Trigger: Ctrl/Cmd+K globally, or voice "open spotlight" / "search for X"
 * Close: Esc, backdrop click
 *
 * Modes:
 *   Normal input → search apps, files, notes
 *   ">" prefix   → command palette
 *
 * A11y: role=combobox, aria-activedescendant, keyboard nav (↑↓ Enter Tab)
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import useOsStore from '../store/osStore'
import useWindowStore from '../store/windowStore'
import { APPS, ICON_STYLES, getDefaultSize } from '../config/appConfig'
import { filterCommands, COMMANDS as ALL_COMMANDS } from '../lib/commands'

// ── Fuzzy app search ──────────────────────────────────────────────────────────
function searchApps(query) {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return Object.entries(APPS)
    .filter(([key, app]) =>
      app.name.toLowerCase().includes(q) || key.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map(([key, app]) => ({
      id: `app:${key}`,
      type: 'app',
      title: app.name,
      subtitle: 'App',
      icon: ICON_STYLES[key]?.icon || app.icon,
      appKey: key,
      group: 'Apps'
    }))
}

// ── Recent apps (persisted) ───────────────────────────────────
const RECENT_KEY = 'spotlight-recent-apps'

function loadRecentApps() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter(k => APPS[k]) : []
  } catch { return [] }
}

function pushRecentApp(key) {
  try {
    const cur = loadRecentApps().filter(k => k !== key)
    cur.unshift(key)
    localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, 8)))
  } catch { /* ignore */ }
}

function recentAppItems() {
  const keys = loadRecentApps()
  const list = keys.length ? keys : ['FileExplorer', 'Browser', 'Terminal', 'Settings']
  return list
    .filter(key => APPS[key])
    .slice(0, 6)
    .map(key => ({
      id: `app:${key}`,
      type: 'app',
      title: APPS[key].name,
      subtitle: 'Recent app',
      icon: ICON_STYLES[key]?.icon || APPS[key].icon,
      appKey: key,
      group: 'Recent'
    }))
}

// ── Safe arithmetic evaluator (shunting-yard, no eval) ────────────────────
function evalMath(raw) {
  const expr = String(raw).trim()
  if (!expr) return null
  if (!/^[0-9+\-*/%.()^\s]+$/.test(expr)) return null
  if (!/[0-9]/.test(expr)) return null

  const tokens = expr.match(/(\d+\.?\d*|\.\d+|[+\-*/%^()])/g)
  if (!tokens) return null

  const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 }
  const rightAssoc = { '^': true }
  const output = []
  const ops = []
  let prevType = null

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (/^[0-9.]/.test(t)) {
      output.push(parseFloat(t))
      prevType = 'num'
    } else if (t === '(') {
      ops.push(t)
      prevType = 'lparen'
    } else if (t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') output.push(ops.pop())
      if (!ops.length) return null
      ops.pop()
      prevType = 'rparen'
    } else {
      let op = t
      if ((op === '-' || op === '+') && (prevType === null || prevType === 'op' || prevType === 'lparen')) {
        op = op === '-' ? 'u-' : 'u+'
      }
      const p1 = (op === 'u-' || op === 'u+') ? 4 : prec[op]
      while (ops.length) {
        const o2 = ops[ops.length - 1]
        if (o2 === '(') break
        const p2 = (o2 === 'u-' || o2 === 'u+') ? 4 : prec[o2]
        if (p2 > p1 || (p2 === p1 && !rightAssoc[op])) output.push(ops.pop())
        else break
      }
      ops.push(op)
      prevType = 'op'
    }
  }
  while (ops.length) {
    const o = ops.pop()
    if (o === '(') return null
    output.push(o)
  }

  const st = []
  for (const tok of output) {
    if (typeof tok === 'number') { st.push(tok); continue }
    if (tok === 'u-') { if (!st.length) return null; st.push(-st.pop()); continue }
    if (tok === 'u+') { if (!st.length) return null; continue }
    if (st.length < 2) return null
    const b = st.pop()
    const a = st.pop()
    let r
    switch (tok) {
      case '+': r = a + b; break
      case '-': r = a - b; break
      case '*': r = a * b; break
      case '/': r = b === 0 ? NaN : a / b; break
      case '%': r = b === 0 ? NaN : a % b; break
      case '^': r = Math.pow(a, b); break
      default: return null
    }
    st.push(r)
  }
  if (st.length !== 1) return null
  const result = st[0]
  if (!Number.isFinite(result)) return null
  return Math.round((result + Number.EPSILON) * 1e10) / 1e10
}

export default function Spotlight() {
  const { spotlightOpen, closeSpotlight } = useOsStore()
  const osStore = useOsStore()
  const windowStore = useWindowStore()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [needsIndex, setNeedsIndex] = useState(false)
  const [confirmCmd, setConfirmCmd] = useState(null) // command pending confirmation
  const [macroResult, setMacroResult] = useState(null)

  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const listRef = useRef(null)

  const isCommandMode = query.startsWith('>')
  const cleanQuery = isCommandMode ? query.slice(1).trimStart() : query

  // ── Focus input on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (spotlightOpen) {
      setQuery('')
      setResults([])
      setSelectedIdx(0)
      setNeedsIndex(false)
      setConfirmCmd(null)
      setMacroResult(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [spotlightOpen])

  // ── Build results ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!spotlightOpen) return
    if (confirmCmd) return

    if (isCommandMode) {
      // Command palette mode
      const cmds = filterCommands(cleanQuery)
      const macros = osStore.macros || []
      const macroItems = macros
        .filter(m => !cleanQuery || m.name.toLowerCase().includes(cleanQuery.toLowerCase()))
        .map(m => ({ id: `macro:${m.id}`, type: 'macro', title: m.name,
          subtitle: `Macro · ${m.commands.length} steps`, icon: '⚡', macro: m }))
      setResults([
        ...cmds.map(c => ({ id: `cmd:${c.id}`, type: 'command', title: c.title,
          subtitle: c.shortcut || (c.requiresConfirm ? '⚠ Needs confirm' : ''),
          icon: c.requiresConfirm ? '⚠️' : '⚡', command: c })),
        ...macroItems
      ])
      setSelectedIdx(0)
      return
    }

    // Search mode
    if (!cleanQuery.trim()) {
      setResults(recentAppItems())
      setSelectedIdx(0)
      setNeedsIndex(false)
      return
    }

    // Apps first (synchronous), plus inline calculator + web action
    const appHits = searchApps(cleanQuery)
    const calcItems = []
    const calcVal = evalMath(cleanQuery)
    if (calcVal !== null) {
      calcItems.push({
        id: `calc:${cleanQuery}`,
        type: 'calc',
        title: String(calcVal),
        subtitle: `= ${cleanQuery.trim()} · press ↵ to copy`,
        icon: '🧮',
        calcValue: calcVal,
        group: 'Calculator'
      })
    }
    const webAction = {
      id: 'action:web',
      type: 'action',
      title: `Search the web for "${cleanQuery.trim()}"`,
      subtitle: 'Opens in Browser',
      icon: '🌐',
      action: 'web',
      query: cleanQuery.trim(),
      group: 'Actions'
    }
    const instantHits = [...calcItems, ...appHits, webAction]
    setResults(instantHits)
    setSelectedIdx(0)

    // Debounced server search
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await axios.get('/api/search/spotlight', {
          params: { q: cleanQuery, limit: 6 },
          signal: ctrl.signal
        })
        const serverHits = (res.data.results || []).map(r => ({
          id: `file:${r.path}`,
          type: r.resultType || 'file',
          title: r.name || r.path?.split('/').pop() || '',
          subtitle: r.path || '',
          icon: r.resultType === 'note' ? '📝' : '📄',
          score: r.score,
          filePath: r.path,
          group: 'Files'
        }))
        setNeedsIndex(res.data.needsIndex && serverHits.length === 0)
        setResults([...instantHits, ...serverHits])
        setSelectedIdx(0)
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          // Server error — keep app results
        }
      } finally {
        setLoading(false)
      }
    }, 150)

    return () => { clearTimeout(timer); ctrl.abort() }
  }, [query, spotlightOpen, isCommandMode, cleanQuery, confirmCmd])

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { closeSpotlight(); return }
    if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
      e.preventDefault()
      const idx = parseInt(e.key, 10) - 1
      const item = results[idx]
      if (item) { setSelectedIdx(idx); activateResult(item) }
      return
    }
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      setSelectedIdx(i => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault()
      setSelectedIdx(i => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (confirmCmd) return // handled by confirm buttons
      const item = results[selectedIdx]
      if (item) activateResult(item)
    }
  }, [results, selectedIdx, closeSpotlight, confirmCmd])

  // ── Activate a result ─────────────────────────────────────────────────────
  const activateResult = useCallback(async (item) => {
    if (item.type === 'app') {
      pushRecentApp(item.appKey)
      windowStore.openWindow(item.appKey, item.title, getDefaultSize(item.appKey))
      closeSpotlight()
      return
    }

    if (item.type === 'calc') {
      try { navigator.clipboard?.writeText(String(item.calcValue)) } catch (_) {}
      closeSpotlight()
      return
    }

    if (item.type === 'action' && item.action === 'web') {
      const url = 'https://www.google.com/search?q=' + encodeURIComponent(item.query)
      windowStore.openWindow('Browser', 'Browser', getDefaultSize('Browser'), { initialUrl: url, navSeq: Date.now() })
      closeSpotlight()
      return
    }

    if (item.type === 'command') {
      const cmd = item.command
      if (cmd.requiresConfirm) {
        setConfirmCmd(item)
        return
      }
      cmd.run({ osStore, windowStore })
      closeSpotlight()
      return
    }

    if (item.type === 'macro') {
      await runMacro(item.macro)
      return
    }

    if (item.type === 'file' || item.type === 'note') {
      if (item.filePath) {
        const ext = item.filePath.split('.').pop().toLowerCase()
        const imageExts = ['png','jpg','jpeg','gif','svg','webp','bmp']
        if (ext === 'pdf') {
          windowStore.openWindow('PdfViewer', item.title, getDefaultSize('PdfViewer'),
            { filePath: item.filePath, fileName: item.title })
        } else if (imageExts.includes(ext)) {
          windowStore.openWindow('ImageViewer', item.title, getDefaultSize('ImageViewer'),
            { filePath: item.filePath, fileName: item.title })
        } else {
          windowStore.openWindow('Notes', item.title, getDefaultSize('Notes'),
            { filePath: item.filePath, fileName: item.title })
        }
      }
      closeSpotlight()
    }
  }, [osStore, windowStore, closeSpotlight])

  // ── Run a macro ───────────────────────────────────────────────────────────
  const runMacro = useCallback(async (macro) => {
    setMacroResult({ status: 'running', name: macro.name, step: 0 })

    for (let i = 0; i < macro.commands.length; i++) {
      const cmdId = macro.commands[i]
      const cmd = ALL_COMMANDS.find(c => c.id === cmdId)
      if (!cmd) {
        setMacroResult({ status: 'error', name: macro.name, step: i,
          error: `Unknown command: ${cmdId}` })
        return
      }
      try {
        await cmd.run({ osStore, windowStore })
        setMacroResult({ status: 'running', name: macro.name, step: i + 1 })
        await new Promise(r => setTimeout(r, 120))
      } catch (err) {
        setMacroResult({ status: 'error', name: macro.name, step: i,
          error: `Step ${i + 1} (${cmd.title}) failed: ${err.message}` })
        return
      }
    }
    setMacroResult({ status: 'done', name: macro.name, step: macro.commands.length })
    setTimeout(closeSpotlight, 1200)
  }, [osStore, windowStore, closeSpotlight])

  // ── Index folder shortcut ─────────────────────────────────────────────────
  const handleIndexFolder = useCallback(async () => {
    try {
      await axios.post('/api/search/index', { target_path: '/', recursive: true })
      setNeedsIndex(false)
      // Retry search
      setQuery(q => q + ' ')
      setTimeout(() => setQuery(q => q.trim()), 50)
    } catch (_) {}
  }, [])

  // Keep the highlighted option visible when navigating a long list by keyboard.
  useEffect(() => {
    const active = results[selectedIdx]
    if (!active) return
    const el = document.getElementById(`sl-item-${active.id}`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx, results])

  if (!spotlightOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="spotlight-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeSpotlight}
        className="fixed inset-0 bg-backdrop z-[190000]"
        aria-hidden="true"
      />
      <motion.div
        key="spotlight-panel"
        initial={{ opacity: 0, scale: 0.96, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="fixed top-[18vh] left-1/2 -translate-x-1/2 z-[190001] w-full max-w-xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Spotlight Search"
        aria-modal="true"
      >
        <div className="glass-window rounded-2xl overflow-hidden shadow-window">
          <div aria-live="polite" className="sr-only">
            {results.length > 0 ? `${results.length} results` : (cleanQuery ? 'No results' : '')}
          </div>
          {/* Input bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-bd">
            <span className="text-fg-mut text-[18px]">
              {isCommandMode ? '⚡' : '🔍'}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isCommandMode ? 'Type a command or > to browse…' : 'Search apps, files, notes… or type > for commands'}
              className="flex-1 bg-transparent text-fg text-[15px] outline-none placeholder:text-fg-fnt"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-activedescendant={results[selectedIdx]?.id ? `sl-item-${results[selectedIdx].id}` : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            {loading && (
              <span className="text-fg-fnt text-[12px] animate-pulse">…</span>
            )}
            <kbd className="text-[10px] text-fg-fnt border border-bd rounded px-1.5 py-0.5">Esc</kbd>
          </div>

          {/* Confirm dialog */}
          {confirmCmd && (
            <div className="px-4 py-4 space-y-3">
              <p className="text-fg text-[13px]">
                ⚠️ {confirmCmd.command.confirmMessage || `Run "${confirmCmd.command.title}"?`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { confirmCmd.command.run({ osStore, windowStore }); closeSpotlight() }}
                  className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-[13px] hover:bg-red-500/30 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmCmd(null)}
                  className="px-4 py-1.5 rounded-lg surface-1 text-fg-mut text-[13px] hover:text-fg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Macro result */}
          {macroResult && !confirmCmd && (
            <div className="px-4 py-3 text-[13px]">
              {macroResult.status === 'running' && (
                <span className="text-fg-mut">⚡ Running {macroResult.name}… step {macroResult.step}</span>
              )}
              {macroResult.status === 'done' && (
                <span className="text-[#34d399]">✅ {macroResult.name} — all {macroResult.step} steps done</span>
              )}
              {macroResult.status === 'error' && (
                <span className="text-red-400">❌ {macroResult.error}</span>
              )}
            </div>
          )}

          {/* Results list */}
          {!confirmCmd && !macroResult && results.length > 0 && (
            <ul ref={listRef} role="listbox" aria-label="Search results" className="max-h-[55vh] overflow-y-auto py-1">
              {results.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {item.group && item.group !== results[idx - 1]?.group && (
                    <li role="presentation" className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-fg-fnt">
                      {item.group}
                    </li>
                  )}
                  <li
                    id={`sl-item-${item.id}`}
                    role="option"
                    aria-selected={idx === selectedIdx}
                    onClick={() => { setSelectedIdx(idx); activateResult(item) }}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      idx === selectedIdx ? 'bg-os-accent/10 text-fg' : 'text-fg hover:bg-os-surface-hover'
                    }`}
                  >
                    <span className="text-[18px] w-6 text-center flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[11px] text-fg-mut truncate">{item.subtitle}</p>
                      )}
                    </div>
                    {item.score != null && (
                      <span className="text-[10px] text-fg-fnt flex-shrink-0">
                        {Math.round(item.score * 100)}%
                      </span>
                    )}
                    {idx === selectedIdx && (
                      <kbd className="text-[10px] text-fg-fnt border border-bd rounded px-1 flex-shrink-0">↵</kbd>
                    )}
                  </li>
                </React.Fragment>
              ))}
            </ul>
          )}

          {/* Index hint */}
          {needsIndex && !isCommandMode && !confirmCmd && (
            <div className="px-4 py-3 flex items-center gap-3 text-[12px] text-fg-mut border-t border-bd">
              <span>💡 No file index yet</span>
              <button
                onClick={handleIndexFolder}
                className="px-2.5 py-1 rounded-lg bg-os-accent/15 text-os-accent text-[11px] hover:bg-os-accent/25 transition-colors"
              >
                Index home folder
              </button>
            </div>
          )}

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-bd flex items-center gap-3 text-[10px] text-fg-fnt">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>Esc close</span>
            <span className="ml-auto">Type <kbd className="border border-bd rounded px-1">&gt;</kbd> for commands</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
