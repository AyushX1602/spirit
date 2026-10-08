import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['lib/__tests__/**/*.test.js', 'routes/__tests__/**/*.test.js'],
    deps: { interopDefault: true }
  }
})
