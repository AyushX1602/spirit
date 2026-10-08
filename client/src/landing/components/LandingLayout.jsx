import React, { useEffect } from 'react'
import '../landing.css'

/**
 * LandingLayout — wraps every landing page in the .landing-root div.
 *
 * On mount:  overrides body background/color/overflow so Spirit OS's
 *            global CSS (overflow:hidden, lavender bg) doesn't bleed in.
 * On unmount: restores original body styles when user navigates to /app.
 */
export default function LandingLayout({ children }) {
  useEffect(() => {
    const prev = {
      bg:       document.body.style.background,
      color:    document.body.style.color,
      font:     document.body.style.fontFamily,
      overflow: document.body.style.overflow,
    }

    // Landing page needs scrolling + cream background
    document.body.style.background   = '#f5f5f2'
    document.body.style.color        = 'rgba(38,35,35,0.8)'
    document.body.style.fontFamily   = "'TT Neoris', system-ui, sans-serif"
    document.body.style.overflow     = 'auto'

    return () => {
      // Restore Spirit OS styles
      document.body.style.background   = prev.bg
      document.body.style.color        = prev.color
      document.body.style.fontFamily   = prev.font
      document.body.style.overflow     = prev.overflow
    }
  }, [])

  return (
    <div className="landing-root">
      {children}
    </div>
  )
}

