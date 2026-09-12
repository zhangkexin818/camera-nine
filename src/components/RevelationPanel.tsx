import { ChevronRight, RotateCcw, X } from 'lucide-react'
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
}

const ENDINGS: Record<EndingId, { label: string; detail: string; title: string; result: string }> = {
  preserve: {
    label: '复制并封存母带',
    detail: '让至少两个人同时记住苏晚。',
    title: '结局 · 守片人',
    result: '你把第九机位复制到一卷不联网的磁带。第二天，白礁酒店的全部监控都恢复正常——只有你的副本里，苏晚仍在每个整点回头。',
  },
  answer: {
    label: '回应未知信号',
    detail: '告诉她：我还记得你。',
    title: '结局 · 第十秒',
    result: '你对着没有麦克风的机位说出她的名字。时间码第一次越过 23:47:10，画面中的空椅上多了一个背对镜头的人。那个人穿着你的外套。',
  },
  erase: {
    label: '删除自己的记录',
    detail: '切断第九机位最后的见证人。',
    title: '结局 · 空机位',
    result: '文件删除成功。八台摄影机里苏晚重新出现，婚礼照常继续；但所有合影都少了一位摄影师。系统把你的名字标记为“从未到场”。',
  },
  broadcast: {
    label: '接回婚礼直播',
    detail: '把三组矛盾同时投向所有来宾。',
    title: '隐藏结局 · 两场婚礼',
    result: '你把第九路信号切回宴会厅。凌晨零点，所有宾客同时记起两场互不相同的婚礼：一场苏晚失踪，一场路野从未出生。白礁酒店再也无法只删除一个见证人。',
  },
  follow: {
    label: '穿过反射里的门',
    detail: '沿着七岁时留下的脚印进入零层。',
    title: '隐藏结局 · 归还姓名',
    result: '你没有回应苏晚，而是叫出她十二年前登记时使用的名字。镜中门缝打开，七岁的你站在零层尽头。苏晚把黑卡交还给他，然后第一次从第九机位之外走进清晨。',
  },
}

export function RevelationPanel({
  open,
  mistakes,
  linkCount,
  memory,
  ending,
  onDismiss,
  onOpenEvidence,
  onChooseEnding,
  onReset,
}: RevelationPanelProps) {
  const rating = mistakes === 0 && linkCount === 3 ? 'S' : mistakes <= 3 ? 'A' : mistakes <= 7 ? 'B' : 'C'
  const memoryLine = memory?.approach === 'intervene'
    ? '你当时没能推开那扇门，因为门的另一侧比你慢了十二年。'
    : '你当时选择继续拍摄，所以第九机位终于也看见了你。'
  const endingLock = (id: EndingId) => {
    if (id === 'broadcast' && (linkCount < 3 || mistakes > 2)) return '需要解封 3/3 档案，且误判不超过 2 次'
    if (id === 'follow' && (memory?.identity !== 'remember' || memory.focus !== 'steady')) return '需要相信旧记忆，并在服务门前稳住镜头'
    return null
  }
  if (!open) {
    return (
      <button className="revelation-reopen" type="button" onClick={onDismiss}>
        查看第九机位解读
      </button>
    )
  }

  return (
    <aside className="revelation-panel" aria-label="第九机位解读">
      <button className="revelation-close" type="button" onClick={onDismiss} aria-label="收起解读">
        <X size={15} />
      </button>
      <span>回放源异常 · 十二年前 · 档案 {linkCount}/3 · 观察评级 {rating}</span>
      <strong>你解开的不是一段缺失监控，<br />而是一层被覆盖的时间。</strong>
      <p>
        同一间宴会厅。所有人举手通过了一项未出现在婚礼档案里的表决；
        中央留给证人的椅子是空的。
      </p>
      <blockquote>苏晚不是今晚才第一次“消失”。</blockquote>
      <p className="revelation-memory">{memoryLine}</p>
      {linkCount < 3 && <p className="revelation-missing">仍有一页白礁档案未解封。完整联结全部五条观察可获得 S 评级。</p>}
      {!ending ? (
        <section className="ending-decision" aria-labelledby="ending-question">
          <span>FINAL CUT / 最后的选择</span>
          <strong id="ending-question">你要如何处理第九机位？</strong>
          <div>
            {(Object.keys(ENDINGS) as EndingId[]).map((id) => {
              const lock = endingLock(id)
              return (
                <button type="button" key={id} onClick={() => onChooseEnding(id)} disabled={Boolean(lock)}>
                  <b>{ENDINGS[id].label}</b><small>{lock ?? ENDINGS[id].detail}</small>
                </button>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="ending-resolution" aria-live="polite">
          <span>{ENDINGS[ending].title}</span>
          <p>{ENDINGS[ending].result}</p>
          <div>
            <button type="button" onClick={onOpenEvidence}>对照证据 <ChevronRight size={13} /></button>
            <button type="button" onClick={onReset}><RotateCcw size={13} />重新调查</button>
          </div>
        </section>
      )}
    </aside>
  )
}
