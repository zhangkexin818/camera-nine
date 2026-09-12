import { Crosshair, RadioTower } from 'lucide-react'
import type { InvestigationObjective } from '../game/objectives'
import type { CameraId } from '../game/types'

interface ObjectiveGuideProps {
  objective?: InvestigationObjective
  cameraId: CameraId
  time: number
  onLocate: (cameraId: CameraId, time: number) => void
  onEnterCameraNine: () => void
}

export function ObjectiveGuide({
  objective,
  cameraId,
  time,
  onLocate,
  onEnterCameraNine,
}: ObjectiveGuideProps) {
  if (!objective) {
    return (
      <aside className="objective-guide is-unlocked" aria-live="polite">
        <span className="objective-kicker"><RadioTower size={13} />信号源已解除锁定</span>
        <strong>不存在的 CAM-09 已经出现</strong>
        <p>四条画面无法属于同一条时间线。进入第九机位，查看它记录的年份。</p>
        <button type="button" onClick={onEnterCameraNine}>进入 CAM-09</button>
      </aside>
    )
  }

  const isLocated = cameraId === objective.cameraId && Math.abs(time - objective.time) < 0.04

  return (
    <aside className="objective-guide" aria-live="polite">
      <span className="objective-kicker">
        调查 {String(objective.step).padStart(2, '0')} / 04 · {objective.kicker}
      </span>
      <strong>{objective.title}</strong>
      <p>{objective.hint}</p>
      <button
        type="button"
        className={isLocated ? 'is-located' : ''}
        onClick={() => onLocate(objective.cameraId, objective.time)}
      >
        <Crosshair size={13} aria-hidden="true" />
        {isLocated ? '目标帧已定位 · 检查画面' : objective.actionLabel}
      </button>
    </aside>
  )
}
