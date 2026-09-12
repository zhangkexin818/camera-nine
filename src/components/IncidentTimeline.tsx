import { EVIDENCE } from '../game/cameras'
import { formatSecondTick, INCIDENT_DURATION } from '../game/time'

interface IncidentTimelineProps {
  time: number
  foundEvidence: string[]
  onSeek: (time: number) => void
}

const ticks = Array.from({ length: INCIDENT_DURATION + 1 }, (_, index) => index)

export function IncidentTimeline({ time, foundEvidence, onSeek }: IncidentTimelineProps) {
  return (
    <div className="timeline" aria-label="事件时间轴">
      <div className="timeline-track" aria-hidden="true">
        {ticks.map((tick) => (
          <span className="second-tick" key={tick} style={{ left: `${tick * 10}%` }}>
            <i />
            <b>{formatSecondTick(tick)}</b>
          </span>
        ))}
        {EVIDENCE.filter((item) => foundEvidence.includes(item.id)).map((item) => (
          <span
            className="evidence-tick is-found"
            key={item.id}
            style={{ left: `${item.time * 10}%` }}
          />
        ))}
        <span className="playhead" style={{ left: `${time * 10}%` }}><i /></span>
      </div>
      <input
        className="timeline-range"
        type="range"
        min="0"
        max={INCIDENT_DURATION}
        step={1 / 24}
        value={time}
        onChange={(event) => onSeek(Number(event.currentTarget.value))}
        aria-label={`播放位置 ${formatSecondTick(time)}`}
      />
    </div>
  )
}
