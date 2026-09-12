import { Lightbulb, ScanSearch, Volume2, X } from 'lucide-react'

interface GameHelpProps {
  onClose: () => void
}

export function GameHelp({ onClose }: GameHelpProps) {
  return (
    <div className="modal-backdrop">
      <section className="help-panel" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭行动规则"><X size={16} /></button>
        <span>封存回放 / 行动规则</span>
        <h2 id="help-title">不要找标记。找画面之间的矛盾。</h2>
        <ol>
          <li><b>切换机位，播放或拖动十秒时间轴。</b><p>每台摄影机在不同秒数发生变化；先比较“之前”和“之后”。</p></li>
          <li><b>观察右上角的异常强度。</b><p>它只说明你是否靠近时间错位，不会告诉你答案在哪里。卡住十秒后，时间回声会给出下一步方向。</p></li>
          <li><b>开启检视，在画面上亲自指出可疑细节。</b><p>错误不会结束游戏，但会降低最终观察评级。</p></li>
          <li><b>把两条证据放进联结台。</b><p>有效矛盾会解封白礁酒店旧档；至少建立两条联结，才能提交推断。</p></li>
          <li><b>完成推断，再决定如何处理第九机位。</b><p>三个最终选择对应不同结局；重新调查可尝试另一条路线。</p></li>
        </ol>
        <div className="help-icons"><span><ScanSearch size={14} />E 开启检视</span><span><Lightbulb size={14} />随时调取提示</span><span><Volume2 size={14} />纯音乐配乐可随时关闭</span></div>
        <button className="help-continue" type="button" onClick={onClose} autoFocus>返回回放</button>
      </section>
    </div>
  )
}
