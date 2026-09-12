import { Eye, MousePointerClick, Radio, ScanSearch } from 'lucide-react'

interface GameIntroProps {
  firstEntry: boolean
  onContinue: () => void
}

export function GameIntro({ firstEntry, onContinue }: GameIntroProps) {
  return (
    <div className="intro-backdrop">
      <section
        className="intro-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
        aria-describedby="intro-description"
      >
        <div className="intro-eyebrow">
          <span>白礁酒店</span>
          <i />
          <span>暴雨婚宴</span>
          <i />
          <span>23:47</span>
        </div>
        <div className="intro-title-lockup">
          <Radio size={18} aria-hidden="true" />
          <div>
            <span>交互影像调查</span>
            <h2 id="intro-title">第九机位</h2>
          </div>
        </div>
        <p className="intro-lead" id="intro-description">
          婚礼直播中断后的十秒，新娘苏晚从八台摄影机里同时消失。
          警方封存了所有监控，但回放系统中，多出一个不存在的编号。
        </p>
        <p className="intro-role">
          <Eye size={16} aria-hidden="true" />
          你是一段困在摄影机里的观察意识。不能离开镜头，只能切换机位、
          倒回这十秒，并标记彼此不可能同时成立的画面。
        </p>
        <div className="intro-mission">
          <span>本次任务</span>
          <strong>找出 4 条核心矛盾，接通 CAM-09</strong>
        </div>
        <div className="intro-controls" aria-label="基本操作">
          <span><MousePointerClick size={14} />切换机位与拖动时间</span>
          <span><ScanSearch size={14} />点击四角框标记证据</span>
        </div>
        <button className="intro-start" type="button" onClick={onContinue} autoFocus>
          {firstEntry ? '接入 CAM-08' : '继续调查'}
          <span aria-hidden="true">→</span>
        </button>
        <p className="intro-footnote">
          {firstEntry ? '画面已停在失踪前一秒 · 右上角可随时查看说明' : '当前调查进度不会丢失'}
        </p>
      </section>
    </div>
  )
}
