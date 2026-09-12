import { describe, expect, it } from 'vitest'
import { getNextObjective } from './objectives'

describe('investigation objectives', () => {
  it('starts with a concrete first observation and advances in narrative order', () => {
    expect(getNextObjective([])).toMatchObject({
      evidenceId: 'card-in-hand',
      cameraId: '08',
      time: 4,
    })

    expect(getNextObjective(['card-in-hand'])).toMatchObject({
      evidenceId: 'duplicate-card',
      cameraId: '07',
      time: 5,
    })

    expect(getNextObjective(['card-in-hand', 'duplicate-card'])).toMatchObject({
      evidenceId: 'mirror-door',
      cameraId: '04',
      time: 6,
    })
  })

  it('ignores optional evidence and completes after the four core contradictions', () => {
    expect(getNextObjective(['footprint-gap'])?.evidenceId).toBe('card-in-hand')
    expect(
      getNextObjective(['card-in-hand', 'duplicate-card', 'mirror-door', 'missing-case']),
    ).toBeUndefined()
  })
})
