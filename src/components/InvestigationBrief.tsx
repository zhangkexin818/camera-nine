import { BrainCircuit, GitMerge, RadioTower } from 'lucide-react'
import type { PlayerMemory } from '../game/types'

interface InvestigationBriefProps {
  coreFound: number
  totalFound: number
  linkCount: number
  memory: PlayerMemory | null
  memoryRevealed: boolean
  hypothesisCorrect: boolean
  onRevealMemory: () => void
  onOpenDeduction: () => void
  onOpenCaseBoard: () => void
  onEnterCameraNine: () => void
}

const LEADS = [
  {
    title: '十秒里，哪一帧先说了谎？',
    body: '自由切换八台机位，播放或拖动时间。比较画面变化；异常强度越高，越接近时间错位。',
  },
  {
    title: '一条证据不是答案',
    body: '现在去找一个能与它同时成立、却又彼此矛盾的画面。物件、空间和行动轨迹都可能说谎。',
  },
  {
    title: '摄像机没有在记录同一个“现在”',
    body: '不要只追踪苏晚。寻找被移动的物件、无法闭合的空间，以及没有来路的痕迹。',
  },
  {
    title: '还缺最后一块拼图',
    body: '最后的矛盾不一定发生在人身上。检查那些本应一直待在原位的东西。',
  },
  {
    title: '证据齐了。现在轮到你判断。',
    body: '系统不会替你总结答案。选择一种解释；错误判断会被记录，但你仍可重新作答。',
  },
] as const

export function InvestigationBrief({
  coreFound,
  totalFound,
  linkCount,
  memory,
  memoryRevealed,
  hypothesisCorrect,
  onRevealMemory,
  onOpenDeduction,
  onOpenCaseBoard,
  onEnterCameraNine,
}: InvestigationBriefProps) {
  const lead = LEADS[Math.min(coreFound, 4)]
  const needsLinks = coreFound >= 4 && linkCount < 2
  const memoryText = memory?.memory === 'signal'
    ? '你的记忆：停电前，走廊尽头的红色门禁灯已经亮了。'
    : '你的记忆：苏晚把一张无标识黑卡贴近了你的镜头。'

  return (
    <aside className={`investigation-brief${hypothesisCorrect ? ' is-unlocked' : ''}`} aria-live="polite">
      <div>
        <span>调查进度 · 核心 {coreFound}/4 · 联结 {linkCount}/2 · 观察 {totalFound}/5</span>
        <strong>{hypothesisCorrect ? '未知信号正在呼叫' : needsLinks ? '画面够了，因果还没有闭合' : lead.title}</strong>
      </div>
      <p>{hypothesisCorrect
        ? '你的推断与隐藏信号匹配。CAM-09 不属于酒店的摄像系统。'
        : needsLinks
          ? '打开证据联结台，选择两条无法同时成立的画面。每个有效联结都会解封一页白礁旧档。'
          : memoryRevealed ? memoryText : lead.body}</p>
      {hypothesisCorrect ? (
        <button type="button" onClick={onEnterCameraNine}><RadioTower size={14} />接受 CAM-09</button>
      ) : needsLinks ? (
        <button type="button" onClick={onOpenCaseBoard}><GitMerge size={14} />建立联结</button>
      ) : coreFound >= 4 && linkCount >= 2 ? (
        <button type="button" onClick={onOpenDeduction}><BrainCircuit size={14} />提交推断</button>
      ) : (
        <button type="button" onClick={onRevealMemory} disabled={memoryRevealed}>
          <BrainCircuit size={14} />{memoryRevealed ? '已调取现场记忆' : '回想停电前'}
        </button>
      )}
    </aside>
  )
}
