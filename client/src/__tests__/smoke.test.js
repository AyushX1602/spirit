import { describe, it, expect } from 'vitest'

describe('client smoke test', () => {
  it('vitest runs in jsdom environment', () => {
    expect(true).toBe(true)
    expect(typeof document).toBe('object')
  })
})
