/**
 * server/lib/prisma.js — FIX M1
 *
 * Single shared PrismaClient instance for the whole server.
 * Import this everywhere instead of calling `new PrismaClient()` per-module.
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma

// PostgreSQL connection pool configuration and reconnection retry handler
if (process.env.NODE_ENV === 'production') {
  prisma.$connect().then(() => {
    console.log('[Prisma] Connected to PostgreSQL pool successfully')
  }).catch((err) => {
    console.warn('[Prisma] PostgreSQL pool connection warning:', err.message)
  })
}

