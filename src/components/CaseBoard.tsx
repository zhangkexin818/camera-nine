import { Archive, ArrowRight, Check, GitMerge, LockKeyhole, ScanSearch, X } from 'lucide-react'
import { useState } from 'react'
import { EVIDENCE_LINKS, EVIDENCE_LINK_BY_ID, REQUIRED_EVIDENCE_LINKS } from '../game/archive'
import { EVIDENCE_BY_ID } from '../game/cameras'
import type { EvidenceId, EvidenceLinkId } from '../game/types'

export interface LinkFeedback {
  tone: 'success' | 'miss' | 'known'
  title: string
  body: string
}

interface CaseBoardProps {
  evidence: EvidenceId[]
  links: EvidenceLinkId[]
  feedback: LinkFeedback | null
  onVerify: (left: EvidenceId, right: EvidenceId) => void
  onTrackEvidence: (id: EvidenceId) => void
  onContinue: () => void
  onClose: () => void
}

export function CaseBoard({
  evidence,
  links,
  feedback,
  onVerify,
  onTrackEvidence,
  onContinue,
  onClose,
}: CaseBoardProps) {
  const [selected, setSelected] = useState<EvidenceId[]>([])
  const requiredLinksComplete = links.length >= REQUIRED_EVIDENCE_LINKS

  const toggleEvidence = (id: EvidenceId) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length === 2) return [current[1], id]
      return [...current, id]
    })
  }

  const verify = () => {
    if (selected.length !== 2) return
    onVerify(selected[0], selected[1])
    setSelected([])
  }

  return (
    <div className="modal-backdrop case-board-backdrop">
      <section className="case-board" role="dialog" aria-modal="true" aria-labelledby="case-board-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭证据联结台"><X size={16} /></button>
        <header className="case-board-heading">
          <span>白礁酒店 / 封存档案</span>
          <h2 id="case-board-title">把两条画面放在一起，看它们能否同时成立。</h2>
          <p>选择两条已观察证据。有效矛盾会解封一页酒店旧档；错误联结会计入观察评级。</p>
        </header>

        <div className="case-board-status">
          <span><GitMerge size={14} />有效联结 <b>{links.length}/{REQUIRED_EVIDENCE_LINKS}</b></span>
          <span><Archive size={14} />档案解封 <b>{links.length}/{EVIDENCE_LINKS.length}</b></span>
        </div>

        <div className="case-board-workspace">
          <div className="case-evidence-list" aria-label="已观察证据">
            {evidence.map((id, index) => {
              const item = EVIDENCE_BY_ID[id]
              const selectionIndex = selected.indexOf(id)
              return (
                <button
                  type="button"
                  key={id}
                  className={selectionIndex >= 0 ? 'is-selected' : ''}
                  onClick={() => toggleEvidence(id)}
                  aria-pressed={selectionIndex >= 0}
                  autoFocus={index === 0}
                >
                  <img src={item.image} alt="" />
                  <i>{selectionIndex >= 0 ? `0${selectionIndex + 1}` : `CAM-${item.cameraId}`}</i>
                  <span><b>{item.title}</b><small>{item.detail}</small></span>
                </button>
              )
            })}
          </div>

          <div className="case-link-console">
            <div className="case-link-slots" aria-label="待验证联结">
              {[0, 1].map((slot) => {
                const selectedEvidence = selected[slot] ? EVIDENCE_BY_ID[selected[slot]] : null
                return (
                  <div className={selectedEvidence ? 'is-filled' : ''} key={slot}>
                    {selectedEvidence && <img src={selectedEvidence.image} alt="" />}
                    <i>0{slot + 1}</i>
                    <strong>{selectedEvidence?.title ?? '选择一条证据'}</strong>
                    <span>{selectedEvidence ? `CAM-${selectedEvidence.cameraId} · ${selectedEvidence.time.toFixed(2)}s` : '等待画面记录'}</span>
                  </div>
                )
              })}
            </div>
            <button className="verify-link-button" type="button" onClick={verify} disabled={selected.length !== 2}>
              <GitMerge size={15} />验证两条画面
            </button>
            {feedback && (
              <div className={`case-link-feedback is-${feedback.tone}`} role={feedback.tone === 'miss' ? 'alert' : 'status'}>
                <strong>{feedback.title}</strong><p>{feedback.body}</p>
              </div>
            )}
          </div>
        </div>

        <section className="archive-fragments" aria-label="已解封白礁档案">
          <header><span>ARCHIVE FRAGMENTS</span><b>世界规则不会直接告诉你，只会从矛盾里露出来。</b></header>
          <div>
            {EVIDENCE_LINKS.map((definition) => {
              const unlocked = links.includes(definition.id)
              const resolved = unlocked ? EVIDENCE_LINK_BY_ID[definition.id] : null
              const missingEvidence = definition.evidence.find((id) => !evidence.includes(id))
              const isOptional = definition.id === 'broken-route'
              return (
                <article className={`${unlocked ? 'is-unlocked' : ''}${isOptional ? ' is-optional' : ''}`} key={definition.id}>
                  {resolved && (
                    <div className="archive-fragment-visuals" aria-label={`${resolved.title}的联结画面`}>
                      {resolved.evidence.map((id) => (
                        <img src={EVIDENCE_BY_ID[id].image} alt={EVIDENCE_BY_ID[id].title} key={id} />
                      ))}
                    </div>
                  )}
                  {unlocked ? <Check size={14} /> : <LockKeyhole size={14} />}
                  <span>{resolved?.archive.code ?? (isOptional ? 'EXTRA / 可选调查' : 'REDACTED / 未解封')}</span>
                  <strong>{resolved?.archive.title ?? (isOptional ? '零层路径仍缺一帧' : '建立新的有效联结')}</strong>
                  <p>{resolved?.archive.body ?? (missingEvidence
                    ? `已有画面无法闭合。另一半线索来自 CAM-${EVIDENCE_BY_ID[missingEvidence].cameraId}。`
                    : '两条相关画面都已收录，把它们装入联结槽验证。')}</p>
                  {resolved && <blockquote>{resolved.archive.quote}</blockquote>}
                  {!unlocked && missingEvidence && (
                    <button
                      className="archive-track-button"
                      type="button"
                      onClick={() => onTrackEvidence(missingEvidence)}
                    >
                      <ScanSearch size={13} />追踪缺失画面 · CAM-{EVIDENCE_BY_ID[missingEvidence].cameraId}
                    </button>
                  )}
                  {!unlocked && !missingEvidence && (
                    <button
                      className="archive-track-button"
                      type="button"
                      onClick={() => setSelected([...definition.evidence])}
                    >
                      <GitMerge size={13} />装载这组证物
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        {requiredLinksComplete && (
          <footer className="case-board-next-step">
            <div>
              <span>MAIN THREAD READY</span>
              <strong>两条核心矛盾已经成立。</strong>
              <p>你可以进入最终推断；“零层路径”是额外调查，不会阻断主线。</p>
            </div>
            <button type="button" onClick={onContinue}>进入最终推断<ArrowRight size={15} /></button>
          </footer>
        )}
      </section>
    </div>
  )
}
