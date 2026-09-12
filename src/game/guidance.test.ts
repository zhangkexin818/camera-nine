import { describe, expect, it } from 'vitest'
import { getInvestigationHint } from './guidance'

describe('investigation guidance', () => {
  it('guides the four core observations without exposing the exact hotspot', () => {
    const first = getInvestigationHint([], [], false)
    expect(first).toMatchObject({ id: 'find-card-in-hand', cameraId: '08', time: 4 })
    expect(first).not.toHaveProperty('hotspot')

    expect(getInvestigationHint(['card-in-hand'], [], false)?.id).toBe('find-duplicate-card')
    expect(getInvestigationHint(['card-in-hand', 'duplicate-card'], [], false)?.id).toBe('find-mirror-door')
    expect(getInvestigationHint(['card-in-hand', 'duplicate-card', 'mirror-door'], [], false)?.id).toBe('find-missing-case')
  })

  it('then guides linking, deduction, and the ninth camera', () => {
    const evidence = ['card-in-hand', 'duplicate-card', 'mirror-door', 'missing-case'] as const
    expect(getInvestigationHint(evidence, [], false)?.id).toBe('link-dual-presence')
    expect(getInvestigationHint(evidence, ['dual-presence'], false)?.id).toBe('link-stolen-channel')
    expect(getInvestigationHint(evidence, ['dual-presence', 'stolen-channel'], false)?.id).toBe('submit-deduction')
    expect(getInvestigationHint(evidence, ['dual-presence', 'stolen-channel'], true)?.id).toBe('enter-camera-nine')
  })
})
