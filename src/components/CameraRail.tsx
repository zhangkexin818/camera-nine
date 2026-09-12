import { LockKeyhole } from 'lucide-react'
import { memo, useEffect, useRef } from 'react'
import { CAMERAS, CAMERA_IDS } from '../game/cameras'
import type { CameraId } from '../game/types'

interface CameraRailProps {
  activeCamera: CameraId
  cameraNineUnlocked: boolean
  onSelect: (cameraId: CameraId) => void
}

export const CameraRail = memo(function CameraRail({
  activeCamera,
  cameraNineUnlocked,
  onSelect,
}: CameraRailProps) {
  const activeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'auto',
    })
  }, [activeCamera])

  return (
    <nav className="camera-rail" aria-label="机位选择">
      {CAMERA_IDS.map((cameraId) => {
        const locked = cameraId === '09' && !cameraNineUnlocked
        const camera = CAMERAS[cameraId]
        return (
          <button
            className={`camera-key${activeCamera === cameraId ? ' is-active' : ''}${cameraId === '09' ? ' is-nine' : ''}`}
            type="button"
            key={cameraId}
            ref={activeCamera === cameraId ? activeButtonRef : undefined}
            onClick={() => onSelect(cameraId)}
            aria-pressed={activeCamera === cameraId}
            aria-label={`CAM-${cameraId}，${camera.location}${locked ? '，锁定' : ''}`}
            disabled={locked}
            title={locked ? '找齐核心矛盾并完成推断后开放' : camera.location}
          >
            <span>{cameraId}</span>
            {locked ? (
              <LockKeyhole size={11} aria-hidden="true" />
            ) : (
              <span className="signal-bars" aria-hidden="true"><i /><i /><i /></span>
            )}
          </button>
        )
      })}
    </nav>
  )
})
