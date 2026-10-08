let handsScriptPromise = null

function getHandsCtorFrom(...sources) {
  const candidates = []

  for (const source of sources) {
    if (!source) continue
    candidates.push(
      source,
      source.Hands,
      source.default,
      source.default?.Hands,
      source['module.exports'],
      source['module.exports']?.Hands
    )
  }

  return candidates.find((candidate) => typeof candidate === 'function') || null
}

function loadLocalHandsScript() {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('MediaPipe Hands can only load in a browser'))
  }

  if (!handsScriptPromise) {
    handsScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-mediapipe-hands="true"]')
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve()
          return
        }
        existing.addEventListener('load', resolve, { once: true })
        existing.addEventListener('error', () => reject(new Error('Failed to load MediaPipe Hands script')), { once: true })
        return
      }

      const script = document.createElement('script')
      script.src = '/mediapipe-hands/hands.js'
      script.async = true
      script.dataset.mediapipeHands = 'true'
      script.onload = () => {
        script.dataset.loaded = 'true'
        resolve()
      }
      script.onerror = () => reject(new Error('Failed to load MediaPipe Hands script'))
      document.head.appendChild(script)
    })
  }

  return handsScriptPromise
}

export async function loadMediaPipeHandsCtor() {
  const globalScope = typeof window !== 'undefined' ? window : globalThis
  let HandsCtor = getHandsCtorFrom(globalScope.Hands, globalScope)
  if (HandsCtor) return HandsCtor

  try {
    const mod = await import('@mediapipe/hands')
    HandsCtor = getHandsCtorFrom(mod)
    if (HandsCtor) return HandsCtor
  } catch (err) {
    console.warn('[MediaPipe] npm Hands import failed, trying local script:', err)
  }

  await loadLocalHandsScript()
  HandsCtor = getHandsCtorFrom(globalScope.Hands, globalScope)
  if (!HandsCtor) {
    throw new Error('MediaPipe Hands constructor not found')
  }

  return HandsCtor
}
