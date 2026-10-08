/**
 * sharedCamera.js
 * Single source of truth for the webcam stream.
 * All components must use this instead of calling getUserMedia directly.
 *
 * Race-condition fix: if two components call acquireCamera() at the same time
 * (e.g. Gesture + Eye both enable on boot), the second call joins the
 * in-flight promise instead of firing a second getUserMedia.
 */

let _stream = null
let _refCount = 0
let _pending = null   // in-flight getUserMedia promise, shared across callers

export async function acquireCamera() {
  _refCount++

  // Stream already live
  if (_stream && _stream.active) return _stream

  // Another caller already started getUserMedia — join that promise
  if (_pending) {
    try {
      return await _pending
    } catch (err) {
      _refCount--
      throw err
    }
  }

  // First caller — start getUserMedia and cache the promise so others can join
  _pending = navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 960, height: 540 },
    audio: false
  })

  try {
    const stream = await _pending
    if (_refCount === 0) {
      stream.getTracks().forEach(t => t.stop())
      _stream = null
    } else {
      _stream = stream
    }
    return _stream
  } catch (err) {
    _refCount--
    throw err
  } finally {
    _pending = null
  }
}

export function releaseCamera() {
  _refCount = Math.max(0, _refCount - 1)
  if (_refCount === 0) {
    if (_stream) {
      _stream.getTracks().forEach(t => t.stop())
      _stream = null
    }
    _pending = null
  }
}

export function getStream() {
  return _stream
}
