/**
 * server/lib/__tests__/spirit.test.js — T1 Offline Assistant Test Suite
 *
 * Tests the offline assistant's natural language processing, matching, slot-filling,
 * math formula evaluation, daysMask parsing, and fallback response.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import nlp from '../nlp'
import { spirit } from '../spirit'

describe('NLP Utilities (nlp.js)', () => {
  describe('normalize', () => {
    it('lowercases and trims whitespace (exclamation at end is kept because of trailing space quirk)', () => {
      expect(nlp.normalize('  HELLO   WORLD!  ')).toBe('hello world!')
    })
    it('normalizes smart quotes to straight quotes', () => {
      expect(nlp.normalize('\u201chello\u201d')).toBe('"hello"')
      expect(nlp.normalize('\u2018hello\u2019')).toBe("'hello'")
    })
  })

  describe('stripFillers', () => {
    it('removes common filler words', () => {
      expect(nlp.stripFillers('please open the files')).toBe('open the files')
      expect(nlp.stripFillers('spirit set a reminder')).toBe('set a reminder')
      expect(nlp.stripFillers('could you open notes for me')).toBe('open notes')
    })
  })

  describe('extractTime', () => {
    it('extracts exact clock times', () => {
      const t = nlp.extractTime('remind me at 9:30 pm')
      expect(t).not.toBeNull()
      expect(t.hh).toBe(21)
      expect(t.mm).toBe(30)
    })
    it('extracts noon and midnight', () => {
      const noon = nlp.extractTime('at noon')
      expect(noon.hh).toBe(12)
      expect(noon.mm).toBe(0)
      const midnight = nlp.extractTime('at midnight')
      expect(midnight.hh).toBe(0)
      expect(midnight.mm).toBe(0)
    })
  })

  describe('extractApp', () => {
    it('fuzzy matches app names', () => {
      expect(nlp.extractApp('open terminal')).toBe('Terminal')
      expect(nlp.extractApp('go to my files')).toBe('FileExplorer')
      expect(nlp.extractApp('notepad')).toBe('Notes')
    })
  })

  describe('extractProfile', () => {
    it('matches accessibility profiles', () => {
      expect(nlp.extractProfile('elderly profile')).toBe('elderly')
      expect(nlp.extractProfile('low vision mode')).toBe('visually-impaired')
    })
  })

  describe('extractTheme', () => {
    it('detects dark or light theme requests', () => {
      expect(nlp.extractTheme('change to dark mode')).toBe('dark')
      expect(nlp.extractTheme('switch to bright light theme')).toBe('light')
    })
  })

  describe('extractFontSize', () => {
    it('detects font size commands', () => {
      expect(nlp.extractFontSize('make font huge')).toBe('xl')
      expect(nlp.extractFontSize('enlarge the text')).toBe('large')
      expect(nlp.extractFontSize('reset text size')).toBe('normal')
    })
  })

  describe('extractWebsite', () => {
    it('extracts canonical website urls and bare domains', () => {
      const yt = nlp.extractWebsite('open youtube please')
      expect(yt.url).toBe('https://www.youtube.com')
      
      const domain = nlp.extractWebsite('go to google.com')
      expect(domain.url).toBe('https://www.google.com') // matched 'google' alias
    })
  })

  describe('extractMath', () => {
    it('solves simple math formulas', () => {
      expect(nlp.extractMath('what is 3 + 4 * 2')).toEqual({ expr: '3 + 4 * 2', result: 11 })
      expect(nlp.extractMath('calculate 10 divided by 2')).toEqual({ expr: '10 divided by 2', result: 5 })
      expect(nlp.extractMath('5 plus 6')).toEqual({ expr: '5 plus 6', result: 11 })
      expect(nlp.extractMath('sum of 5 and 6')).toBeNull()
    })
  })

  describe('parseDuration', () => {
    it('parses seconds, minutes, hours to ms', () => {
      expect(nlp.parseDuration('10 seconds')).toBe(10000)
      expect(nlp.parseDuration('5 mins')).toBe(300000)
      expect(nlp.parseDuration('2 hours')).toBe(7200000)
    })
  })
})

describe('Spirit Offline Assistant (spirit.js)', () => {
  let mockPrisma

  beforeEach(() => {
    mockPrisma = {
      agentSession: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
      reminder: {
        create: vi.fn().mockResolvedValue({}),
      }
    }
  })

  it('matches smalltalk intent', async () => {
    const context = { sessionId: 'user-smalltalk', osState: {} }
    const res = await spirit('who are you', context, mockPrisma)
    expect(res.message).toContain('Spirit')
    expect(res.action).toBeNull()
  })

  it('matches SOS emergency command with priority', async () => {
    const context = { sessionId: 'user-sos', osState: {} }
    const res = await spirit('help me SOS', context, mockPrisma)
    expect(res.action).toEqual({ action: 'triggerSOS' })
    expect(res.message).toContain('SOS')
  })

  it('matches app opening commands', async () => {
    const context = { sessionId: 'user-open-app', osState: {} }
    const res = await spirit('open calculator', context, mockPrisma)
    expect(res.action).toEqual({ action: 'openApp', target: 'Calculator' })
  })

  it('performs calculations in spirit', async () => {
    const context = { sessionId: 'user-math', osState: {} }
    const res = await spirit('calculate 15 plus 25', context, mockPrisma)
    expect(res.message).toContain('40')
  })

  describe('Reminder Creation Intent', () => {
    it('creates reminder directly when both time and title are present', async () => {
      const context = { sessionId: 'user-reminder-direct', osState: {} }
      const res = await spirit('remind me at 9 am to buy groceries', context, mockPrisma)
      expect(mockPrisma.reminder.create).toHaveBeenCalled()
      expect(res.action).toEqual({
        action: 'createReminder',
        title: 'buy groceries',
        timeOfDay: '09:00',
        daysMask: '1111111'
      })
    })

    it('creates a daily reminder from Hindi speech text', async () => {
      const context = { sessionId: 'user-reminder-hindi', osState: {}, voiceLocale: 'hi-IN' }
      const res = await spirit('मेरे लिए एक रिमाइंडर सेट करके दो रोज 8:00दवाई लेने के लिए', context, mockPrisma)
      expect(mockPrisma.reminder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'दवाई लेना',
          timeOfDay: '08:00',
          daysMask: '1111111'
        })
      })
      expect(res.action).toEqual({
        action: 'createReminder',
        title: 'दवाई लेना',
        timeOfDay: '08:00',
        daysMask: '1111111'
      })
      expect(res.message).toContain('याद')
    })

    it('cleans p.m. suffixes from Hindi reminder titles', async () => {
      const context = { sessionId: 'user-reminder-hindi-pm', osState: {}, voiceLocale: 'hi-IN' }
      const res = await spirit('ओके कम करो मेरे लिए रिमाइंडर सेट कर दो रोज 5:00 p.m का दवाई लेने के लिए', context, mockPrisma)
      expect(res.action).toEqual({
        action: 'createReminder',
        title: 'दवाई लेना',
        timeOfDay: '17:00',
        daysMask: '1111111'
      })
    })

    it('parses custom days repeat mask (daysMask)', async () => {
      const context = { sessionId: 'user-reminder-weekend', osState: {} }
      const res = await spirit('remind me to call mom on weekends at 10 am', context, mockPrisma)
      expect(res.action.daysMask).toBe('1000001') // Sunday (1) + Saturday (1)
      
      const context2 = { sessionId: 'user-reminder-weekdays', osState: {} }
      const res2 = await spirit('remind me to exercise on weekdays at 7:30 am', context2, mockPrisma)
      expect(res2.action.daysMask).toBe('0111110') // Mon-Fri
    })

    it('performs slot clarification when time is missing', async () => {
      const context = { sessionId: 'user-reminder-missing-time', osState: {} }
      // 1st turn: no time
      const res1 = await spirit('remind me to take pills', context, mockPrisma)
      expect(res1.message).toContain('time')
      expect(mockPrisma.reminder.create).not.toHaveBeenCalled()

      // 2nd turn: fill time slot
      const res2 = await spirit('at 10:00 pm', context, mockPrisma)
      expect(mockPrisma.reminder.create).toHaveBeenCalled()
      expect(res2.action.title).toBe('take pills')
      expect(res2.action.timeOfDay).toBe('22:00')
    })

    it('performs slot clarification when title is missing', async () => {
      const context = { sessionId: 'user-reminder-missing-title', osState: {} }
      // 1st turn: no title/subject
      const res1 = await spirit('set alarm at 8:00 am', context, mockPrisma)
      expect(res1.message).toContain('What should')
      expect(mockPrisma.reminder.create).not.toHaveBeenCalled()

      // 2nd turn: fill title slot
      const res2 = await spirit('buy groceries', context, mockPrisma)
      expect(mockPrisma.reminder.create).toHaveBeenCalled()
      expect(res2.action.title).toBe('buy groceries')
      expect(res2.action.timeOfDay).toBe('08:00')
    })
  })

  it('returns friendly suggestion fallback on unrecognized inputs', async () => {
    const context = { sessionId: 'user-fallback', osState: {} }
    const res = await spirit('blabla random text that does not match anything', context, mockPrisma)
    expect(res.message).toContain('I didn\'t catch that')
    expect(res.action).toBeNull()
  })
})
