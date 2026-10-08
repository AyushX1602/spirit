/**
 * server/lib/commandSafety.js — Shared command safety checker
 *
 * Single source of truth for which shell commands SpiritOS will execute.
 * Used by:
 *   - routes/terminal.js  (Terminal app)
 *   - routes/automation.js (scheduled tasks / workflows)
 *   - lib/irisTools.js    (AI run_terminal tool)
 *
 * Strategy: allowlist (not blocklist). Only commands explicitly listed
 * in ALLOWED_COMMANDS are permitted. Everything else is rejected regardless
 * of pattern. The blocklist is kept as a secondary defence-in-depth check
 * so known-dangerous patterns fail fast with a clear message.
 */

const IS_WINDOWS = process.platform === 'win32'

// ── Blocked patterns (defence-in-depth) ──────────────────────────────────────
// These catch dangerous forms even if a command name somehow passes the
// allowlist (e.g. via shell aliasing on unusual systems).
const BLOCKED_PATTERNS = [
  /\bformat\b/i,
  /\bdel\s+[a-z]:\\/i,
  /\brd\s+[a-z]:\\/i,
  /\brmdir\s+[a-z]:\\/i,
  /\bshutdown\b/i,
  /\brestart\b/i,
  /\breg\s+(add|delete)\b/i,
  /\bnet\s+(user\s+\w+\s+\/add|localgroup\s+admin)/i,
  /\bpowershell\b/i,
  /\bcmd\s*\/c/i,
  /\bwscript\b/i,
  /\bcscript\b/i,
  /\brm\s+-rf/i,
  /\brm\s+-rf?\s+\//i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bsudo\b/i,
  /\bchmod\s+777\b/i,
  /\b(curl|wget|invoke-webrequest)\b.*\|\s*(cmd|powershell|bash)/i,
  /[;&|`].*\b(del|rm|format|shutdown)\b/i,
  />\s*(con|nul|prn|lpt|com)\b/i,
  // Command substitution — the substituted command would otherwise run
  // unchecked because it never starts a split segment. Block it outright;
  // diagnostic allowlist commands never need substitution.
  /\$\(/,            // $( ... )
  /`/,               // backtick substitution
  /<\(/,             // process substitution <( ... )
]

// ── Allowlist ─────────────────────────────────────────────────────────────────
// Only these base-command tokens are permitted to execute.
// Pipe/semicolon/&& chaining is also validated — every segment must
// start with an allowed command.
const ALLOWED_COMMANDS = IS_WINDOWS
  ? ['ipconfig', 'ping', 'nslookup', 'tracert', 'netstat', 'netsh',
     'systeminfo', 'hostname', 'whoami', 'ver', 'date', 'time', 'echo',
     'dir', 'type', 'findstr', 'find', 'where', 'tree',
     'tasklist', 'taskkill', 'wmic', 'net statistics', 'net user',
     'set', 'path', 'cls', 'more']
  : ['ping', 'nslookup', 'traceroute', 'netstat',
     'hostname', 'whoami', 'uname', 'uptime', 'date', 'echo',
     'ls', 'cat', 'find', 'grep', 'which', 'tree',
     'ps', 'top', 'df', 'du', 'free',
     'env', 'printenv', 'pwd', 'id', 'ip', 'kill']

/**
 * Check whether a command string is safe to execute.
 *
 * @param {string} command
 * @returns {{ safe: boolean, reason?: string }}
 */
function isCommandSafe(command) {
  if (!command || typeof command !== 'string') {
    return { safe: false, reason: 'Empty or non-string command' }
  }
  if (command.length > 500) {
    return { safe: false, reason: 'Command too long (max 500 chars)' }
  }

  // 1. Blocked patterns (defence-in-depth)
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      return { safe: false, reason: 'Command contains a blocked operation' }
    }
  }

  // 2. Allowlist — every pipe/semicolon/&& segment must start with a
  //    whitelisted base command (supporting multi-word prefixes).
  // Split on shell separators AND newlines/carriage returns — without \n\r a
  // multi-line payload (echo hi\ndel file) was treated as a single segment
  // that started with an allowed command, letting later lines run unchecked.
  const trimmed = command.trim().toLowerCase()
  const parts = trimmed.split(/[|&;\n\r]/)
  for (const part of parts) {
    const segment = part.trim()
    if (!segment) continue
    const allowed = ALLOWED_COMMANDS.some(cmd => {
      const cmdLower = cmd.toLowerCase()
      return segment === cmdLower || segment.startsWith(cmdLower + ' ')
    })
    if (!allowed) {
      const base = segment.split(/\s+/)[0]
      return { safe: false, reason: `Command "${base}" is not in the allowed list` }
    }
  }

  return { safe: true }
}

module.exports = { isCommandSafe, ALLOWED_COMMANDS, IS_WINDOWS }
