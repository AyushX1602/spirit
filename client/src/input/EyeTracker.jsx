import React, { useEffect, useRef, useState, useCallback } from 'react'
// FaceLandmarker is loaded dynamically at runtime (not bundled)
// to prevent Emscripten Module.arguments conflict with @mediapipe/hands.
import useOsStore from '../store/osStore'
import { acquireCamera, releaseCamera } from './sharedCamera'

/**
 * EyeTracker — Iris gaze tracking via MediaPipe FaceLandmarker
 * Uses @mediapipe/tasks-vision (no WebGazer, no TF.js conflict).
 *
 * Iris landmarks: 468 = left iris center, 473 = right iris center
 * Calibration: 9-point click-while-looking → linear regression iris→screen
 *
 * WASM + model both loaded from the same CDN to avoid version mismatch.
 * The noExitRuntime error occurs when npm WASM (0.10.35) is mixed with
 * a newer CDN model — using the CDN for both resolves this.
 */

const CAL_PTS = [
  {x:0.1,y:0.1},{x:0.5,y:0.1},{x:0.9,y:0.1},
  {x:0.1,y:0.5},{x:0.5,y:0.5},{x:0.9,y:0.5},
  {x:0.1,y:0.9},{x:0.5,y:0.9},{x:0.9,y:0.9},
]

// Load WASM from CDN so it always matches the model version and avoids
// Module.arguments conflicts caused by @mediapipe/hands sharing the same
// Emscripten Module object.
const TASKS_VISION_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const FACE_LANDMARKER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

// Singleton: only one FilesetResolver + FaceLandmarker instance across hot-reloads
let _visionFileset = null
let _faceLandmarkerSingleton = null

const IRIS_SMOOTHING_ALPHA = 0.08
const SCREEN_SMOOTHING_ALPHA = 0.18
const SCREEN_DEADZONE_PX = 14
const MAX_CURSOR_STEP_PX = 90

// ── Lazy-load @mediapipe/tasks-vision dynamically ───────────────────────────
// Using a local npm import via dynamic import() keeps it out of the main chunk
// while still avoiding the CDN CORS issues. The optimizeDeps.exclude in
// vite.config.js ensures it won't be pre-bundled with @mediapipe/hands.
let _tasksVisionPromise = null
function getTasksVision() {
  if (!_tasksVisionPromise) {
    _tasksVisionPromise = import('@mediapipe/tasks-vision').catch(err => {
      _tasksVisionPromise = null
      throw err
    })
  }
  return _tasksVisionPromise
}

