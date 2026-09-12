import type { CameraDefinition, CameraId, EvidenceDefinition, EvidenceId } from './types'

const ballroomBefore = new URL(
  '../../art/runtime/cam-01_before.webp',
  import.meta.url,
).href
const ballroomEvent = new URL(
  '../../art/runtime/cam-01_event.webp',
  import.meta.url,
).href
const corridorBefore = new URL(
  '../../art/runtime/cam-02_before.webp',
  import.meta.url,
).href
const corridorEvent = new URL(
  '../../art/runtime/cam-02_event.webp',
  import.meta.url,
).href
const hotelExterior = new URL(
  '../../art/runtime/cam-03_static.webp',
  import.meta.url,
).href
const suiteBefore = new URL(
  '../../art/runtime/cam-04_before.webp',
  import.meta.url,
).href
const suiteEvent = new URL(
  '../../art/runtime/cam-04_event.webp',
  import.meta.url,
).href
const kitchenBefore = new URL(
  '../../art/runtime/cam-05_before.webp',
  import.meta.url,
).href
const kitchenEvent = new URL(
  '../../art/runtime/cam-05_event.webp',
  import.meta.url,
).href
const stairBefore = new URL(
  '../../art/runtime/cam-06_before.webp',
  import.meta.url,
).href
const stairEvent = new URL(
  '../../art/runtime/cam-06_event.webp',
  import.meta.url,
).href
const terraceBefore = new URL(
  '../../art/runtime/cam-07_before.webp',
  import.meta.url,
).href
const terraceEvent = new URL(
  '../../art/runtime/cam-07_event.webp',
  import.meta.url,
).href
const mobileBefore = new URL(
  '../../art/runtime/cam-08_before.webp',
  import.meta.url,
).href
const mobileEvent = new URL(
  '../../art/runtime/cam-08_event.webp',
  import.meta.url,
).href
const pastVote = new URL(
  '../../art/runtime/cam-09_past.webp',
  import.meta.url,
).href
const evidenceCardInHand = new URL(
  '../../art/runtime/evidence/card-in-hand.webp',
  import.meta.url,
).href
const evidenceDuplicateCard = new URL(
  '../../art/runtime/evidence/duplicate-card.webp',
  import.meta.url,
).href
const evidenceMirrorDoor = new URL(
  '../../art/runtime/evidence/mirror-door.webp',
  import.meta.url,
).href
const evidenceMissingCase = new URL(
  '../../art/runtime/evidence/missing-case.webp',
  import.meta.url,
).href
const evidenceFootprintGap = new URL(
  '../../art/runtime/evidence/footprint-gap.webp',
  import.meta.url,
).href

export const CAMERA_IDS: readonly CameraId[] = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
]

export const CAMERAS: Record<CameraId, CameraDefinition> = {
  '01': {
    id: '01',
    location: '宴会厅 · 侧门',
    type: 'fixed',
    frames: [
      { at: 0, src: ballroomBefore, state: 'normal' },
      { at: 5, src: ballroomEvent, state: 'event' },
    ],
  },
  '02': {
    id: '02',
    location: '后台服务走廊',
    type: 'fixed',
    frames: [
      { at: 0, src: corridorBefore, state: 'normal' },
      { at: 5, src: corridorEvent, state: 'event' },
    ],
  },
  '03': {
    id: '03',
    location: '酒店正门 · 海崖道',
    type: 'fixed',
    frames: [{ at: 0, src: hotelExterior, state: 'normal' }],
  },
  '04': {
    id: '04',
    location: '新娘套房',
    type: 'fixed',
    frames: [
      { at: 0, src: suiteBefore, state: 'normal' },
      { at: 6, src: suiteEvent, state: 'event' },
    ],
  },
  '05': {
    id: '05',
    location: '后厨 · 装卸口',
    type: 'fixed',
    frames: [
      { at: 0, src: kitchenBefore, state: 'normal' },
      { at: 7, src: kitchenEvent, state: 'event' },
    ],
  },
  '06': {
    id: '06',
    location: '西侧服务楼梯',
    type: 'fixed',
    frames: [
      { at: 0, src: stairBefore, state: 'normal' },
      { at: 6, src: stairEvent, state: 'event' },
    ],
  },
  '07': {
    id: '07',
    location: '临海露台',
    type: 'fixed',
    frames: [
      { at: 0, src: terraceBefore, state: 'normal' },
      { at: 5, src: terraceEvent, state: 'event' },
    ],
  },
  '08': {
    id: '08',
    location: '路野肩机',
    type: 'mobile',
    frames: [
      { at: 0, src: mobileBefore, state: 'normal' },
      { at: 4, src: mobileEvent, state: 'event' },
    ],
  },
  '09': {
    id: '09',
    location: '位置不可解析',
    type: 'impossible',
    frames: [{ at: 0, src: pastVote, state: 'past' }],
  },
}

