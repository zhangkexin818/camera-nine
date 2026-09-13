import { Aperture, Building2, Check, Film, Fingerprint } from 'lucide-react'
import { useState } from 'react'
import type { PrologueIdentity } from '../game/types'
import type { AudioCue } from '../hooks/useGameAudio'

const luYe = new URL('../../art/runtime/portraits/lu-ye-workcard.webp', import.meta.url).href
const hotel = new URL('../../art/runtime/cam-03_static.webp', import.meta.url).href
const oldTape = new URL('../../art/runtime/prologue_su-wan-warning.webp', import.meta.url).href

const RECORDS = [
  { id: 'identity', icon: Fingerprint, label: '工作证', image: luYe },
  { id: 'floor', icon: Building2, label: '楼层扫描', image: hotel },
  { id: 'tape', icon: Film, label: '受损录像', image: oldTape },
] as const

interface IdentityEvidenceSequenceProps {
  onCue: (cue: AudioCue) => void
  onChoose: (identity: PrologueIdentity) => void
}

export function IdentityEvidenceSequence({ onCue, onChoose }: IdentityEvidenceSequenceProps) {
  const [opened, setOpened] = useState<string[]>([])
  const [active, setActive] = useState<(typeof RECORDS)[number]['id']>('identity')
  const complete = opened.length === RECORDS.length

  const inspect = (id: (typeof RECORDS)[number]['id']) => {
    setActive(id)
    setOpened((current) => current.includes(id) ? current : [...current, id])
    onCue('select')
  }

  return (
    <section className="identity-visual" aria-label="路野的三件身份记录">
      <header>
        <span>23:38:07 / 现场身份核验</span>
        <strong>三份记录，指向两个你。</strong>
      </header>

      <div className={`identity-projector is-${active}`}>
        <img
          src={RECORDS.find((record) => record.id === active)?.image}
          alt=""
          width={active === 'floor' ? 1918 : active === 'identity' ? 450 : 1280}
          height={active === 'floor' ? 820 : active === 'identity' ? 600 : 720}
        />
        <div className="identity-projection" aria-live="polite">
          {active === 'identity' && <><b>路野</b><i>29</i><span><Aperture size={14} />婚礼主摄影 / 唯一影像幸存者</span></>}
          {active === 'floor' && <><b>B1</b><b>1F</b><b>2F</b><i>0F</i><span>电梯每晚多停一次</span></>}
          {active === 'tape' && <><b>档案：今日初见</b><i>12 年前</i><span>她牵着七岁的你离开酒店</span></>}
        </div>
        <div className="film-convergence" aria-hidden="true"><i>2001</i><b /><em>00:10</em><b /><i>现在</i></div>
      </div>

      <div className="identity-record-tabs">
        {RECORDS.map(({ id, icon: Icon, label }) => (
          <button type="button" key={id} className={active === id ? 'is-active' : ''} onClick={() => inspect(id)}>
            <Icon size={15} aria-hidden="true" /><span>{label}</span>{opened.includes(id) && <Check size={13} aria-hidden="true" />}
          </button>
        ))}
      </div>

      {complete ? (
        <div className="identity-verdict">
          <button type="button" onClick={() => onChoose('remember')}><b>相信身体</b><span>她认识你</span></button>
          <button type="button" onClick={() => onChoose('record')}><b>相信档案</b><span>今天是初见</span></button>
        </div>
      ) : (
        <p className="identity-prompt">查看三份记录</p>
      )}
    </section>
  )
}
