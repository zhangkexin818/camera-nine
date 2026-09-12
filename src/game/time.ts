export const INCIDENT_DURATION = 10
export const FRAME_RATE = 24
export const INITIAL_TIME = 0

const START_HOUR = 23
const START_MINUTE = 46
const START_SECOND = 55

export function clampTime(value: number) {
  return Math.min(INCIDENT_DURATION, Math.max(0, value))
}

export function formatClock(time: number) {
  const safeTime = clampTime(time)
  const wholeSeconds = Math.floor(safeTime)
  const frame = Math.min(
    FRAME_RATE - 1,
    Math.floor((safeTime - wholeSeconds + Number.EPSILON) * FRAME_RATE),
  )
  const totalSeconds = START_HOUR * 3600 + START_MINUTE * 60 + START_SECOND + wholeSeconds
  const hour = Math.floor(totalSeconds / 3600) % 24
  const minute = Math.floor((totalSeconds % 3600) / 60)
  const second = totalSeconds % 60
  return [hour, minute, second, frame].map((part) => String(part).padStart(2, '0')).join(':')
}

export function formatSecondTick(offset: number) {
  const value = formatClock(offset).split(':')
  return `${value[0]}:${value[1]}:${value[2]}`
}
