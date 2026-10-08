import { describe, it, expect, vi, beforeEach } from 'vitest'
import { acquireCamera, releaseCamera, getStream } from '../sharedCamera'

describe('sharedCamera', () => {
  let mockStream
  let mockTrack
  let mockGetUserMedia

  beforeEach(() => {
    // Release camera repeatedly to reset internal state
    for (let i = 0; i < 10; i++) {
      releaseCamera()
    }

    mockTrack = { stop: vi.fn() }
    mockStream = {
      active: true,
      getTracks: vi.fn(() => [mockTrack])
    }

    mockGetUserMedia = vi.fn().mockResolvedValue(mockStream)
    global.navigator = {
      mediaDevices: {
        getUserMedia: mockGetUserMedia
      }
    }
  })

  it('acquires the camera and returns the stream', async () => {
    const stream = await acquireCamera()
    expect(stream).toBe(mockStream)
    expect(mockGetUserMedia).toHaveBeenCalledTimes(1)
  })

  it('shares the same stream across multiple callers', async () => {
    const [stream1, stream2] = await Promise.all([
      acquireCamera(),
      acquireCamera()
    ])
    expect(stream1).toBe(mockStream)
    expect(stream2).toBe(mockStream)
    expect(mockGetUserMedia).toHaveBeenCalledTimes(1)
  })

  it('stops tracks and clears stream when reference count reaches 0', async () => {
    await acquireCamera() // refCount = 1
    await acquireCamera() // refCount = 2
    
    releaseCamera() // refCount = 1, should not stop
    expect(mockTrack.stop).not.toHaveBeenCalled()

    releaseCamera() // refCount = 0, should stop
    expect(mockTrack.stop).toHaveBeenCalledTimes(1)
    expect(getStream()).toBeNull()
  })

  it('handles in-flight release race conditions correctly', async () => {
    let resolvePromise
    const pendingPromise = new Promise(resolve => {
      resolvePromise = () => resolve(mockStream)
    })
    mockGetUserMedia.mockReturnValue(pendingPromise)

    const acquirePromise = acquireCamera() // refCount = 1, starts getUserMedia
    releaseCamera() // refCount = 0, before it resolves!

    resolvePromise() // resolve now
    const stream = await acquirePromise

    expect(stream).toBeNull() // should be null since it was released in-flight
    expect(mockTrack.stop).toHaveBeenCalledTimes(1) // tracks should be stopped
  })
})