async function createFaceLandmarker(delegate) {
  const { FaceLandmarker, FilesetResolver } = await getTasksVision()
  if (typeof window !== 'undefined') {
    window.Module = undefined;
  }
  if (!_visionFileset) {
    _visionFileset = await FilesetResolver.forVisionTasks(TASKS_VISION_CDN)
  }
  if (typeof window !== 'undefined') {
    window.Module = undefined;
  }
  return FaceLandmarker.createFromOptions(_visionFileset, {
    baseOptions: {
      modelAssetPath: FACE_LANDMARKER_MODEL,
      ...(delegate ? { delegate } : {}),
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })
}

async function loadFaceLandmarker() {
  // Return existing instance if still alive
  if (_faceLandmarkerSingleton) return _faceLandmarkerSingleton
  try {
    if (typeof window !== 'undefined') {
      window.Module = undefined;
    }
    _faceLandmarkerSingleton = await createFaceLandmarker('GPU')
    return _faceLandmarkerSingleton
  } catch (gpuErr) {
    const msg = gpuErr.message || ''
    // Module.arguments conflict or GPU init failure → fall back to CPU
    console.warn('[EyeTracker] GPU FaceLandmarker failed; retrying with CPU:', msg)
    try {
      if (typeof window !== 'undefined') {
        window.Module = undefined;
      }
      _faceLandmarkerSingleton = await createFaceLandmarker(null)
      return _faceLandmarkerSingleton
    } catch (cpuErr) {
      _visionFileset = null  // reset so next retry re-creates fileset
      throw cpuErr
    }
  }
}

// Gaussian elimination for 3×3 system
function solve3(A, b) {
  const M = A.map((r,i) => [...r, b[i]])
  for (let c=0;c<3;c++) {
    let mx=c; for(let r=c+1;r<3;r++) if(Math.abs(M[r][c])>Math.abs(M[mx][c])) mx=r
    ;[M[c],M[mx]]=[M[mx],M[c]]
    for(let r=c+1;r<3;r++){const f=M[r][c]/M[c][c];for(let j=c;j<=3;j++) M[r][j]-=f*M[c][j]}
  }
  const x=[0,0,0]
  for(let i=2;i>=0;i--){x[i]=M[i][3];for(let j=i+1;j<3;j++)x[i]-=M[i][j]*x[j];x[i]/=M[i][i]}
  return x
}

// Least-squares linear fit: screen = a*ix + b*iy + c
function fitModel(irisPts, screenPts) {
  const X = irisPts.map(p=>[p.x,p.y,1])
  const XtX=[[0,0,0],[0,0,0],[0,0,0]], XtYx=[0,0,0], XtYy=[0,0,0]
  X.forEach((row,i)=>{
    for(let r=0;r<3;r++){
      XtYx[r]+=row[r]*screenPts[i].x; XtYy[r]+=row[r]*screenPts[i].y
      for(let c=0;c<3;c++) XtX[r][c]+=row[r]*row[c]
    }
  })
  return { cx: solve3(XtX, XtYx), cy: solve3(XtX, XtYy) }
}

function applyModel(model, iris) {
  const {cx,cy}=model
  return {
    x: Math.round(cx[0]*iris.x+cx[1]*iris.y+cx[2]),
    y: Math.round(cy[0]*iris.x+cy[1]*iris.y+cy[2]),
  }
}

function limitStep(prev, next, maxStep) {
  if (!prev) return next
  const dx = next.x - prev.x
  const dy = next.y - prev.y
  const dist = Math.hypot(dx, dy)
  if (dist <= maxStep) return next
  const scale = maxStep / dist
  return {
    x: prev.x + dx * scale,
    y: prev.y + dy * scale
  }
}

// ─────────────────────────────────────────────

function getCursorDetails(x, y) {
  const el = document.elementFromPoint(x, y)
  if (!el) return { type: 'default', icon: null }

  const style = window.getComputedStyle(el)
  const cursor = style.cursor

  if (cursor === 'pointer')     return { type: 'pointer', icon: '👆' }
  if (cursor === 'text')        return { type: 'text', icon: '🔤' }
  if (cursor === 'grab')        return { type: 'grab', icon: '🖐️' }
  if (cursor === 'grabbing')    return { type: 'grabbing', icon: '✊' }
  if (cursor === 'not-allowed') return { type: 'not-allowed', icon: '🚫' }
  if (cursor === 'zoom-in')     return { type: 'zoom-in', icon: '🔍' }
  if (cursor === 'zoom-out')    return { type: 'zoom-out', icon: '🔍' }

  // Fast fallback tag checks
  const tag = el.tagName.toLowerCase()
  if (tag === 'button' || tag === 'a' || el.closest('button') || el.closest('a') || el.getAttribute('role') === 'button') {
    return { type: 'pointer', icon: '👆' }
  }
  if (tag === 'input' || tag === 'textarea' || el.closest('input') || el.closest('textarea')) {
    const inputType = el.getAttribute('type')
    if (!['button', 'submit', 'checkbox', 'radio'].includes(inputType)) {
      return { type: 'text', icon: '🔤' }
    }
  }

  return { type: 'default', icon: null }
}

export default function EyeTracker() {
  const [isActive, setIsActive]       = useState(false)
  const [status, setStatus]           = useState('idle') // idle|loading|active
  const [error, setError]             = useState(null)
  const [retryCount, setRetryCount]   = useState(0)
  const [calibrating, setCalibrating] = useState(false)
  const [calStep, setCalStep]         = useState(0)
  const [calClicks, setCalClicks]     = useState(0)
  const [calibrated, setCalibrated]   = useState(false)
  const [gazeHz, setGazeHz]           = useState(0)
  const [noFace, setNoFace]           = useState(false)
  const [cursorStyle, setCursorStyle] = useState({ type: 'default', icon: null })

  const videoRef      = useRef(null)
  const previewRef    = useRef(null)
  const animRef       = useRef(null)
  const hzIntervalRef = useRef(null)
  const faceLMRef     = useRef(null)
  const modelRef      = useRef(null)       // regression model
  const gazeRef         = useRef({ x: window.innerWidth/2, y: window.innerHeight/2 })
  const smoothScreenRef = useRef({ x: window.innerWidth/2, y: window.innerHeight/2 })
  const gazeCountRef    = useRef(0)
  const noFaceCountRef  = useRef(0)
  const noFaceVisibleRef = useRef(false)
  const irisNowRef      = useRef(null)   // latest iris reading for calibration capture
  const smoothedIrisRef = useRef(null)   // EMA-smoothed iris position
  const calDataRef      = useRef({ iris:[], screen:[] })
  const hasCameraRef    = useRef(false)
  // dwell: tracks zone entry time, whether single click fired, and double-click timer
  const dwellRef        = useRef({ x:0, y:0, entryTime: Date.now(), singleFired: false, doubleFired: false })
  const lastStyleCheckRef = useRef(0)
  const cursorStyleRef = useRef({ type: 'default', icon: null })
  // Ref mirrors for values read inside the RAF loop to avoid stale closures
  const calibratingRef       = useRef(false)
  const eyeTrackingEnabledRef = useRef(false)

  const { eyeTrackingEnabled, setEyeTrackingEnabled, addNotification } = useOsStore()
  // Keep ref mirrors in sync with state/store values
  calibratingRef.current = calibrating
  eyeTrackingEnabledRef.current = eyeTrackingEnabled

  // ── cursor via direct DOM ──
  const moveCursor = useCallback((x, y) => {
    gazeRef.current = { x, y }
    gazeCountRef.current++
    const el = document.getElementById('gaze-cursor')
    if (el) { el.style.left = x+'px'; el.style.top = y+'px' }

    // Periodically sample hovered element computed style to avoid layout thrashing
    const now = Date.now()
    if (now - lastStyleCheckRef.current > 100) {
      lastStyleCheckRef.current = now
      const details = getCursorDetails(x, y)
      const current = cursorStyleRef.current
      if (details.type !== current.type || details.icon !== current.icon) {
        cursorStyleRef.current = details
        setCursorStyle(details)
      }
    }
  }, [])

  // ── cleanup ──
  const releaseEyeCamera = useCallback(() => {
    if (hasCameraRef.current) {
      releaseCamera()
      hasCameraRef.current = false
    }
    if (videoRef.current) videoRef.current.srcObject = null
    if (previewRef.current) previewRef.current.srcObject = null
  }, [])

  const cleanup = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = null
    clearInterval(hzIntervalRef.current)
    hzIntervalRef.current = null
    if (faceLMRef.current) {
      try { faceLMRef.current.close() } catch(_){}
      faceLMRef.current = null
      _faceLandmarkerSingleton = null  // allow fresh init on next enable
    }
    releaseEyeCamera()
    modelRef.current = null
    calDataRef.current = { iris:[], screen:[] }
    irisNowRef.current = null
    smoothedIrisRef.current = null
    smoothScreenRef.current = { x: window.innerWidth/2, y: window.innerHeight/2 }
    noFaceVisibleRef.current = false
    cursorStyleRef.current = { type: 'default', icon: null }
    dwellRef.current = { x:0, y:0, entryTime: Date.now(), singleFired: false, doubleFired: false }
    setIsActive(false); setStatus('idle'); setCalibrating(false)
    setCalibrated(false); setGazeHz(0); setNoFace(false)
    setCalStep(0); setCalClicks(0)
  }, [releaseEyeCamera])

  const closeEyeTracker = useCallback(() => {
    cleanup()
    setEyeTrackingEnabled(false)
    addNotification('Eye tracking stopped', 'info')
  }, [cleanup, setEyeTrackingEnabled, addNotification])

  useEffect(() => {
    if (!isActive || !previewRef.current || !videoRef.current?.srcObject) return
    previewRef.current.srcObject = videoRef.current.srcObject
    previewRef.current.play().catch(() => {})
  }, [isActive])

  // ── main init ──
  useEffect(() => {
    if (!eyeTrackingEnabled) { cleanup(); return }
    let cancelled = false

    const init = async () => {
      setError(null); setStatus('loading')

      // 1. Camera
      let stream
      try { stream = await acquireCamera() } catch(e) {
        setError(
          e.name==='NotAllowedError' ? 'Camera permission denied — allow and retry.' :
          e.name==='NotReadableError'? 'Camera in use by another app — close it and retry.' :
          'Camera error: ' + e.message
        ); return
      }
      hasCameraRef.current = true
      if (cancelled) { releaseEyeCamera(); return }
      if (!videoRef.current) { releaseEyeCamera(); return }
      videoRef.current.srcObject = stream
      await new Promise(r => { videoRef.current.onloadedmetadata = r })
      await videoRef.current.play().catch(()=>{})
      if (previewRef.current) {
        previewRef.current.srcObject = stream
        previewRef.current.play().catch(() => {})
      }

      // 2. MediaPipe FaceLandmarker
      try {
        faceLMRef.current = await loadFaceLandmarker()
      } catch(e) { setError('FaceLandmarker load failed: ' + e.message); releaseEyeCamera(); return }
      if (cancelled) { cleanup(); return }

      console.log('[EyeTracker] ✅ MediaPipe FaceLandmarker ready')
      setIsActive(true); setStatus('active')
      addNotification('Eye tracking started — calibrate for accuracy', 'info')
      setCalibrating(true); setCalStep(0); setCalClicks(0)
      calDataRef.current = { iris:[], screen:[] }

      // 3. RAF detection loop
      let lastTs = 0
      const loop = (ts) => {
        if (cancelled || !eyeTrackingEnabledRef.current || !faceLMRef.current) return
        animRef.current = requestAnimationFrame(loop)
        if (!videoRef.current || videoRef.current.readyState < 2) return
        if (ts - lastTs < 33) return // ~30fps cap
        lastTs = ts

        try {
          const results = faceLMRef.current.detectForVideo(videoRef.current, ts)
          if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
            noFaceCountRef.current++
            if (noFaceCountRef.current > 30 && !noFaceVisibleRef.current) {
              noFaceVisibleRef.current = true
              setNoFace(true)
            }
            irisNowRef.current = null
            return
          }
          noFaceCountRef.current = 0
          if (noFaceVisibleRef.current) {
            noFaceVisibleRef.current = false
            setNoFace(false)
          }

          const lm = results.faceLandmarks[0]
          // Left iris center=468, Right iris center=473
          const li = lm[468], ri = lm[473]
          const rawIris = { x: (li.x + ri.x) / 2, y: (li.y + ri.y) / 2 }

          // Low alpha means stronger smoothing and less jitter.
          if (!smoothedIrisRef.current) smoothedIrisRef.current = { ...rawIris }
          smoothedIrisRef.current = {
            x: IRIS_SMOOTHING_ALPHA * rawIris.x + (1 - IRIS_SMOOTHING_ALPHA) * smoothedIrisRef.current.x,
            y: IRIS_SMOOTHING_ALPHA * rawIris.y + (1 - IRIS_SMOOTHING_ALPHA) * smoothedIrisRef.current.y,
          }
          irisNowRef.current = smoothedIrisRef.current

          // ── Face-depth for Interactive Reading ──
          // Calculate depth using inter-eye distance (same formula as Innerve)
          // W = 6.3cm average inter-eye width, f = 500 focal length
          const leftEye = lm[33]   // left eye outer corner
          const rightEye = lm[263] // right eye outer corner
          if (leftEye && rightEye) {
            const eyePixelDist = Math.sqrt(
              Math.pow((rightEye.x - leftEye.x) * (videoRef.current?.videoWidth || 640), 2) +
              Math.pow((rightEye.y - leftEye.y) * (videoRef.current?.videoHeight || 480), 2)
            )
            if (eyePixelDist > 0) {
              const depthCm = (6.3 * 500) / eyePixelDist
              // Scale: at 50cm → 1.0, closer → larger, farther → smaller
              // Clamped between 0.6 and 2.0
              const rawScale = 50 / Math.max(depthCm, 10)
              const zoomScale = Math.max(0.6, Math.min(2.0, rawScale))
              // Dispatch custom event for any listening app
              window.dispatchEvent(new CustomEvent('spiritos:face-depth', {
                detail: { depth: depthCm, zoomScale }
              }))
            }
          }

          if (modelRef.current && !calibratingRef.current) {
            const screen = applyModel(modelRef.current, smoothedIrisRef.current)
            const cw = window.innerWidth, ch = window.innerHeight
            const target = {
              x: Math.max(0, Math.min(cw, screen.x)),
              y: Math.max(0, Math.min(ch, screen.y))
            }
            const prevSmooth = smoothScreenRef.current
            const eased = {
              x: SCREEN_SMOOTHING_ALPHA * target.x + (1 - SCREEN_SMOOTHING_ALPHA) * prevSmooth.x,
              y: SCREEN_SMOOTHING_ALPHA * target.y + (1 - SCREEN_SMOOTHING_ALPHA) * prevSmooth.y
            }
            const limited = limitStep(prevSmooth, eased, MAX_CURSOR_STEP_PX)
            smoothScreenRef.current = limited

            const prev = gazeRef.current
            if (
              Math.abs(limited.x - prev.x) > SCREEN_DEADZONE_PX ||
              Math.abs(limited.y - prev.y) > SCREEN_DEADZONE_PX
            ) {
              moveCursor(Math.round(limited.x), Math.round(limited.y))
            }
          }
        } catch(e) {
          console.warn('[EyeTracker] detect error:', e.message)
        }
      }
      animRef.current = requestAnimationFrame(loop)

      // Hz counter
      hzIntervalRef.current = setInterval(() => {
        setGazeHz(gazeCountRef.current); gazeCountRef.current = 0
      }, 1000)
    }

    init()
    return () => { cancelled = true; cleanup() }
  }, [eyeTrackingEnabled, retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── dwell click + double-click loop ──
  useEffect(() => {
    if (!isActive || !calibrated) return
    const ZONE = 45         // px radius — gaze must stay within this zone
    const SINGLE_MS = 1500  // ms dwell → single click
    const DOUBLE_MS = 2700  // ms dwell → double click (1.2s after single)

    const tick = () => {
      const { x, y } = gazeRef.current
      const now = Date.now()
      const dx = Math.abs(x - dwellRef.current.x)
      const dy = Math.abs(y - dwellRef.current.y)

      if (dx > ZONE || dy > ZONE) {
        // Gaze moved — reset zone
        dwellRef.current = { x, y, entryTime: now, singleFired: false, doubleFired: false }
        return
      }

      const elapsed = now - dwellRef.current.entryTime
      const el = document.elementFromPoint(x, y)
      if (!el) return

      // Single click at SINGLE_MS
      if (!dwellRef.current.singleFired && elapsed >= SINGLE_MS) {
        dwellRef.current.singleFired = true
        el.dispatchEvent(new MouseEvent('click', { clientX:x, clientY:y, bubbles:true, cancelable:true }))
      }

      // Double click at DOUBLE_MS (fires two clicks + dblclick 80ms apart)
      if (dwellRef.current.singleFired && !dwellRef.current.doubleFired && elapsed >= DOUBLE_MS) {
        dwellRef.current.doubleFired = true
        el.dispatchEvent(new MouseEvent('click',    { clientX:x, clientY:y, detail:2, bubbles:true, cancelable:true }))
        setTimeout(() => {
          el.dispatchEvent(new MouseEvent('dblclick', { clientX:x, clientY:y, detail:2, bubbles:true, cancelable:true }))
        }, 80)
      }
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [isActive, calibrated])

  // ── calibration point handler ──
  const handleCalClick = useCallback(() => {
    const screenPt = {
      x: Math.round(CAL_PTS[calStep].x * window.innerWidth),
      y: Math.round(CAL_PTS[calStep].y * window.innerHeight),
    }
    const iris = irisNowRef.current
    if (!iris) { addNotification('Face not detected — look at camera', 'warn'); return }

    const newClicks = calClicks + 1
    setCalClicks(newClicks)

    // Record this sample
    calDataRef.current.iris.push({ ...iris })
    calDataRef.current.screen.push({ ...screenPt })

    if (newClicks >= 3) {
      const next = calStep + 1
      if (next >= CAL_PTS.length) {
        // Fit regression model
        try {
          modelRef.current = fitModel(calDataRef.current.iris, calDataRef.current.screen)
          setCalibrating(false); setCalibrated(true)
          addNotification('Eye tracking calibrated ✅ — gaze cursor is live', 'info')
        } catch(e) {
          setError('Calibration math failed: ' + e.message)
        }
      } else {
        setCalStep(next); setCalClicks(0)
      }
    }
  }, [calStep, calClicks, addNotification])

  const skipCalibration = useCallback(() => {
    // Use a default identity-ish model that maps screen center to center
    // (won't track well, but at least won't crash)
    const w = window.innerWidth, h = window.innerHeight
    // 4 corners as fake calibration
    const iris = [{x:0.3,y:0.35},{x:0.7,y:0.35},{x:0.3,y:0.65},{x:0.7,y:0.65}]
    const screen = [{x:0,y:0},{x:w,y:0},{x:0,y:h},{x:w,y:h}]
    try { modelRef.current = fitModel(iris, screen) } catch(_) {}
    setCalibrating(false); setCalibrated(true)
  }, [])

  if (!eyeTrackingEnabled) return null

  const calScreenPt = calibrating && CAL_PTS[calStep] ? {
    x: Math.round(CAL_PTS[calStep].x * window.innerWidth),
    y: Math.round(CAL_PTS[calStep].y * window.innerHeight),
  } : null

  return (
    <>
      {/* Hidden video for MediaPipe */}
      <video ref={videoRef} style={{ position:'fixed', opacity:0, pointerEvents:'none',
        top:-9999, left:-9999, width:320, height:240 }} playsInline muted />

      {/* Gaze cursor */}
      {calibrated && (
        <div id="gaze-cursor" style={{
          position:'fixed',
          width: cursorStyle.type === 'pointer' ? 24 : 18,
          height: cursorStyle.type === 'pointer' ? 24 : 18,
          borderRadius:'50%',
          background: cursorStyle.type === 'pointer' ? 'rgba(139,92,246,0.85)' :
                      cursorStyle.type === 'text' ? 'rgba(59,130,246,0.7)' :
                      cursorStyle.type === 'not-allowed' ? 'rgba(239,68,68,0.75)' :
                      'rgba(139,92,246,0.65)',
          border: cursorStyle.type === 'pointer' ? '2px solid rgba(255,255,255,0.9)' : '2px solid rgba(167,139,250,0.9)',
          pointerEvents:'none', zIndex:99999, transform:'translate(-50%,-50%)',
          // Initial position is off-screen; moveCursor() positions it from the first frame
          left: gazeRef.current.x, top: gazeRef.current.y,
          transition:'left 0.05s linear, top 0.05s linear, width 0.1s ease, height 0.1s ease, background-color 0.15s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          {cursorStyle.icon}
        </div>
      )}

      {/* Calibration overlay */}
      {calibrating && calScreenPt && (
        <div style={{ position:'fixed',inset:0,zIndex:9998,background:'rgba(0,0,0,0.88)',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
          <button onClick={closeEyeTracker} title="Turn off eye tracking" style={{
            position:'fixed',top:18,right:18,width:30,height:30,borderRadius:8,
            border:'1px solid rgba(248,113,113,0.45)',background:'rgba(239,68,68,0.2)',
            color:'#fecaca',cursor:'pointer',fontSize:18,lineHeight:'28px',
          }}>x</button>
          <div style={{ color:'#f0f0f5',fontSize:16,marginBottom:10,fontFamily:'sans-serif' }}>
            🎯 Look at the dot and click it ({calStep+1}/{CAL_PTS.length})
          </div>
          <div style={{ color:'#9ca3af',fontSize:13,marginBottom:6 }}>
            {3-calClicks} click{3-calClicks!==1?'s':''} remaining
          </div>
          {noFace && (
            <div style={{ color:'#f87171',fontSize:12,marginBottom:8 }}>
              ⚠️ Face not detected — ensure good lighting and face the camera
            </div>
          )}
          {!noFace && irisNowRef.current && (
            <div style={{ color:'#34d399',fontSize:12,marginBottom:8 }}>✅ Face detected</div>
          )}
          {/* Calibration dot */}
          <div onClick={handleCalClick} style={{
            position:'fixed', left:calScreenPt.x, top:calScreenPt.y,
            transform:'translate(-50%,-50%)', width:30,height:30,
            borderRadius:'50%', background:'#8b5cf6', border:'3px solid #a78bfa',
            cursor:'crosshair', boxShadow:'0 0 20px rgba(139,92,246,0.9)',
            animation:'etpulse 1s ease-in-out infinite',
          }} />
          <style>{`@keyframes etpulse{0%,100%{box-shadow:0 0 8px rgba(139,92,246,0.5)}50%{box-shadow:0 0 28px rgba(139,92,246,1)}}`}</style>
          <button onClick={skipCalibration} style={{
            position:'fixed',bottom:28,right:28,padding:'8px 18px',borderRadius:8,
            border:'none',background:'rgba(139,92,246,0.2)',color:'#a78bfa',cursor:'pointer',fontSize:13,
          }}>Skip calibration</button>
        </div>
      )}

      {/* Panel */}
      <div style={{ position:'fixed',top:72,right:16,zIndex:9999,width:168 }}>
        <button onClick={closeEyeTracker} title="Turn off eye tracking" style={{
          position:'absolute',top:6,right:6,zIndex:1,width:24,height:24,borderRadius:6,
          border:'1px solid rgba(248,113,113,0.45)',background:'rgba(17,24,39,0.82)',
          color:'#fecaca',cursor:'pointer',fontSize:16,lineHeight:'20px',
        }}>x</button>
        {/* Camera preview — we show a mirrored video preview */}
        <div style={{ width:168,height:126,borderRadius:10,overflow:'hidden',
          border:`2px solid ${isActive?'#8b5cf6':'#374151'}`,background:'#000' }}>
          {isActive
            ? <video ref={previewRef}
                style={{ width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)' }} playsInline muted />
            : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',
                justifyContent:'center',color:'#6b7280',fontSize:11,textAlign:'center',padding:'0 8px' }}>
                {status==='loading' ? '⏳ Loading model…' : '⭕ Inactive'}
              </div>
          }
        </div>

        <div style={{ textAlign:'center',fontSize:11,color:'#9ca3af',marginTop:4 }}>
          {!isActive ? '⭕ Inactive'
            : calibrated ? '✅ Tracking Active'
            : calibrating ? '🎯 Calibrating…'
            : '⌛ Starting…'}
        </div>

        {isActive && (
          <div style={{ textAlign:'center',fontSize:10,marginTop:2,
            color: noFace ? '#f87171' : gazeHz>5 ? '#34d399' : '#f59e0b' }}>
            {noFace ? '⚠️ No face' : gazeHz>0 ? `👁 ${gazeHz} fps` : '…detecting'}
          </div>
        )}

        {calibrated && (
          <button onClick={()=>{setCalibrated(false);setCalibrating(true);setCalStep(0);setCalClicks(0);calDataRef.current={iris:[],screen:[]}}}
            style={{ marginTop:4,width:'100%',padding:'3px 0',borderRadius:6,
              border:'none',background:'rgba(139,92,246,0.15)',color:'#a78bfa',fontSize:11,cursor:'pointer' }}>
            🔄 Recalibrate
          </button>
        )}

        {error && (
          <>
            <div style={{ fontSize:10,color:'#f87171',marginTop:4,textAlign:'center' }}>{error}</div>
            <button onClick={()=>{ cleanup(); setError(null); setRetryCount(c=>c+1) }}
              style={{ marginTop:6,width:'100%',padding:'4px 0',borderRadius:6,
                border:'none',background:'rgba(139,92,246,0.2)',color:'#a78bfa',fontSize:11,cursor:'pointer' }}>
              🔄 Retry
            </button>
          </>
        )}

        {calibrated && (
          <div style={{ textAlign:'center',fontSize:10,color:'#6b7280',marginTop:2 }}>
            👁 1.5s dwell = click &nbsp;|&nbsp; 2.7s = double-click
          </div>
        )}
      </div>
    </>
  )
}

// iGesture: 468/473 iris landmarks, EMA smoothing filter, 9-point calibration sync
