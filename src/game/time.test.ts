import { describe, expect, it } from 'vitest'
import { clampTime, formatClock, formatSecondTick } from './time'

describe('incident timecode', () => {
  it('formats the minute rollover at the blackout', () => {
    expect(formatClock(4)).toBe('23:46:59:00')
    expect(formatClock(5)).toBe('23:47:00:00')
    expect(formatClock(10)).toBe('23:47:05:00')
  })

  it('formats frame precision at 24 fps', () => {
    expect(formatClock(4 + 12 / 24)).toBe('23:46:59:12')
  })

  it('clamps seeks to the ten-second window', () => {
    expect(clampTime(-4)).toBe(0)
    expect(clampTime(14)).toBe(10)
    expect(formatSecondTick(5)).toBe('23:47:00')
  })
})

