import { describe, expect, it } from 'vitest'
import { getActiveEvidence, getCameraFrame, getSignalStrength } from './cameras'

describe('camera feed states', () => {
  it('changes each feed only at its authored event time', () => {
    expect(getCameraFrame('08', 3.99).state).toBe('normal')
    expect(getCameraFrame('08', 4).state).toBe('event')
    expect(getCameraFrame('04', 5.99).state).toBe('normal')
    expect(getCameraFrame('04', 6).state).toBe('event')
    expect(getCameraFrame('05', 6.99).state).toBe('normal')
    expect(getCameraFrame('05', 7).state).toBe('event')
  })

  it('only exposes evidence inside the authored observation window', () => {
    expect(getActiveEvidence('08', 3.69)).toBeUndefined()
    expect(getActiveEvidence('08', 4)?.id).toBe('card-in-hand')
    expect(getActiveEvidence('08', 4.56)).toBeUndefined()
    expect(getActiveEvidence('07', 5)?.id).toBe('duplicate-card')
  })

  it('uses signal strength as a proximity clue without exposing the exact target', () => {
    expect(getSignalStrength('08', 0, [])).toBeLessThan(0.2)
    expect(getSignalStrength('08', 3, [])).toBeGreaterThan(0.5)
    expect(getSignalStrength('08', 4, [])).toBe(1)
    expect(getSignalStrength('08', 4, ['card-in-hand'])).toBeLessThan(0.2)
  })
})
