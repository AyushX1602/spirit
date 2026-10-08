import { describe, it, expect } from 'vitest'

describe('server smoke test', () => {
  it('vitest runs in node environment', () => {
    expect(true).toBe(true)
    expect(typeof process).toBe('object')
  })
})
