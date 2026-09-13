import { ChevronRight, Eye, RotateCcw, ScanSearch, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { EndingId, PlayerMemory } from '../game/types'

interface RevelationPanelProps {
  open: boolean
  mistakes: number
  linkCount: number
  memory: PlayerMemory | null
  ending: EndingId | null
  onDismiss: () => void
  onOpenEvidence: () => void
  onChooseEnding: (endingId: EndingId) => void
  onReset: () => void
  renderEndingPv?: boolean
}

const ENDING_IMAGES: Record<EndingId, string> = {
  preserve: new URL('../../art/runtime/endings/preserve.webp', import.meta.url).href,
  answer: new URL('../../art/runtime/endings/answer.webp', import.meta.url).href,
  erase: new URL('../../art/runtime/endings/erase.webp', import.meta.url).href,
  broadcast: new URL('../../art/runtime/endings/broadcast.webp', import.meta.url).href,
  follow: new URL('../../art/runtime/endings/follow.webp', import.meta.url).href,
}

const ENDINGS: Record<EndingId, { label: string; detail: string; title: string; result: string; focus: string }> = {
  preserve: {
    label: '复制并封存母带', detail: '让至少两个人同时记住苏晚。', title: '结局 · 守片人', focus: '检查唯一亮着的监视器',
    result: '你把第九机位复制到一卷不联网的磁带。第二天，所有监控恢复正常——只有你的副本里，苏晚仍在每个整点回头。',
  },
  answer: {
    label: '回应未知信号', detail: '告诉她：我还记得你。', title: '结局 · 第十秒', focus: '确认空椅上的人',
    result: '时间码第一次越过 23:47:10。画面中的空椅上多了一个背对镜头的人——那个人穿着你的外套。',
  },
  erase: {
    label: '删除自己的记录', detail: '切断第九机位最后的见证人。', title: '结局 · 空机位', focus: '按下无人值守的快门',
    result: '苏晚重新出现在合影里；但相机后再也没有摄影师。系统把你的名字标记为“从未到场”。',
  },
  broadcast: {
    label: '接回婚礼直播', detail: '把三组矛盾同时投向所有来宾。', title: '隐藏结局 · 两场婚礼', focus: '让两场婚礼同时显影',
    result: '所有宾客同时记起两场互不相同的婚礼。白礁酒店再也无法只删除一个见证人。',
  },
  follow: {
    label: '穿过反射里的门', detail: '沿七岁时留下的脚印进入零层。', title: '隐藏结局 · 归还姓名', focus: '接过十二年前的黑卡',
    result: '镜中门缝打开。苏晚把黑卡交还给七岁的你，然后第一次从第九机位之外走进清晨。',
  },
}

export function RevelationPanel({ open, mistakes, linkCount, memory, ending, onDismiss, onOpenEvidence, onChooseEnding, onReset, renderEndingPv = false }: RevelationPanelProps) {
  const [wide, setWide] = useState(false)
  const [examined, setExamined] = useState(false)
  useEffect(() => { setWide(false); setExamined(false) }, [ending])

  const rating = mistakes === 0 && linkCount === 3 ? 'S' : mistakes <= 3 ? 'A' : mistakes <= 7 ? 'B' : 'C'
  const memoryLine = memory?.approach === 'intervene'
    ? '你没能推开那扇门，因为门的另一侧比你慢了十二年。'
    : '你选择继续拍摄，所以第九机位终于也看见了你。'
  const endingLock = (id: EndingId) => {
    if (id === 'broadcast' && (linkCount < 3 || mistakes > 2)) return '需要解封 3/3 档案，且误判不超过 2 次'
    if (id === 'follow' && (memory?.identity !== 'remember' || memory.focus !== 'steady')) return '需要相信旧记忆，并在服务门前稳住镜头'
    return null
  }
  if (!open) return <button className="revelation-reopen" type="button" onClick={onDismiss}>查看第九机位解读</button>

  if (ending) {
    if (!renderEndingPv) return null
    const endingData = ENDINGS[ending]
    return createPortal(
      <section className={`ending-pv ending-${ending}${wide ? ' is-wide' : ''}${examined ? ' is-examined' : ''}`} aria-live="polite">
        <figure>
          <img src={ENDING_IMAGES[ending]} alt={endingData.title} width="1918" height="820" />
          <div className="ending-pv-shutter" aria-hidden="true" />
        </figure>
        {!wide ? (
          <button className="ending-pv-expand" type="button" onClick={() => setWide(true)}>
            <Eye size={17} /><span>拉开镜头</span><i aria-hidden="true" />
          </button>
        ) : (
          <button className="ending-pv-hotspot" type="button" onClick={() => setExamined(true)} aria-label={endingData.focus}>
            <ScanSearch size={22} /><span>{endingData.focus}</span>
          </button>
        )}
        <div className="ending-pv-caption">
          <span>FINAL CUT / {String((Object.keys(ENDINGS) as EndingId[]).indexOf(ending) + 1).padStart(2, '0')}</span>
          <strong>{endingData.title}</strong>
          <p>{endingData.result}</p>
          <div>
            <button type="button" onClick={onOpenEvidence}>对照证据 <ChevronRight size={13} /></button>
            <button type="button" onClick={onReset}><RotateCcw size={13} />重新调查</button>
          </div>
        </div>
      </section>
    , document.body)
  }

  return (
    <aside className="revelation-panel" aria-label="第九机位解读">
      <button className="revelation-close" type="button" onClick={onDismiss} aria-label="收起解读"><X size={15} /></button>
      <span>回放源异常 · 十二年前 · 档案 {linkCount}/3 · 观察评级 {rating}</span>
      <strong>你解开的不是一段缺失监控，<br />而是一层被覆盖的时间。</strong>
      <blockquote>苏晚不是今晚才第一次“消失”。</blockquote>
      <p className="revelation-memory">{memoryLine}</p>
      {linkCount < 3 && <p className="revelation-missing">仍有一项白礁档案未解封。完整联结可获得 S 评级。</p>}
      <section className="ending-decision" aria-labelledby="ending-question">
        <span>FINAL CUT / 最后的选择</span>
        <strong id="ending-question">你要如何处理第九机位？</strong>
        <div>
          {(Object.keys(ENDINGS) as EndingId[]).map((id) => {
            const lock = endingLock(id)
            return <button type="button" key={id} onClick={() => onChooseEnding(id)} disabled={Boolean(lock)}><b>{ENDINGS[id].label}</b><small>{lock ?? ENDINGS[id].detail}</small></button>
          })}
        </div>
      </section>
    </aside>
  )
}
