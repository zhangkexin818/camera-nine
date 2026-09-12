import { Archive, Check, X } from 'lucide-react'
import type { EvidenceDefinition } from '../game/types'

interface DiscoveryNoticeProps {
  evidence: EvidenceDefinition
  onDismiss: () => void
}

export function DiscoveryNotice({ evidence, onDismiss }: DiscoveryNoticeProps) {
  return (
    <div className="discovery-backdrop">
    <aside className="discovery-notice" role="dialog" aria-modal="true" aria-labelledby="discovery-title">
      <figure>
        <img src={evidence.image} alt={`${evidence.title}的封存物证图`} />
        <figcaption>FRAME EVIDENCE / CAM-{evidence.cameraId}</figcaption>
      </figure>
      <div className="discovery-copy">
        <span><Check size={13} aria-hidden="true" />观察成立 · {evidence.time.toFixed(2)} 秒</span>
        <strong id="discovery-title">{evidence.title}</strong>
        <p>{evidence.detail}</p>
        <small><Archive size={13} aria-hidden="true" />已写入封存证据，可用于后续联结</small>
        <button className="discovery-accept" type="button" onClick={onDismiss}>收录证物并继续</button>
      </div>
      <button className="discovery-close" type="button" onClick={onDismiss} aria-label="关闭证据提示">
        <X size={13} />
      </button>
    </aside>
    </div>
  )
}
