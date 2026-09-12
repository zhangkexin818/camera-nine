import { X } from 'lucide-react'
import { EVIDENCE_LINK_BY_ID } from '../game/archive'
import { EVIDENCE_BY_ID } from '../game/cameras'
import type { EvidenceLinkId, HypothesisId } from '../game/types'

interface HypothesisPanelProps {
  links: EvidenceLinkId[]
  feedback: string | null
  onSubmit: (id: HypothesisId) => void
  onClose: () => void
}

const OPTIONS: readonly { id: HypothesisId; label: string; detail: string }[] = [
  { id: 'escape', label: '苏晚借停电逃离酒店', detail: '黑卡和设备箱是她提前布置的逃生工具。' },
  { id: 'split-time', label: '八台机位不在同一个“现在”', detail: '系统把不同时间的画面缝成了一段连续回放。' },
  { id: 'equipment', label: '直播设备发生同步故障', detail: '所谓矛盾只是断电造成的编码与缓存错误。' },
]

export function HypothesisPanel({ links, feedback, onSubmit, onClose }: HypothesisPanelProps) {
  return (
    <div className="modal-backdrop">
      <section className="hypothesis-panel" role="dialog" aria-modal="true" aria-labelledby="hypothesis-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="暂不推断"><X size={16} /></button>
        <span>核心证据 4/4 · 有效联结 {links.length}/2 · 推断节点</span>
        <h2 id="hypothesis-title">这十秒究竟发生了什么？</h2>
        <p>先重看你亲手建立的矛盾，再选择唯一能让所有画面同时成立的解释。</p>
        <div className="hypothesis-reconstruction" aria-label="已建立的图像证据链">
          {links.map((id, index) => {
            const link = EVIDENCE_LINK_BY_ID[id]
            return (
              <article key={id}>
                <div>
                  {link.evidence.map((evidenceId) => (
                    <img src={EVIDENCE_BY_ID[evidenceId].image} alt={EVIDENCE_BY_ID[evidenceId].title} key={evidenceId} />
                  ))}
                </div>
                <span>矛盾 {String(index + 1).padStart(2, '0')}</span>
                <strong>{link.title}</strong>
                <p>{link.finding}</p>
              </article>
            )
          })}
        </div>
        <strong className="hypothesis-question">你的结论</strong>
        <div className="hypothesis-options">
          {OPTIONS.map((option, index) => (
            <button type="button" key={option.id} onClick={() => onSubmit(option.id)} autoFocus={index === 0}>
              <i>{String(index + 1).padStart(2, '0')}</i>
              <span><b>{option.label}</b><small>{option.detail}</small></span>
            </button>
          ))}
        </div>
        {feedback && <p className="hypothesis-feedback" role="alert">{feedback}</p>}
      </section>
    </div>
  )
}