export const EVIDENCE: readonly EvidenceDefinition[] = [
  {
    id: 'mirror-door',
    cameraId: '04',
    title: '镜内门缝',
    detail: '真实房门关闭，镜中的连接门却留下了象牙色裙摆。',
    image: evidenceMirrorDoor,
    time: 6,
    window: [5.75, 6.55],
    core: true,
    hotspot: { x: 0.56, y: 0.035, width: 0.18, height: 0.44 },
  },
  {
    id: 'missing-case',
    cameraId: '05',
    title: '干燥矩形印',
    detail: '湿透的推车下层留下干燥轮廓，黑色设备箱已不在画面内。',
    image: evidenceMissingCase,
    time: 7,
    window: [6.7, 7.55],
    core: true,
    hotspot: { x: 0.69, y: 0.53, width: 0.2, height: 0.26 },
  },
  {
    id: 'footprint-gap',
    cameraId: '06',
    title: '脚印断层',
    detail: '五枚湿脚印止于平台中央，苏晚与门口之间没有第六枚。',
    image: evidenceFootprintGap,
    time: 6,
    window: [5.75, 6.55],
    core: false,
    hotspot: { x: 0.37, y: 0.47, width: 0.2, height: 0.21 },
  },
  {
    id: 'duplicate-card',
    cameraId: '07',
    title: '露台黑卡',
    detail: '同一制式的无标识黑卡卡在露台排水沟边。',
    image: evidenceDuplicateCard,
    time: 5,
    window: [4.7, 5.55],
    core: true,
    hotspot: { x: 0.48, y: 0.82, width: 0.12, height: 0.17 },
  },
  {
    id: 'card-in-hand',
    cameraId: '08',
    title: '苏晚手中的黑卡',
    detail: '停电前一秒，黑卡仍被苏晚握在右手。',
    image: evidenceCardInHand,
    time: 4,
    window: [3.7, 4.55],
    core: true,
    hotspot: { x: 0.745, y: 0.39, width: 0.085, height: 0.3 },
  },
]

export const EVIDENCE_BY_ID = Object.fromEntries(
  EVIDENCE.map((item) => [item.id, item]),
) as Record<EvidenceId, EvidenceDefinition>

export const CORE_EVIDENCE_IDS = EVIDENCE.filter((item) => item.core).map((item) => item.id)

export const ALL_CAMERA_SOURCES = Array.from(
  new Set(CAMERA_IDS.flatMap((id) => CAMERAS[id].frames.map((frame) => frame.src))),
)

export function getCameraFrame(cameraId: CameraId, time: number) {
  const frames = CAMERAS[cameraId].frames
  return frames.reduce((selected, frame) => (time >= frame.at ? frame : selected), frames[0])
}

export function getActiveEvidence(cameraId: CameraId, time: number) {
  return EVIDENCE.find(
    (item) => item.cameraId === cameraId && time >= item.window[0] && time <= item.window[1],
  )
}

export function getSignalStrength(
  cameraId: CameraId,
  time: number,
  foundEvidence: readonly EvidenceId[],
) {
  if (cameraId === '09') return 1
  const candidates = EVIDENCE.filter(
    (item) => item.cameraId === cameraId && !foundEvidence.includes(item.id),
  )
  if (candidates.length === 0) return 0.06
  const distance = Math.min(...candidates.map((item) => Math.abs(item.time - time)))
  if (distance >= 2.5) return 0.08
  return Math.max(0.08, 1 - distance / 2.5)
}
