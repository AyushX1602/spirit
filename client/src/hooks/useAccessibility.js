import { useEffect } from 'react'
import useOsStore from '../store/osStore'

/**
 * Custom hook to apply theme, accessibility profile flags, and CSS variables.
 * Reads ALL accessibility flags from osStore and reflects them as body classes
 * so CSS rules (.large-targets, .simplified-ui, etc.) and components can react.
 */
function useAccessibility() {
  const {
    profile, fontSize, fontWeight, contrast, cursorSize, theme,
    // A4: profile flags previously never wired to the DOM
    simplifiedUI, largeTargets, dwellClick, stickyKeys,
    screenReaderHints, animationsReduced, highContrast
  } = useOsStore()

  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // Apply theme as body class (for CSS selectors)
    body.classList.remove('theme-dark', 'theme-light')
    body.classList.add(`theme-${theme}`)

    // Font size scaling via CSS variable
    const fontSizeMap = {
      normal: '1',
      large: '1.25',
      xl: '1.5'
    }
    root.style.setProperty('--font-scale', fontSizeMap[fontSize] || '1')

    const fontWeightMap = {
      normal: '400',
      medium: '500',
      bold: '600'
    }
    root.style.setProperty('--font-weight', fontWeightMap[fontWeight] || '400')

    // High contrast — driven by store flag OR contrast==='high'.
    // highContrast is set by visually-impaired profile; contrast='high' by elderly.
    body.classList.toggle('high-contrast', !!(highContrast || contrast === 'high'))

    // Cursor size
    body.classList.toggle('cursor-large', cursorSize === 'large')

    // A4: Reduced animations — driven by animationsReduced store flag (set by applyProfile).
    // Previously hardcoded to profile names, which broke when profile flags weren't applied.
    body.classList.toggle('reduced-animations', !!animationsReduced)

    // A4: Profile-specific accessibility body classes.
    // CSS rules for these live in index.css (e.g. .large-targets button { min-height: 44px })
    body.classList.toggle('simplified-ui', !!simplifiedUI)
    body.classList.toggle('large-targets',  !!largeTargets)
    body.classList.toggle('dwell-click',    !!dwellClick)
    body.classList.toggle('sticky-keys',    !!stickyKeys)
    body.classList.toggle('sr-hints',       !!screenReaderHints)

  }, [profile, fontSize, fontWeight, contrast, cursorSize, theme,
      simplifiedUI, largeTargets, dwellClick, stickyKeys,
      screenReaderHints, animationsReduced, highContrast])
}

export default useAccessibility