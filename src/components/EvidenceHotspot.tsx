import { ScanSearch } from 'lucide-react'
import { memo } from 'react'
import type { EvidenceDefinition } from '../game/types'

interface EvidenceHotspotProps {
  evidence: EvidenceDefinition
  discovered: boolean
  guided: boolean
  onDiscover: () => void
}

export const EvidenceHotspot = memo(function EvidenceHotspot({
  evidence,
  discovered,
  guided,
  onDiscover,
}: EvidenceHotspotProps) {
  const { hotspot } = evidence
  return (
    <button
      className={`evidence-hotspot${discovered ? ' is-discovered' : ''}${guided ? ' is-guided' : ''}`}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: `${hotspot.width * 100}%`,
        height: `${hotspot.height * 100}%`,
      }}
      type="button"
      onClick={onDiscover}
      aria-label={`${discovered ? '已标记' : '标记证据'}：${evidence.title}`}
    >
      <span className="hotspot-corner corner-tl" />
      <span className="hotspot-corner corner-tr" />
      <span className="hotspot-corner corner-bl" />
      <span className="hotspot-corner corner-br" />
      <span className="hotspot-label">
        <ScanSearch aria-hidden="true" size={13} />
        {discovered ? '已标记' : guided ? '检查这里' : evidence.title}
      </span>
    </button>
  )
})
