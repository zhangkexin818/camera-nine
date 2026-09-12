import { assign, setup } from 'xstate'
import { getEvidenceLink, REQUIRED_EVIDENCE_LINKS } from './archive'
import { CORE_EVIDENCE_IDS, EVIDENCE_BY_ID } from './cameras'
import { clampTime, FRAME_RATE, INCIDENT_DURATION, INITIAL_TIME } from './time'
import type { CameraId, EndingId, EvidenceId, EvidenceLinkId, HypothesisId } from './types'

export interface ReviewContext {
  time: number
  playing: boolean
  cameraId: CameraId
  evidence: EvidenceId[]
  links: EvidenceLinkId[]
  drawerOpen: boolean
  mistakes: number
  hypothesisCorrect: boolean
  ending: EndingId | null
}

export type ReviewEvent =
  | { type: 'START' }
  | { type: 'TICK'; delta: number }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SEEK'; time: number }
  | { type: 'STEP'; frames: number }
  | { type: 'SELECT_CAMERA'; cameraId: CameraId }
  | { type: 'DISCOVER'; evidenceId: EvidenceId }
  | { type: 'VERIFY_LINK'; left: EvidenceId; right: EvidenceId }
  | { type: 'MISS' }
  | { type: 'SUBMIT_HYPOTHESIS'; hypothesisId: HypothesisId }
  | { type: 'CHOOSE_ENDING'; endingId: EndingId }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'RESET' }

function coreEvidenceCount(evidence: EvidenceId[]) {
  return evidence.filter((id) => CORE_EVIDENCE_IDS.includes(id)).length
}

export const reviewMachine = setup({
  types: {
    context: {} as ReviewContext,
    events: {} as ReviewEvent,
  },
  guards: {
    canSelectCamera: ({ context, event }) => {
      if (event.type !== 'SELECT_CAMERA') return false
      return event.cameraId !== '09' || (
        coreEvidenceCount(context.evidence) >= CORE_EVIDENCE_IDS.length &&
        context.links.length >= REQUIRED_EVIDENCE_LINKS &&
        context.hypothesisCorrect
      )
    },
    canDiscoverEvidence: ({ context, event }) => {
      if (event.type !== 'DISCOVER') return false
      const evidence = EVIDENCE_BY_ID[event.evidenceId]
      return (
        evidence.cameraId === context.cameraId &&
        context.time >= evidence.window[0] &&
        context.time <= evidence.window[1]
      )
    },
    canSubmitHypothesis: ({ context }) => (
      coreEvidenceCount(context.evidence) >= CORE_EVIDENCE_IDS.length &&
      context.links.length >= REQUIRED_EVIDENCE_LINKS
    ),
    canChooseEnding: ({ context }) => context.cameraId === '09' && context.hypothesisCorrect,
  },
}).createMachine({
  id: 'camera-review',
  initial: 'intro',
  context: {
    time: INITIAL_TIME,
    playing: false,
    cameraId: '08',
    evidence: [],
    links: [],
    drawerOpen: false,
    mistakes: 0,
    hypothesisCorrect: false,
    ending: null,
  },
  states: {
    intro: {
      on: {
        START: { target: 'reviewing' },
      },
    },
    reviewing: {
      on: {
        TICK: {
          actions: assign(({ context, event }) => {
            const time = clampTime(context.time + event.delta)
            return {
              time,
              playing: time < INCIDENT_DURATION && context.playing,
            }
          }),
        },
        TOGGLE_PLAY: {
          actions: assign(({ context }) => ({
            playing: context.time >= INCIDENT_DURATION ? true : !context.playing,
            time: context.time >= INCIDENT_DURATION ? 0 : context.time,
          })),
        },
        SEEK: {
          actions: assign(({ event }) => ({ time: clampTime(event.time), playing: false })),
        },
        STEP: {
          actions: assign(({ context, event }) => ({
            time: clampTime(context.time + event.frames / FRAME_RATE),
            playing: false,
          })),
        },
        SELECT_CAMERA: {
          guard: 'canSelectCamera',
          actions: assign(({ event }) => ({ cameraId: event.cameraId })),
        },
        DISCOVER: {
          guard: 'canDiscoverEvidence',
          actions: assign(({ context, event }) => ({
            evidence: context.evidence.includes(event.evidenceId)
              ? context.evidence
              : [...context.evidence, event.evidenceId],
            playing: false,
          })),
        },
        VERIFY_LINK: {
          actions: assign(({ context, event }) => {
            const bothObserved = context.evidence.includes(event.left) && context.evidence.includes(event.right)
            if (!bothObserved || event.left === event.right) return {}
            const link = getEvidenceLink(event.left, event.right)
            if (!link) return { mistakes: context.mistakes + 1, playing: false }
            if (context.links.includes(link.id)) return { playing: false }
            return { links: [...context.links, link.id], playing: false }
          }),
        },
        MISS: {
          actions: assign(({ context }) => ({ mistakes: context.mistakes + 1, playing: false })),
        },
        SUBMIT_HYPOTHESIS: {
          guard: 'canSubmitHypothesis',
          actions: assign(({ context, event }) => ({
            hypothesisCorrect: context.hypothesisCorrect || event.hypothesisId === 'split-time',
            mistakes: event.hypothesisId === 'split-time' ? context.mistakes : context.mistakes + 1,
            playing: false,
          })),
        },
        CHOOSE_ENDING: {
          guard: 'canChooseEnding',
          actions: assign(({ event }) => ({ ending: event.endingId, playing: false })),
        },
        TOGGLE_DRAWER: {
          actions: assign(({ context }) => ({ drawerOpen: !context.drawerOpen })),
        },
        OPEN_DRAWER: {
          actions: assign({ drawerOpen: true }),
        },
        CLOSE_DRAWER: {
          actions: assign({ drawerOpen: false }),
        },
        RESET: {
          actions: assign({
            time: INITIAL_TIME,
            playing: false,
            cameraId: '08',
            evidence: [],
            links: [],
            drawerOpen: false,
            mistakes: 0,
            hypothesisCorrect: false,
            ending: null,
          }),
        },
      },
    },
  },
})

export function countCoreEvidence(evidence: EvidenceId[]) {
  return coreEvidenceCount(evidence)
}
