import { describe, expect, it } from 'vitest'
import { EVIDENCE_LINKS, getEvidenceLink, REQUIRED_EVIDENCE_LINKS } from './archive'

describe('evidence links and white reef archive', () => {
  it('recognizes authored contradictions regardless of selection order', () => {
    expect(getEvidenceLink('card-in-hand', 'duplicate-card')?.id).toBe('dual-presence')
    expect(getEvidenceLink('duplicate-card', 'card-in-hand')?.id).toBe('dual-presence')
    expect(getEvidenceLink('mirror-door', 'footprint-gap')?.id).toBe('broken-route')
  })

  it('rejects identical or compatible observations', () => {
    expect(getEvidenceLink('mirror-door', 'mirror-door')).toBeNull()
    expect(getEvidenceLink('card-in-hand', 'missing-case')).toBeNull()
  })

  it('ships more archive fragments than the minimum deduction gate', () => {
    expect(EVIDENCE_LINKS).toHaveLength(3)
    expect(REQUIRED_EVIDENCE_LINKS).toBe(2)
    expect(EVIDENCE_LINKS.every((link) => link.archive.body.length > 20)).toBe(true)
  })
})
