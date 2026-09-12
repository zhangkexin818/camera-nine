import { ArrowRight, Clock3, Lightbulb, X } from 'lucide-react'
import type { InvestigationHint } from '../game/guidance'

interface ArchiveHintProps {
  hint: InvestigationHint
  automatic: boolean
  onFollow: () => void
  onDismiss: () => void
}

export function ArchiveHint({ hint, automatic, onFollow, onDismiss }: ArchiveHintProps) {
  return (
    <aside className="archive-hint" role="status" aria-label="调查提示">
      <div className="archive-hint-signal" aria-hidden="true"><Lightbulb size={16} /></div>
      <div className="archive-hint-copy">
        <span>{hint.eyebrow}</span>
        <strong>{hint.title}</strong>
        <p>{hint.body}</p>
        <small><Clock3 size={12} aria-hidden="true" />{automatic ? '停滞 10 秒后自动出现' : '手动调取，不计误判'}</small>
      </div>
      <div className="archive-hint-actions">
        <button className="archive-hint-follow" type="button" onClick={onFollow}>
          {hint.actionLabel}<ArrowRight size={14} aria-hidden="true" />
        </button>
        <button className="archive-hint-dismiss" type="button" onClick={onDismiss} aria-label="暂时收起调查提示">
          <X size={14} aria-hidden="true" />暂时收起
        </button>
      </div>
    </aside>
  )
}
