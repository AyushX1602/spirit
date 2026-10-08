/**
 * client/src/components/ErrorBoundary.jsx — T4
 *
 * Classic React class error boundary (hooks cannot catch render errors).
 * Catches render errors in any wrapped child subtree, shows an accessible
 * fallback, and fires the OS notification so the user knows something failed.
 *
 * Props:
 *   label    — short name for the crash report (app title / controller name)
 *   onError  — optional callback(error, info, label) for toast dispatch
 *   fallback — optional custom ReactNode fallback
 *   compact  — if true, renders a slim inline fallback (input controllers)
 */

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleReload = this.handleReload.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    const label = this.props.label || 'Unknown'
    console.error(`[ErrorBoundary] "${label}" crashed:`, error, info.componentStack)

    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, info, label)
      } catch (_) { /* never let the callback crash the boundary */ }
    }
  }

  handleReload() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    const label = this.props.label || 'This app'

    // ── Compact: for input controllers mounted outside any window ─────────
    if (this.props.compact) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          tabIndex={0}
          style={{
            position: 'fixed', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            zIndex: 99999, padding: '6px 12px',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 8, fontSize: 12, color: '#fca5a5',
            display: 'flex', alignItems: 'center', gap: 8,
            backdropFilter: 'blur(8px)'
          }}
        >
          <span>⚠️</span>
          <span>{label} failed</span>
          <button
            onClick={this.handleReload}
            aria-label={`Retry ${label}`}
            style={{
              marginLeft: 'auto', background: 'rgba(239,68,68,0.2)',
              border: 'none', borderRadius: 4, color: '#fca5a5',
              cursor: 'pointer', padding: '2px 8px', fontSize: 11
            }}
          >
            Retry
          </button>
        </div>
      )
    }

    // ── Full: for app windows ─────────────────────────────────────────────
    return (
      <div
        role="alert"
        aria-live="assertive"
        tabIndex={0}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', padding: 32, gap: 16,
          textAlign: 'center',
          background: 'var(--os-bg-primary, #0f172a)',
          color: 'var(--os-text-primary, #e2e8f0)'
        }}
      >
        <span style={{ fontSize: 40 }}>💥</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {label} hit an error
        </h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.6, maxWidth: 320 }}>
          {this.state.error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={this.handleReload}
          aria-label={`Reload ${label}`}
          autoFocus
          style={{
            marginTop: 8, padding: '8px 20px', borderRadius: 8,
            border: '1px solid rgba(99,102,241,0.4)',
            background: 'rgba(99,102,241,0.1)', color: '#818cf8',
            cursor: 'pointer', fontSize: 14, fontWeight: 500
          }}
        >
          Reload
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
