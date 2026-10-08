/**
 * File Explorer Application
 * Full-featured file browser with tree view and grid
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import useWindowStore from '../../store/windowStore'
import useOsStore from '../../store/osStore'
import TreeView from './TreeView'
import FileGrid from './FileGrid'
import { showToast } from '../../components/Toast'

const DRIVE_ROOT_RE = /^[A-Za-z]:\/?$/
const DRIVE_PATH_RE = /^[A-Za-z]:\//

function normalizeDisplayPath(p = '/') {
  const value = String(p || '/').replace(/\\/g, '/')
  if (/^[A-Za-z]:$/.test(value)) return `${value}/`
  if (DRIVE_PATH_RE.test(value)) return value.replace(/^([A-Za-z]:)\/+/, '$1/')
  return value
}

function joinDisplayPath(base, name) {
  const cleanName = String(name || '').replace(/^[\\/]+/, '')
  const cleanBase = normalizeDisplayPath(base || '/').replace(/\/+$/, '')
  if (!cleanName) return normalizeDisplayPath(base || '/')
  if (!cleanBase || cleanBase === '') return `/${cleanName}`
  return `${cleanBase}/${cleanName}`
}

function basenameFromPath(p = '') {
  const parts = normalizeDisplayPath(p).replace(/\/+$/, '').split('/').filter(Boolean)
  return parts[parts.length - 1] || normalizeDisplayPath(p)
}

function parentDisplayPath(p = '/') {
  const value = normalizeDisplayPath(p)
  if (value === '/' || value === '__drives__') return value
  if (DRIVE_ROOT_RE.test(value)) return '__drives__'

  if (DRIVE_PATH_RE.test(value)) {
    const withoutTrailing = value.replace(/\/+$/, '')
    const [drive, ...rest] = withoutTrailing.split('/')
    rest.pop()
    return rest.length ? `${drive}/${rest.join('/')}` : `${drive}/`
  }

  const parts = value.split('/').filter(Boolean)
  parts.pop()
  return parts.length > 0 ? '/' + parts.join('/') : '/'
}

function FileExplorer() {
  const [currentPath, setCurrentPath] = useState('/')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [selected, setSelected] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null })
  const [error, setError] = useState(null)
  const [createDialog, setCreateDialog] = useState({ visible: false, type: 'file' })
  const [createName, setCreateName] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [clipboard, setClipboard] = useState({ items: [], mode: null }) // mode: 'copy' | 'cut'
  const [showTrash, setShowTrash] = useState(false)
  const [trashItems, setTrashItems] = useState([])
  const [showRecent, setShowRecent] = useState(false)
  const [recentItems, setRecentItems] = useState([])
  const [renameDialog, setRenameDialog] = useState({ visible: false, item: null })
  const [renameName, setRenameName] = useState('')

  const { openWindow } = useWindowStore()
  const { theme } = useOsStore()

  const searchTimeoutRef = useRef(null)
  const dragItemRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        searchFiles(searchQuery)
      } else {
        fetchDirectory(currentPath)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  useEffect(() => {
    if (!searchQuery) {
      fetchDirectory(currentPath)
    }
  }, [currentPath, showHidden])

  const fetchDirectory = async (dirPath) => {
    // Special pseudo-path for drives view
    if (dirPath === '__drives__') {
      try {
        const res = await axios.get('/api/fs/drives')
        setItems(res.data.drives || [])
      } catch { setItems([]) }
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`/api/fs/list?path=${encodeURIComponent(dirPath)}&showHidden=${showHidden}`)
      setItems(response.data.children || [])
    } catch (err) {
      setError("Couldn't load this folder — please try again")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const searchFiles = async (query) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`/api/fs/search?query=${encodeURIComponent(query)}&path=${encodeURIComponent(currentPath)}`)
      setItems(response.data.results || [])
    } catch (err) {
      setError('Search failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrash = useCallback(async () => {
    try {
      const res = await axios.get('/api/fs/trash')
      setTrashItems(res.data.items || [])
    } catch (_) {}
  }, [])

  useEffect(() => { if (showTrash) fetchTrash() }, [showTrash, fetchTrash])

  const fetchRecent = useCallback(async () => {
    try {
      const res = await axios.get('/api/fs/activity?limit=30')
      setRecentItems(res.data.items || [])
    } catch (_) {}
  }, [])

  useEffect(() => { if (showRecent) fetchRecent() }, [showRecent, fetchRecent])

  // Sort items (must be before handleItemClick which depends on it)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // Directories first
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }

      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = (a.size || 0) - (b.size || 0)
          break
        case 'modified':
          comparison = new Date(a.modified || 0) - new Date(b.modified || 0)
          break
        default:
          comparison = 0
      }

      return sortAsc ? comparison : -comparison
    })
  }, [items, sortBy, sortAsc])

  // Handle single click selection
  const handleItemClick = useCallback((item, event) => {
    if (event.ctrlKey || event.metaKey) {
      setSelected(prev => {
        if (prev.includes(item.path)) {
          return prev.filter(p => p !== item.path)
        }
        return [...prev, item.path]
      })
    } else if (event.shiftKey && selected.length > 0) {
      const allPaths = sortedItems.map(i => i.path)
      const lastSelected = selected[selected.length - 1]
      const lastIndex = allPaths.indexOf(lastSelected)
      const currentIndex = allPaths.indexOf(item.path)
      const start = Math.min(lastIndex, currentIndex)
      const end = Math.max(lastIndex, currentIndex)
      const range = allPaths.slice(start, end + 1)
      setSelected(range)
    } else {
      setSelected([item.path])
    }
  }, [selected, sortedItems])

  // Handle double click to navigate or open
  const handleItemDoubleClick = useCallback((item) => {
    if (item.type === 'directory') {
      setCurrentPath(item.path)
      setSelected([])
    } else {
      openFile(item)
    }
  }, [openWindow])

  const openFile = (item) => {
    // If it's a directory, navigate into it
    if (item.type === 'directory') {
      setCurrentPath(item.path)
      return
    }

    const ext = item.name.toLowerCase().split('.').pop()

    // Image files → open ImageViewer
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico']
    if (imageExtensions.includes(ext)) {
      openWindow('ImageViewer', item.name, { width: 800, height: 600 }, {
        filePath: item.path,
        fileName: item.name
      })
      return
    }

    // PDF files → open PdfViewer
    if (ext === 'pdf') {
      openWindow('PdfViewer', item.name, { width: 900, height: 700 }, {
        filePath: item.path,
        fileName: item.name
      })
      return
    }

    // Text files → open in Notes
    const textExtensions = ['txt', 'md', 'json', 'js', 'py', 'html', 'css', 'xml', 'yaml', 'yml',
      'ts', 'tsx', 'jsx', 'sh', 'bat', 'ps1', 'cfg', 'ini', 'conf', 'log', 'env',
      'gitignore', 'editorconfig', 'prettierrc', 'eslintrc', 'c', 'cpp', 'h', 'java',
      'rs', 'go', 'rb', 'php', 'sql', 'csv', 'toml']
    if (textExtensions.includes(ext)) {
      axios.get(`/api/fs/read?path=${encodeURIComponent(item.path)}`)
        .then(res => {
          openWindow('Notes', item.name, { width: 700, height: 550 }, {
            content: res.data.content,
            filePath: item.path,
            fileName: item.name
          })
        })
        .catch(err => {
          setError(`Couldn't open ${item.name} — please try again`)
        })
      return
    }

    // Other files → offer download
    const downloadUrl = `/api/fs/view?path=${encodeURIComponent(item.path)}`
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = item.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Create file or folder
  const handleCreate = async () => {
    if (!createName.trim()) return

    try {
      await axios.post('/api/fs/create', {
        path: currentPath,
        name: createName.trim(),
        type: createDialog.type,
        content: createDialog.type === 'file' ? '' : undefined
      })
      setCreateDialog({ visible: false, type: 'file' })
      setCreateName('')
      fetchDirectory(currentPath)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create item')
    }
  }

  // Handle context menu
  const handleContextMenu = useCallback((item, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    if (!selected.includes(item.path)) {
      setSelected([item.path])
    }
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      item
    })
  }, [selected])

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  const handleContextAction = useCallback((action) => {
    const item = contextMenu.item

    if (action === 'newFile') {
      setCreateDialog({ visible: true, type: 'file' })
      setCreateName('')
      closeContextMenu()
      return
    }
    if (action === 'newFolder') {
      setCreateDialog({ visible: true, type: 'directory' })
      setCreateName('')
      closeContextMenu()
      return
    }
    if (action === 'refresh') {
      fetchDirectory(currentPath)
      closeContextMenu()
      return
    }

    if (action === 'paste') {
      if (clipboard.items.length > 0) {
        const promises = clipboard.items.map(clipItem => {
          const fileName = basenameFromPath(clipItem.path)
          const destPath = joinDisplayPath(currentPath, fileName)
          if (clipboard.mode === 'cut') {
            return axios.post('/api/fs/move', { sourcePath: clipItem.path, destPath })
          } else {
            return axios.post('/api/fs/copy', { sourcePath: clipItem.path, destPath })
          }
        })
        Promise.all(promises)
          .then(() => {
            if (clipboard.mode === 'cut') setClipboard({ items: [], mode: null })
            fetchDirectory(currentPath)
          })
          .catch(err => setError(err.response?.data?.error || 'Paste failed'))
      }
      closeContextMenu()
      return
    }

    if (!item) return

    switch (action) {
      case 'open':
        if (item.type === 'directory') {
          setCurrentPath(item.path)
        } else {
          openFile(item)
        }
        break
      case 'rename':
        openRename(item)
        break
      case 'delete':
        if (confirm(`Move "${item.name}" to Trash?`)) {
          axios.delete('/api/fs/delete', { data: { path: item.path } })
            .then(res => {
              setSelected([])
              fetchDirectory(currentPath)
              const id = res.data.id
              showToast(`Moved "${item.name}" to Trash`, {
                icon: '🗑️',
                duration: 8000,
                action: id ? {
                  label: 'Undo',
                  onClick: () => {
                    axios.post('/api/fs/trash/restore', { id })
                      .then(() => fetchDirectory(currentPath))
                      .catch(() => showToast("Couldn't restore — try from Trash", { icon: '⚠️' }))
                  }
                } : undefined
              })
            })
            .catch(err => setError(err.response?.data?.error || 'Move to Trash failed — please try again'))
        }
        break
      case 'copyPath':
        navigator.clipboard.writeText(item.path)
          .then(() => showToast('Path copied', { icon: '🔗', duration: 3000 }))
          .catch(() => {})
        break
      case 'copy':
        setClipboard({ items: [item], mode: 'copy' })
        showToast(`"${item.name}" ready to paste`, { icon: '📋', duration: 3000 })
        break
      case 'cut':
        setClipboard({ items: [item], mode: 'cut' })
        showToast(`"${item.name}" ready to move`, { icon: '✂️', duration: 3000 })
        break
      case 'properties':
        showToast(
          `${item.name} · ${item.type} · ${item.size ? formatSize(item.size) : 'N/A'}`,
          { icon: 'ℹ️', duration: 6000 }
        )
        break
      default:
        break
    }
    closeContextMenu()
  }, [contextMenu, currentPath, closeContextMenu, clipboard])

  // Handle drag and drop
  const handleDragStart = useCallback((item, event) => {
    dragItemRef.current = item
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDrop = useCallback((targetItem, event) => {
    event.preventDefault()
    if (!dragItemRef.current) return
    if (targetItem.type !== 'directory') return

    const source = dragItemRef.current
    const sourcePath = source.path
    // Guard: don't drop onto itself or into its own subtree
    if (sourcePath === targetItem.path || targetItem.path.startsWith(sourcePath + '/')) {
      dragItemRef.current = null
      return
    }
    const fileName = basenameFromPath(sourcePath)
    const destPath = joinDisplayPath(targetItem.path, fileName)

    axios.post('/api/fs/move', { sourcePath, destPath })
      .then(() => {
        fetchDirectory(currentPath)
        showToast(`Moved "${fileName}" to ${targetItem.name}`, { icon: '📁', duration: 3000 })
      })
      .catch(err => setError(err.response?.data?.error || 'Move failed'))

    dragItemRef.current = null
  }, [currentPath])

  // Paste clipboard contents into a target directory
  const pasteClipboard = useCallback((targetPath = currentPath) => {
    if (clipboard.items.length === 0) return
    const promises = clipboard.items.map(clipItem => {
      const fileName = basenameFromPath(clipItem.path)
      const destPath = joinDisplayPath(targetPath, fileName)
      if (clipboard.mode === 'cut') {
        return axios.post('/api/fs/move', { sourcePath: clipItem.path, destPath })
      }
      return axios.post('/api/fs/copy', { sourcePath: clipItem.path, destPath })
    })
    Promise.all(promises)
      .then(() => {
        if (clipboard.mode === 'cut') setClipboard({ items: [], mode: null })
        fetchDirectory(targetPath)
        showToast(`Pasted ${clipboard.items.length} item${clipboard.items.length > 1 ? 's' : ''}`, { icon: '📥', duration: 3000 })
      })
      .catch(err => setError(err.response?.data?.error || 'Paste failed'))
  }, [clipboard, currentPath])

  // Move one or more items to Trash (single-item gets Undo)
  const deleteItems = useCallback((targets) => {
    const list = Array.isArray(targets) ? targets : [targets]
    if (list.length === 0) return
    if (list.length === 1) {
      const item = list[0]
      axios.delete('/api/fs/delete', { data: { path: item.path } })
        .then(res => {
          setSelected([])
          fetchDirectory(currentPath)
          const id = res.data.id
          showToast(`Moved "${item.name}" to Trash`, {
            icon: '🗑️',
            duration: 8000,
            action: id ? {
              label: 'Undo',
              onClick: () => {
                axios.post('/api/fs/trash/restore', { id })
                  .then(() => fetchDirectory(currentPath))
                  .catch(() => showToast("Couldn't restore — try from Trash", { icon: '⚠️' }))
              }
            } : undefined
          })
        })
        .catch(err => setError(err.response?.data?.error || 'Move to Trash failed — please try again'))
      return
    }
    Promise.all(list.map(item => axios.delete('/api/fs/delete', { data: { path: item.path } })))
      .then(() => {
        setSelected([])
        fetchDirectory(currentPath)
        showToast(`Moved ${list.length} items to Trash`, { icon: '🗑️', duration: 5000 })
      })
      .catch(err => setError(err.response?.data?.error || 'Move to Trash failed — please try again'))
  }, [currentPath])

  // Inline rename dialog
  const openRename = useCallback((item) => {
    if (!item) return
    setRenameDialog({ visible: true, item })
    setRenameName(item.name)
  }, [])

  const submitRename = useCallback(() => {
    const item = renameDialog.item
    if (!item) return
    const newName = renameName.trim()
    if (!newName || newName === item.name) {
      setRenameDialog({ visible: false, item: null })
      return
    }
    axios.post('/api/fs/rename', { oldPath: item.path, newName })
      .then(() => {
        setRenameDialog({ visible: false, item: null })
        fetchDirectory(currentPath)
        showToast('Renamed', { icon: '✏️', duration: 3000 })
      })
      .catch(err => setError(err.response?.data?.error || 'Rename failed — please try again'))
  }, [renameDialog, renameName, currentPath])

  // Global keyboard shortcuts (scoped to the explorer window)
  const handleKeyboard = useCallback((e) => {
    const tag = (e.target.tagName || '').toUpperCase()
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (renameDialog.visible || createDialog.visible) return

    const selectedItems = sortedItems.filter(i => selected.includes(i.path))
    const ctrl = e.ctrlKey || e.metaKey

    if (ctrl && e.key.toLowerCase() === 'a') {
      e.preventDefault()
      setSelected(sortedItems.map(i => i.path))
    } else if (ctrl && e.key.toLowerCase() === 'c') {
      if (selectedItems.length) { setClipboard({ items: selectedItems, mode: 'copy' }); showToast(`${selectedItems.length} copied`, { icon: '📋', duration: 2500 }) }
    } else if (ctrl && e.key.toLowerCase() === 'x') {
      if (selectedItems.length) { setClipboard({ items: selectedItems, mode: 'cut' }); showToast(`${selectedItems.length} cut`, { icon: '✂️', duration: 2500 }) }
    } else if (ctrl && e.key.toLowerCase() === 'v') {
      pasteClipboard(currentPath)
    } else if (e.key === 'F2') {
      if (selectedItems.length === 1) openRename(selectedItems[0])
    } else if (e.key === 'Delete') {
      if (selectedItems.length) deleteItems(selectedItems)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      handleGoUp()
    } else if (e.key === 'Escape') {
      setSelected([])
    }
  }, [selected, sortedItems, renameDialog, createDialog, pasteClipboard, deleteItems, openRename, currentPath])

  // Navigate up
  const handleGoUp = async () => {
    if (currentPath === '/' || currentPath === '__drives__') return

    // If at a drive root like "C:/" go to drives view
    if (DRIVE_ROOT_RE.test(currentPath)) {
      try {
        const res = await axios.get('/api/fs/drives')
        if (res.data.drives?.length > 0) {
          setItems(res.data.drives)
          setCurrentPath('__drives__')
          setLoading(false)
        }
      } catch { setCurrentPath('/') }
      setSelected([])
      return
    }

    setCurrentPath(parentDisplayPath(currentPath))
    setSelected([])
  }

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (path) => {
    setCurrentPath(path)
    setSelected([])
  }

  // Parse path for breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (currentPath === '__drives__') {
      return [{ name: '💻 This PC', path: '__drives__' }]
    }
    if (DRIVE_PATH_RE.test(currentPath)) {
      const value = normalizeDisplayPath(currentPath)
      const [drive, ...parts] = value.replace(/\/+$/, '').split('/')
      const crumbs = [
        { name: 'ðŸ’» This PC', path: '__drives__' },
        { name: drive, path: `${drive}/` }
      ]
      let built = `${drive}/`
      parts.forEach(part => {
        built = joinDisplayPath(built, part)
        crumbs.push({ name: part, path: built })
      })
      return crumbs
    }

    const parts = currentPath.split('/').filter(Boolean)
    const crumbs = [{ name: '🏠 Home', path: '/' }]
    let path = ''
    parts.forEach(part => {
      path += `/${part}`
      crumbs.push({ name: part, path })
    })
    return crumbs
  }, [currentPath])

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="p-4">
      <div className="grid grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 w-12 bg-os-bg-tertiary rounded mx-auto mb-2" />
            <div className="h-3 bg-os-bg-tertiary rounded w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-os-bg-primary focus:outline-none" tabIndex={0} onKeyDown={handleKeyboard} onClick={closeContextMenu} onContextMenu={(e) => e.stopPropagation()}>
      {/* Error Banner — friendly, non-scary */}
      {error && (
        <div className="flex items-center justify-between px-4 py-2.5 min-h-[48px] bg-red-500/10 text-red-400 text-sm border-b border-red-500/20">
          <span>⚠️ {error}</span>
          <div className="flex gap-2 ml-3">
            <button
              onClick={() => { setError(null); fetchDirectory(currentPath) }}
              className="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 transition-colors"
            >
              Retry
            </button>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 w-6 h-6 flex items-center justify-center" aria-label="Dismiss">✕</button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-os-bg-secondary border-b border-os-border min-h-[48px]">
        {/* Navigation */}
        <button onClick={handleGoUp} disabled={currentPath === '/'} className="p-2 min-h-[36px] min-w-[36px] hover:bg-os-bg-tertiary rounded disabled:opacity-30 text-os-text-secondary flex items-center justify-center" title="Go up">
          ⬆️
        </button>
        <button onClick={() => fetchDirectory(currentPath)} className="p-2 min-h-[36px] min-w-[36px] hover:bg-os-bg-tertiary rounded text-os-text-secondary flex items-center justify-center" title="Refresh">
          🔄
        </button>
        <button onClick={() => { setCurrentPath('/'); setSearchQuery('') }} className="p-2 min-h-[36px] min-w-[36px] hover:bg-os-bg-tertiary rounded text-os-text-secondary flex items-center justify-center" title="Home">
          🏠
        </button>
        <button
          onClick={async () => {
            try {
              const res = await axios.get('/api/fs/drives')
              if (res.data.drives?.length > 0) {
                setItems(res.data.drives)
                setCurrentPath('__drives__')
                setLoading(false)
              }
            } catch { }
          }}
          className="p-1.5 hover:bg-os-bg-tertiary rounded text-os-text-secondary"
          title="This PC — Browse drives"
        >
          💻
        </button>

        {/* Search */}
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 bg-os-bg-tertiary rounded text-sm w-48 focus:outline-none focus:ring-1 focus:ring-os-accent text-os-text-primary"
        />

        <div className="flex-1" />

        {/* Create buttons */}
        <button
          onClick={() => { setCreateDialog({ visible: true, type: 'file' }); setCreateName('') }}
          className="px-3 py-2 min-h-[36px] text-xs bg-os-bg-tertiary hover:bg-os-accent/20 text-os-text-secondary hover:text-os-accent rounded transition-colors flex items-center gap-1"
        >
          <span>+</span><span>File</span>
        </button>
        <button
          onClick={() => { setCreateDialog({ visible: true, type: 'directory' }); setCreateName('') }}
          className="px-3 py-2 min-h-[36px] text-xs bg-os-bg-tertiary hover:bg-os-accent/20 text-os-text-secondary hover:text-os-accent rounded transition-colors flex items-center gap-1"
        >
          <span>+</span><span>Folder</span>
        </button>

        <div className="w-px h-5 bg-os-border mx-1" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-2 py-2 min-h-[36px] bg-os-bg-tertiary rounded text-sm text-os-text-primary"
        >
          <option value="name">Name</option>
          <option value="size">Size</option>
          <option value="modified">Modified</option>
        </select>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="px-2 py-2 min-h-[36px] text-sm hover:bg-os-bg-tertiary rounded text-os-text-secondary flex items-center"
        >
          {sortAsc ? '↑' : '↓'}
        </button>

        {/* View toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="p-1.5 hover:bg-os-bg-tertiary rounded text-os-text-secondary"
        >
          {viewMode === 'grid' ? '📋' : '📊'}
        </button>

        <div className="w-px h-5 bg-os-border mx-1" />

        {/* Hidden files toggle — paper feature: "Hidden Folders/Files Visibility" */}
        <button
          onClick={() => setShowHidden(!showHidden)}
          className={`px-3 py-2 min-h-[36px] text-xs rounded transition-all flex items-center gap-1 ${showHidden ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' : 'hover:bg-os-bg-tertiary text-os-text-secondary'}`}
          title={showHidden ? 'Hide hidden files' : 'Show hidden files'}
        >
          <span>{showHidden ? '👁️' : '👁️‍🗨️'}</span>
          <span>Hidden</span>
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-3 py-2 text-sm bg-os-bg-tertiary border-b border-os-border">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.path}>
            {i > 0 && <span className="text-os-text-secondary">/</span>}
            <button
              onClick={() => handleBreadcrumbClick(crumb.path)}
              className="hover:text-os-accent text-os-text-secondary hover:bg-os-bg-secondary px-1 rounded"
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - TreeView */}
        <div className="w-52 border-r border-os-border overflow-y-auto flex flex-col">
          <TreeView
            currentPath={currentPath}
            onNavigate={(path) => {
              setCurrentPath(path)
              setSelected([])
              setShowTrash(false)
              setShowRecent(false)
            }}
          />
          {/* Recent activity entry */}
          <button
            onClick={() => { setShowRecent(r => !r); setShowTrash(false) }}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm border-t border-os-border transition-colors
              ${showRecent ? 'text-os-accent bg-os-accent/10' : 'text-os-text-secondary hover:bg-os-bg-tertiary'}`}
          >
            <span className="text-base">🕐</span>
            <span>Recent</span>
          </button>
          {/* Trash entry at bottom of sidebar */}
          <button
            onClick={() => { setShowTrash(t => !t); setShowRecent(false) }}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm border-t border-os-border mt-auto transition-colors
              ${showTrash ? 'text-red-400 bg-red-500/10' : 'text-os-text-secondary hover:bg-os-bg-tertiary'}`}
          >
            <span className="text-base">🗑️</span>
            <span>Trash</span>
            {trashItems.length > 0 && (
              <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                {trashItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Panel — FileGrid or Trash */}
        <div
          className="flex-1 overflow-y-auto"
          onContextMenu={(e) => {
            if (showTrash) { e.preventDefault(); return }
            e.preventDefault()
            e.stopPropagation()
            setContextMenu({
              visible: true,
              x: e.clientX,
              y: e.clientY,
              item: null
            })
          }}
        >
          {showRecent ? (
            /* ── Recent Activity Panel ── */
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-os-text-primary">Recent Activity</h3>
                <button onClick={fetchRecent} className="text-xs px-2 py-1 rounded-lg hover:bg-os-bg-tertiary text-os-text-secondary transition-colors" title="Refresh">
                  🔄
                </button>
              </div>
              {recentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-os-text-secondary">
                  <span className="text-4xl mb-3">🕐</span>
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentItems.map(item => {
                    const actionIcon = item.action === 'create' ? '✨' : item.action === 'delete' ? '🗑️' : item.action === 'write' ? '✏️' : '📄'
                    const relTime = (() => {
                      const diff = Date.now() - new Date(item.timestamp).getTime()
                      if (diff < 60000) return 'just now'
                      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
                      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
                      return new Date(item.timestamp).toLocaleDateString()
                    })()
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-os-bg-tertiary transition-colors cursor-pointer min-h-[44px]"
                        onClick={() => {
                          if (item.action !== 'delete') {
                            const dir = parentDisplayPath(item.path)
                            setCurrentPath(dir)
                            setShowRecent(false)
                          }
                        }}
                        title={item.action !== 'delete' ? 'Navigate to location' : ''}
                      >
                        <span className="text-sm flex-shrink-0">{actionIcon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-os-text-primary truncate">
                            {basenameFromPath(item.path)}
                          </p>
                          <p className="text-[11px] text-os-text-secondary truncate">{item.path}</p>
                        </div>
                        <span className="text-[11px] text-os-text-secondary flex-shrink-0">{relTime}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : showTrash ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-os-text-primary">Trash</h3>
                {trashItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Permanently delete all items in Trash? This cannot be undone.')) {
                        axios.post('/api/fs/trash/empty')
                          .then(() => fetchTrash())
                          .catch(() => showToast("Couldn't empty Trash — please try again", { icon: '⚠️' }))
                      }
                    }}
                    className="text-xs px-3 min-h-[36px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Empty Trash
                  </button>
                )}
              </div>
              {trashItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-os-text-secondary">
                  <span className="text-4xl mb-3">🗑️</span>
                  <p className="text-sm">Trash is empty</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trashItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-os-border bg-os-bg-secondary hover:bg-os-bg-tertiary transition-colors"
                    >
                      <span className="text-lg flex-shrink-0">{item.type === 'directory' ? '📁' : '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-os-text-primary truncate">
                          {item.trashedName.replace(/^[^_]+_[^_]+__/, '')}
                        </p>
                        <p className="text-[11px] text-os-text-secondary truncate">{item.originalPath}</p>
                        <p className="text-[11px] text-os-text-secondary">
                          {new Date(item.deletedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            axios.post('/api/fs/trash/restore', { id: item.id })
                              .then(res => {
                                fetchTrash()
                                fetchDirectory(currentPath)
                                showToast(`Restored to ${res.data.restoredTo}`, { icon: '✅', duration: 4000 })
                              })
                              .catch(() => showToast("Couldn't restore — please try again", { icon: '⚠️' }))
                          }
                          className="text-xs px-2.5 min-h-[40px] rounded-lg bg-os-accent/10 text-os-accent hover:bg-os-accent/20 transition-colors"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete "${item.trashedName.replace(/^[^_]+_[^_]+__/, '')}"? This cannot be undone.`)) {
                              axios.post('/api/fs/trash/delete', { id: item.id })
                                .then(() => fetchTrash())
                                .catch(() => showToast("Couldn't delete — please try again", { icon: '⚠️' }))
                            }
                          }}
                          className="text-xs px-2.5 min-h-[40px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Delete forever
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : loading ? (
            renderLoadingSkeleton()
          ) : (
            <FileGrid
              items={sortedItems}
              viewMode={viewMode}
              selected={selected}
              onSelect={(item, event) => handleItemClick(item, event)}
              onOpen={handleItemDoubleClick}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          )}
        </div>
      </div>

      {/* Context Menu (Portaled to document.body to ignore parent transform coordinate systems) */}
      {contextMenu.visible && createPortal(
        <div
          className="fixed bg-os-bg-secondary border border-os-border rounded-lg shadow-lg py-1 z-[99999] min-w-[180px] select-none"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 190),
            top: Math.min(contextMenu.y, window.innerHeight - 260)
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {contextMenu.item ? (
            <>
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('open')}>
                {contextMenu.item.type === 'directory' ? '📂 Open' : '📄 Open'}
              </button>
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('rename')}>
                ✏️ Rename
              </button>
              <div className="border-t border-os-border my-1" />
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('copy')}>
                📋 Copy
              </button>
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('cut')}>
                ✂️ Cut
              </button>
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('copyPath')}>
                🔗 Copy Path
              </button>
              <div className="border-t border-os-border my-1" />
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('properties')}>
                ℹ️ Properties
              </button>
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-red-500/20 text-red-400 flex items-center gap-2" onClick={() => handleContextAction('delete')}>
                🗑️ Move to Trash
              </button>
            </>
          ) : (
            <>
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('newFile')}>
                📄 New File
              </button>
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('newFolder')}>
                📁 New Folder
              </button>
              {clipboard.items.length > 0 && (
                <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-accent font-medium flex items-center gap-2" onClick={() => handleContextAction('paste')}>
                  📥 Paste {clipboard.mode === 'cut' ? '(Move)' : '(Copy)'}
                </button>
              )}
              <div className="border-t border-os-border my-1" />
              <button className="w-full px-4 py-3 min-h-[44px] text-left text-sm hover:bg-os-bg-tertiary text-os-text-primary flex items-center gap-2" onClick={() => handleContextAction('refresh')}>
                🔄 Refresh
              </button>
            </>
          )}
        </div>,
        document.body
      )}

      {/* Create Dialog */}
      {createDialog.visible && (
        <div className="fixed inset-0 bg-backdrop flex items-center justify-center z-[100]" onClick={() => setCreateDialog({ visible: false, type: 'file' })}>
          <div className="bg-os-bg-secondary border border-bd rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-os-text-primary mb-4">
              {createDialog.type === 'file' ? '📄 New File' : '📁 New Folder'}
            </h3>
            <input
              type="text"
              placeholder={createDialog.type === 'file' ? 'filename.txt' : 'folder name'}
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full px-3 py-2 bg-os-bg-tertiary border border-os-border rounded-lg text-os-text-primary focus:outline-none focus:ring-1 focus:ring-os-accent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setCreateDialog({ visible: false, type: 'file' })} className="px-4 py-2 text-sm text-os-text-secondary hover:bg-os-bg-tertiary rounded-lg">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={!createName.trim()} className="px-4 py-2 text-sm bg-os-accent text-white rounded-lg hover:brightness-110 disabled:opacity-50">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {renameDialog.visible && (
        <div className="fixed inset-0 bg-backdrop flex items-center justify-center z-[100]" onClick={() => setRenameDialog({ visible: false, item: null })}>
          <div className="bg-os-bg-secondary border border-bd rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-os-text-primary mb-4">✏️ Rename</h3>
            <input
              type="text"
              value={renameName}
              onChange={e => setRenameName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenameDialog({ visible: false, item: null }) }}
              className="w-full px-3 py-2 bg-os-bg-tertiary border border-os-border rounded-lg text-os-text-primary focus:outline-none focus:ring-1 focus:ring-os-accent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRenameDialog({ visible: false, item: null })} className="px-4 py-2 text-sm text-os-text-secondary hover:bg-os-bg-tertiary rounded-lg">
                Cancel
              </button>
              <button onClick={submitRename} disabled={!renameName.trim()} className="px-4 py-2 text-sm bg-os-accent text-white rounded-lg hover:brightness-110 disabled:opacity-50">
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="flex items-center justify-between px-3 py-1 text-xs text-os-text-secondary bg-os-bg-secondary border-t border-os-border">
        <span>
          {selected.length > 0
            ? `${selected.length} selected`
            : `${items.length} items`}
        </span>
        <span>{currentPath}</span>
      </div>
    </div>
  )
}

export default FileExplorer
