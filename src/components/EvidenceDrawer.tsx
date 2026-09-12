import { ChevronDown, GitMerge, RotateCcw, X } from 'lucide-react'
import { memo } from 'react'
import { EVIDENCE, EVIDENCE_BY_ID } from '../game/cameras'
import type { EvidenceId } from '../game/types'

interface EvidenceDrawerProps {
  open: boolean
  evidence: EvidenceId[]
  coreFound: number
  linksFound: number
  onToggle: () => void
  onClose: () => void
  onOpenCaseBoard: () => void
  onReset: () => void
}

export const EvidenceDrawer = memo(function EvidenceDrawer({
  open,
  evidence,
  coreFound,
  linksFound,
  onToggle,
  onClose,
  onOpenCaseBoard,
  onReset,
}: EvidenceDrawerProps) {
  return (
    <aside className={`evidence-drawer${open ? ' is-open' : ''}`} aria-label="证据记录">
      <button
        className="evidence-toggle"
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="evidence-panel"
      >
        <span>证据</span>
        <strong aria-live="polite" aria-atomic="true">{coreFound}/4</strong>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className="evidence-panel" id="evidence-panel">
          <header>
            <div>
              <span>观察记录</span>
              <strong>{evidence.length}/{EVIDENCE.length}</strong>
            </div>
            <button type="button" onClick={onClose} aria-label="关闭证据记录"><X size={16} /></button>
          </header>
          <ol>
            {EVIDENCE.map((item) => {
              const found = evidence.includes(item.id)
              const resolved = found ? EVIDENCE_BY_ID[item.id] : null
              return (
                <li key={item.id} className={found ? 'is-found' : ''}>
                  <div className="evidence-thumb">
                    {resolved ? <img src={resolved.image} alt="" /> : <i aria-hidden="true">?</i>}
                  </div>
                  <span>CAM-{item.cameraId}</span>
                  <div>
                    <strong>{resolved?.title ?? '未确认'}</strong>
                    <p>{resolved?.detail ?? '尚未确认。比较不同机位的画面变化。'}</p>
                  </div>
                </li>
              )
            })}
          </ol>
          <button className="case-board-button" type="button" onClick={onOpenCaseBoard} disabled={evidence.length < 2}>
            <GitMerge size={14} aria-hidden="true" />
            {evidence.length < 2 ? '至少观察两条证据' : `建立证据联结 · ${linksFound}/2`}
          </button>
          <button className="reset-button" type="button" onClick={onReset}>
            <RotateCcw size={14} aria-hidden="true" />
            重置十秒片段
          </button>
        </div>
      )}
    </aside>
  )
})
