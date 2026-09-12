import { Check, Clapperboard, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { EVIDENCE_BY_ID } from '../game/cameras'
import type { EvidenceId } from '../game/types'

const CORRECT_ORDER: readonly EvidenceId[] = [
  'card-in-hand',
  'duplicate-card',
  'mirror-door',
  'missing-case',
]

const DISPLAY_ORDER: readonly EvidenceId[] = [
  'mirror-door',
  'missing-case',
  'card-in-hand',
  'duplicate-card',
]

interface TemporalSplicePanelProps {
  onMiss: () => void
  onComplete: () => void
  onClose: () => void
}

export function TemporalSplicePanel({ onMiss, onComplete, onClose }: TemporalSplicePanelProps) {
  const [sequence, setSequence] = useState<EvidenceId[]>([])
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState('')

  const toggle = (id: EvidenceId) => {
    setFeedback('')
    setSequence((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length < CORRECT_ORDER.length ? [...current, id] : current)
  }

  const verify = () => {
    if (sequence.length !== CORRECT_ORDER.length) return
    const correct = sequence.every((id, index) => id === CORRECT_ORDER[index])
    if (correct) {
      onComplete()
      return
    }
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setFeedback(nextAttempts >= 2
      ? '母带提示：最早的画面里，黑卡还握在苏晚手中；最后消失的是装载第九路信号的设备箱。'
      : '剪接无法闭合：至少一件物证在抵达现场之前，就已经出现在另一台机位。')
    setSequence([])
    onMiss()
  }

  return (
    <div className="modal-backdrop splice-backdrop">
      <section className="temporal-splice" role="dialog" aria-modal="true" aria-labelledby="splice-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="暂不重建时间"><X size={16} /></button>
        <header>
          <span>SYNC TABLE / 时间重建</span>
          <h2 id="splice-title">把四帧放回它们真正发生的顺序。</h2>
          <p>系统隐藏了时间码。根据物件的位置和现场变化，从最早到最晚依次选择。</p>
        </header>

        <div className="splice-strip" aria-label="待重建的四帧">
          {DISPLAY_ORDER.map((id) => {
            const item = EVIDENCE_BY_ID[id]
            const order = sequence.indexOf(id)
            return (
              <button
                type="button"
                key={id}
                className={order >= 0 ? 'is-selected' : ''}
                onClick={() => toggle(id)}
                aria-pressed={order >= 0}
              >
                <img src={item.image} alt="" width="512" height="512" />
                <i>{order >= 0 ? String(order + 1).padStart(2, '0') : '—'}</i>
                <strong>{item.title}</strong>
                <small>CAM-{item.cameraId} · 时间码已遮蔽</small>
              </button>
            )
          })}
        </div>

        <div className="splice-result">
          <div>
            <Clapperboard size={16} />
            <span><b>{sequence.length}/4 帧已装入</b><small>再次点击可撤回该帧</small></span>
          </div>
          <button type="button" onClick={verify} disabled={sequence.length !== CORRECT_ORDER.length}>
            <Check size={15} />验证真实顺序
          </button>
        </div>

        {feedback && <p className="splice-feedback" role="alert">{feedback}</p>}
        {attempts >= 2 && (
          <button className="splice-assist" type="button" onClick={() => setSequence([...CORRECT_ORDER])}>
            <RotateCcw size={14} />按照母带残留时间码排列
          </button>
        )}
      </section>
    </div>
  )
}
