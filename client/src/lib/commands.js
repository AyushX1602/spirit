/**
 * client/src/lib/commands.js — Command Palette registry
 *
 * Each command: { id, title, keywords[], shortcut?, requiresConfirm?, run(deps) }
 * deps = { osStore, windowStore, openSpotlight, closeSpotlight }
 *
 * HARD RULE: destructive commands MUST have requiresConfirm: true.
 * The palette will ask before running — mirrors toolProtocol.js requiresConfirmation.
 */

import { getDefaultSize } from '../config/appConfig'

export const COMMANDS = [
  // ── App launchers ────────────────────────────────────────────────────────
  { id: 'open-notes',        title: 'Open Notes',         keywords: ['notes','text','write'],
    run: ({ windowStore }) => windowStore.openWindow('Notes','Notes',getDefaultSize('Notes')) },
  { id: 'open-files',        title: 'Open File Explorer', keywords: ['files','explorer','browser','folder'],
    run: ({ windowStore }) => windowStore.openWindow('FileExplorer','File Explorer',getDefaultSize('FileExplorer')) },
  { id: 'open-terminal',     title: 'Open Terminal',      keywords: ['terminal','console','cmd','shell'],
    run: ({ windowStore }) => windowStore.openWindow('Terminal','Terminal',getDefaultSize('Terminal')) },
  { id: 'open-settings',     title: 'Open Settings',      keywords: ['settings','preferences','config'],
    shortcut: '⌘,',
    run: ({ windowStore }) => windowStore.openWindow('Settings','Settings',getDefaultSize('Settings')) },
  { id: 'open-calculator',   title: 'Open Calculator',    keywords: ['calculator','calc','math'],
    run: ({ windowStore }) => windowStore.openWindow('Calculator','Calculator',getDefaultSize('Calculator')) },
  { id: 'open-browser',      title: 'Open Browser',       keywords: ['browser','web','internet'],
    run: ({ windowStore }) => windowStore.openWindow('Browser','Browser',getDefaultSize('Browser')) },
  { id: 'open-reminders',    title: 'Open Reminders',     keywords: ['reminders','alarm','meds','medicine'],
    run: ({ windowStore }) => windowStore.openWindow('Reminders','Reminders',getDefaultSize('Reminders')) },
  { id: 'open-translator',   title: 'Open Translator',    keywords: ['translator','translate','language'],
    run: ({ windowStore }) => windowStore.openWindow('Translator','Translator',getDefaultSize('Translator')) },
  { id: 'open-vault',        title: 'Open Vault',         keywords: ['vault','passwords','secure','secret'],
    run: ({ windowStore }) => windowStore.openWindow('Vault','Vault',getDefaultSize('Vault')) },
  { id: 'open-presentation', title: 'Open Presentations', keywords: ['presentation','slides','slideshow'],
    run: ({ windowStore }) => windowStore.openWindow('Presentation','Presentation',getDefaultSize('Presentation')) },

  // ── Window management ─────────────────────────────────────────────────────
  { id: 'close-window',      title: 'Close Focused Window', keywords: ['close','exit','quit'],
    run: ({ windowStore }) => {
      const w = windowStore.windows.find(w => w.focused)
      if (w) windowStore.closeWindow(w.id)
    }
  },
  { id: 'minimize-window',   title: 'Minimize Window',    keywords: ['minimize','hide'],
    run: ({ windowStore }) => {
      const w = windowStore.windows.find(w => w.focused)
      if (w) windowStore.minimizeWindow(w.id)
    }
  },
  { id: 'maximize-window',   title: 'Maximize Window',    keywords: ['maximize','fullscreen','full screen'],
    run: ({ windowStore }) => {
      const w = windowStore.windows.find(w => w.focused)
      if (w) windowStore.maximizeWindow(w.id)
    }
  },
  { id: 'show-desktop',      title: 'Show Desktop',       keywords: ['desktop','show desktop','clear'],
    run: ({ windowStore }) => windowStore.windows.forEach(w => windowStore.minimizeWindow(w.id))
  },

  // ── Theme / appearance ────────────────────────────────────────────────────
  { id: 'theme-light',       title: 'Switch to Light Theme', keywords: ['light','theme','mode'],
    run: ({ osStore }) => osStore.setTheme('light') },
  { id: 'theme-dark',        title: 'Switch to Dark Theme',  keywords: ['dark','theme','night','mode'],
    run: ({ osStore }) => osStore.setTheme('dark') },
  { id: 'font-normal',       title: 'Font Size: Normal',  keywords: ['font','size','normal','small'],
    run: ({ osStore }) => osStore.setFontSize('normal') },
  { id: 'font-large',        title: 'Font Size: Large',   keywords: ['font','size','large','bigger'],
    run: ({ osStore }) => osStore.setFontSize('large') },
  { id: 'font-xl',           title: 'Font Size: Extra Large', keywords: ['font','size','xl','extra','large'],
    run: ({ osStore }) => osStore.setFontSize('xl') },
  { id: 'contrast-high',     title: 'Toggle High Contrast', keywords: ['contrast','high','accessibility'],
    run: ({ osStore }) => osStore.setContrast(osStore.contrast === 'high' ? 'normal' : 'high') },

  // ── Input mode toggles ────────────────────────────────────────────────────
  { id: 'toggle-voice',      title: 'Toggle Voice Commands', keywords: ['voice','speech','mic','microphone'],
    run: ({ osStore }) => osStore.toggleVoice() },
  { id: 'toggle-gesture',    title: 'Toggle Hand Gestures',  keywords: ['gesture','hand','camera'],
    run: ({ osStore }) => osStore.toggleGesture() },
  { id: 'toggle-eye',        title: 'Toggle Eye Tracking',   keywords: ['eye','tracking','gaze'],
    run: ({ osStore }) => osStore.toggleEyeTracking() },
  { id: 'toggle-tts',        title: 'Toggle Text-to-Speech', keywords: ['tts','speak','speech','read aloud'],
    run: ({ osStore }) => osStore.toggleTTS() },

  // ── Notification / Focus ──────────────────────────────────────────────────
  { id: 'toggle-dnd',        title: 'Toggle Do Not Disturb', keywords: ['dnd','do not disturb','focus','quiet'],
    shortcut: '⌘D',
    run: ({ osStore }) => osStore.toggleDnd() },
  { id: 'clear-notifs',      title: 'Clear Notification History', keywords: ['clear','notifications','history'],
    run: ({ osStore }) => osStore.clearHistory() },
  { id: 'open-notif-center', title: 'Open Notification Center', keywords: ['notifications','bell','center','history'],
    run: ({ osStore }) => osStore.openNotifCenter() },

  // ── Spotlight itself ──────────────────────────────────────────────────────
  { id: 'open-spotlight',    title: 'Open Spotlight Search', keywords: ['spotlight','search','find'],
    shortcut: '⌘K',
    run: ({ osStore }) => osStore.openSpotlight() },

  // ── Session ──────────────────────────────────────────────────────────────
  { id: 'lock-screen',       title: 'Lock Screen', keywords: ['lock','screen','lock screen','login','sign out','away'],
    shortcut: '⌘⌥L',
    run: ({ osStore }) => osStore.lockScreen() },

  // ── Destructive (requiresConfirm) ─────────────────────────────────────────
  { id: 'trigger-sos',       title: 'Trigger SOS',
    keywords: ['sos','emergency','help','call'],
    requiresConfirm: true,
    confirmMessage: 'This will trigger the SOS alert. Are you sure?',
    run: () => window.dispatchEvent(new CustomEvent('spiritos:sos')) },
]

/**
 * Fuzzy-filter commands by query string.
 * Returns commands whose title or keywords contain the query words.
 */
export function filterCommands(query) {
  if (!query.trim()) return COMMANDS.slice(0, 12)
  const words = query.toLowerCase().trim().split(/\s+/)
  return COMMANDS.filter(cmd => {
    const haystack = [cmd.title, ...cmd.keywords].join(' ').toLowerCase()
    return words.every(w => haystack.includes(w))
  })
}
