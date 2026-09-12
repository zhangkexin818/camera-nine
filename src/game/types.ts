export type CameraId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09'

export type EvidenceId =
  | 'mirror-door'
  | 'missing-case'
  | 'footprint-gap'
  | 'duplicate-card'
  | 'card-in-hand'

export type PrologueApproach = 'observe' | 'intervene'
export type PrologueMemory = 'card' | 'signal'
export type PrologueIdentity = 'remember' | 'record'
export type FocusOutcome = 'steady' | 'flinched'
export type HypothesisId = 'escape' | 'split-time' | 'equipment'
export type EvidenceLinkId = 'dual-presence' | 'broken-route' | 'stolen-channel'
export type EndingId = 'preserve' | 'answer' | 'erase' | 'broadcast' | 'follow'

export interface PlayerMemory {
  identity: PrologueIdentity
  approach: PrologueApproach
  memory: PrologueMemory
  focus: FocusOutcome
}

export interface CameraFrame {
  at: number
  src: string
  state: 'normal' | 'event' | 'past'
}

export interface CameraDefinition {
  id: CameraId
  location: string
  type: 'fixed' | 'mobile' | 'impossible'
  frames: CameraFrame[]
}

export interface EvidenceDefinition {
  id: EvidenceId
  cameraId: CameraId
  title: string
  detail: string
  image: string
  time: number
  window: readonly [number, number]
  core: boolean
  hotspot: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface EvidenceLinkDefinition {
  id: EvidenceLinkId
  evidence: readonly [EvidenceId, EvidenceId]
  title: string
  finding: string
  archive: {
    code: string
    title: string
    body: string
    quote: string
  }
}
