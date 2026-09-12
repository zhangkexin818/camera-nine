import { useEffect, useRef } from 'react'

interface InspectionLayerProps {
  active: boolean
  source: string
  onInspect: (x: number, y: number) => void
  onExit: () => void
}

export function InspectionLayer({ active, source, onInspect, onExit }: InspectionLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const pointRef = useRef({ x: 0.5, y: 0.5 })

  const placeReticle = (x: number, y: number) => {
    pointRef.current = { x, y }
    const layer = layerRef.current
    if (!layer) return
    const rect = layer.getBoundingClientRect()
    const zoom = 2.25
    layer.style.setProperty('--scan-x', `${x * 100}%`)
    layer.style.setProperty('--scan-y', `${y * 100}%`)
    layer.style.setProperty('--zoomed-width', `${rect.width * zoom}px`)
    layer.style.setProperty('--zoomed-height', `${rect.height * zoom}px`)
    layer.style.setProperty('--zoomed-left', `${x * rect.width * zoom}px`)
    layer.style.setProperty('--zoomed-top', `${y * rect.height * zoom}px`)
  }

  useEffect(() => {
    if (!active) return
    layerRef.current?.focus()
    const frame = window.requestAnimationFrame(() => placeReticle(pointRef.current.x, pointRef.current.y))
    return () => window.cancelAnimationFrame(frame)
  }, [active])

  if (!active) return null

  return (
    <div
      className="inspection-layer"
      ref={layerRef}
      role="application"
      tabIndex={0}
      aria-label="画面检视已开启。移动指针并点击可疑细节；键盘方向键移动准星，回车确认，Esc退出。"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        placeReticle(
          Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
          Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
        )
      }}
      onPointerDown={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        placeReticle(
          Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
          Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
        )
      }}
      onClick={() => onInspect(pointRef.current.x, pointRef.current.y)}
      onKeyDown={(event) => {
        const delta = event.shiftKey ? 0.08 : 0.025
        const next = { ...pointRef.current }
        if (event.key === 'ArrowLeft') next.x -= delta
        else if (event.key === 'ArrowRight') next.x += delta
        else if (event.key === 'ArrowUp') next.y -= delta
        else if (event.key === 'ArrowDown') next.y += delta
        else if (event.key === 'Enter' || event.key === ' ') onInspect(next.x, next.y)
        else if (event.key === 'Escape') onExit()
        else return
        event.preventDefault()
        placeReticle(Math.min(1, Math.max(0, next.x)), Math.min(1, Math.max(0, next.y)))
      }}
    >
      <span className="inspection-magnifier" aria-hidden="true">
        <span><img src={source} alt="" /></span>
        <i />
      </span>
      <span className="inspection-instruction">放大镜检视 · 移动镜片，点击画面里不可能成立的细节</span>
    </div>
  )
}
