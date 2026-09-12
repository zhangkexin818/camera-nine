import { createActor } from 'xstate'
import { describe, expect, it } from 'vitest'
import { CORE_EVIDENCE_IDS, EVIDENCE_BY_ID } from './cameras'
import { reviewMachine } from './machine'

describe('camera review state machine', () => {
  it('starts with the story introduction, then enters the authored playable frame', () => {
    const actor = createActor(reviewMachine).start()
    expect(actor.getSnapshot().value).toBe('intro')
    actor.send({ type: 'TOGGLE_PLAY' })
    expect(actor.getSnapshot().context.playing).toBe(false)

    actor.send({ type: 'START' })
    expect(actor.getSnapshot().value).toBe('reviewing')
    expect(actor.getSnapshot().context).toMatchObject({
      time: 0,
      cameraId: '08',
      playing: false,
      evidence: [],
    })
    actor.stop()
  })

  it('keeps CAM-09 locked until core evidence, two valid links, and the correct deduction are found', () => {
    const actor = createActor(reviewMachine).start()
    actor.send({ type: 'START' })
    actor.send({ type: 'SELECT_CAMERA', cameraId: '09' })
    expect(actor.getSnapshot().context.cameraId).toBe('08')

    CORE_EVIDENCE_IDS.forEach((evidenceId) => {
      const evidence = EVIDENCE_BY_ID[evidenceId]
      actor.send({ type: 'SELECT_CAMERA', cameraId: evidence.cameraId })
      actor.send({ type: 'SEEK', time: evidence.time })
      actor.send({ type: 'DISCOVER', evidenceId })
    })
    actor.send({ type: 'SELECT_CAMERA', cameraId: '09' })
    expect(actor.getSnapshot().context.cameraId).not.toBe('09')
    actor.send({ type: 'SUBMIT_HYPOTHESIS', hypothesisId: 'split-time' })
    expect(actor.getSnapshot().context.hypothesisCorrect).toBe(false)

    actor.send({ type: 'VERIFY_LINK', left: 'card-in-hand', right: 'duplicate-card' })
    actor.send({ type: 'VERIFY_LINK', left: 'missing-case', right: 'duplicate-card' })
    expect(actor.getSnapshot().context.links).toEqual(['dual-presence', 'stolen-channel'])
    actor.send({ type: 'SUBMIT_HYPOTHESIS', hypothesisId: 'equipment' })
    expect(actor.getSnapshot().context.hypothesisCorrect).toBe(false)
    expect(actor.getSnapshot().context.mistakes).toBe(1)
    actor.send({ type: 'SUBMIT_HYPOTHESIS', hypothesisId: 'split-time' })
    expect(actor.getSnapshot().context.hypothesisCorrect).toBe(true)
    actor.send({ type: 'SELECT_CAMERA', cameraId: '09' })
    expect(actor.getSnapshot().context.cameraId).toBe('09')
    actor.send({ type: 'CHOOSE_ENDING', endingId: 'preserve' })
    expect(actor.getSnapshot().context.ending).toBe('preserve')
    actor.stop()
  })

  it('clamps playback and frame stepping to the incident window', () => {
    const actor = createActor(reviewMachine).start()
    actor.send({ type: 'START' })
    actor.send({ type: 'SEEK', time: 9.99 })
    actor.send({ type: 'TOGGLE_PLAY' })
    actor.send({ type: 'TICK', delta: 1 })
    expect(actor.getSnapshot().context.time).toBe(10)
    expect(actor.getSnapshot().context.playing).toBe(false)

    actor.send({ type: 'STEP', frames: 10 })
    expect(actor.getSnapshot().context.time).toBe(10)
    actor.send({ type: 'SEEK', time: 0 })
    actor.send({ type: 'STEP', frames: -1 })
    expect(actor.getSnapshot().context.time).toBe(0)
    actor.stop()
  })

  it('does not duplicate evidence and resets cleanly', () => {
    const actor = createActor(reviewMachine).start()
    actor.send({ type: 'START' })
    actor.send({ type: 'SEEK', time: EVIDENCE_BY_ID['card-in-hand'].time })
    actor.send({ type: 'DISCOVER', evidenceId: 'card-in-hand' })
    actor.send({ type: 'DISCOVER', evidenceId: 'card-in-hand' })
    expect(actor.getSnapshot().context.evidence).toEqual(['card-in-hand'])
    actor.send({ type: 'RESET' })
    expect(actor.getSnapshot().context).toMatchObject({
      time: 0,
      cameraId: '08',
      playing: false,
      evidence: [],
      links: [],
      drawerOpen: false,
      mistakes: 0,
      hypothesisCorrect: false,
      ending: null,
    })
    actor.stop()
  })

  it('rejects evidence outside its authored camera and time window', () => {
    const actor = createActor(reviewMachine).start()
    actor.send({ type: 'START' })
    actor.send({ type: 'DISCOVER', evidenceId: 'duplicate-card' })
    expect(actor.getSnapshot().context.evidence).toEqual([])

    actor.send({ type: 'SELECT_CAMERA', cameraId: '07' })
    actor.send({ type: 'DISCOVER', evidenceId: 'duplicate-card' })
    expect(actor.getSnapshot().context.evidence).toEqual([])

    actor.send({ type: 'SEEK', time: 5 })
    actor.send({ type: 'DISCOVER', evidenceId: 'duplicate-card' })
    expect(actor.getSnapshot().context.evidence).toEqual(['duplicate-card'])
    actor.stop()
  })

  it('scores invalid links once and records a final ending only inside CAM-09', () => {
    const actor = createActor(reviewMachine).start()
    actor.send({ type: 'START' })
    for (const evidenceId of CORE_EVIDENCE_IDS) {
      const evidence = EVIDENCE_BY_ID[evidenceId]
      actor.send({ type: 'SELECT_CAMERA', cameraId: evidence.cameraId })
      actor.send({ type: 'SEEK', time: evidence.time })
      actor.send({ type: 'DISCOVER', evidenceId })
    }

    actor.send({ type: 'VERIFY_LINK', left: 'card-in-hand', right: 'missing-case' })
    expect(actor.getSnapshot().context.mistakes).toBe(1)
    actor.send({ type: 'VERIFY_LINK', left: 'card-in-hand', right: 'duplicate-card' })
    actor.send({ type: 'VERIFY_LINK', left: 'card-in-hand', right: 'duplicate-card' })
    expect(actor.getSnapshot().context.links).toEqual(['dual-presence'])
    expect(actor.getSnapshot().context.mistakes).toBe(1)

    actor.send({ type: 'CHOOSE_ENDING', endingId: 'answer' })
    expect(actor.getSnapshot().context.ending).toBeNull()
    actor.stop()
  })
})
