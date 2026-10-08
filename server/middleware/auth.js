/**
 * Auth Middleware
 * Session and authentication verification
 */

/**
 * Check if user is authenticated
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userName) {
    req.user = {
      userName: req.session.userName
    }
    next()
  } else {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    })
  }
}

/**
 * Optional authentication (doesn't fail if not logged in)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
function optionalAuth(req, res, next) {
  if (req.session && req.session.userName) {
    req.user = {
      userName: req.session.userName
    }
  }
  next()
}

/**
 * Check for admin role (for future use)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.userName === 'admin') {
    next()
  } else {
    res.status(403).json({
      error: 'Admin access required'
    })
  }
}

/**
 * Rate limiter for auth endpoints
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
const authRateLimiter = (() => {
  const attempts = new Map()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5
  let lastSweep = Date.now()

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()

    // Periodic sweep: drop IPs whose attempts have all aged out. The previous
    // "evict when empty" check was dead code (it ran AFTER pushing the current
    // attempt, so the array was never empty), leaving one stale timestamp per
    // distinct IP in the Map forever. This sweep bounds the Map's growth.
    if (now - lastSweep > windowMs) {
      for (const [key, times] of attempts) {
        const fresh = times.filter(t => now - t < windowMs)
        if (fresh.length === 0) attempts.delete(key)
        else attempts.set(key, fresh)
      }
      lastSweep = now
    }

    const userAttempts = attempts.get(ip) || []
    const recentAttempts = userAttempts.filter(t => now - t < windowMs)

    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({
        error: 'Too many attempts',
        message: 'Please try again later'
      })
    }

    // Record this attempt.
    recentAttempts.push(now)
    attempts.set(ip, recentAttempts)

    next()
  }
})()

/**
 * Session refresh middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
function refreshSession(req, res, next) {
  if (req.session) {
    // Touch the session to extend it
    req.session.touch()
  }
  next()
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
  authRateLimiter,
  refreshSession
}