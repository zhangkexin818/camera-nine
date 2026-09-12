import { Aperture, ScanEye } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FocusOutcome, PrologueMemory } from '../game/types'
import type { AudioCue } from '../hooks/useGameAudio'

const distant = new URL('../../art/runtime/sequences/su-wan-distant.webp', import.meta.url).href
const approach = new URL('../../art/runtime/sequences/su-wan-approach.webp', import.meta.url).href
const glass = new URL('../../art/runtime/sequences/su-wan-glass.webp', import.meta.url).href
const blackout = new URL('../../art/runtime/sequences/su-wan-blackout.webp', import.meta.url).href
const jumpscare = new URL('../../art/runtime/sequences/su-wan-jumpscare.webp', import.meta.url).href
const aftermath = new URL('../../art/runtime/sequences/su-wan-aftermath.webp', import.meta.url).href

const STEPS = [
  {
    src: distant,
    title: '她正从走廊尽头靠近。',
    instruction: '把焦点锁在苏晚身上。',
    label: '锁定走廊尽头的苏晚',
    hotspot: { left: '45%', top: '34%', width: '11%', height: '31%' },
  },
  {
    src: approach,
    title: '黑卡吞掉了自动曝光。',
    instruction: '不要跟着她的眼睛走，先锁住卡片。',
    label: '对焦苏晚手中的黑卡',
    hotspot: { left: '28%', top: '31%', width: '13%', height: '28%' },
  },
  {
    src: glass,
    title: '她看着你，倒影却看向别处。',
    instruction: '找出比现实慢了一步的反射。',
    label: '指出玻璃右侧的延迟倒影',
    hotspot: { left: '73%', top: '5%', width: '26%', height: '72%' },
  },
  {
    src: blackout,
    title: '所有机位同时熄灭。',
    instruction: '黑暗里还有一个东西没有服从停电。',
    label: '追踪仍亮着的红色门禁灯',
    hotspot: { left: '85%', top: '46%', width: '14%', height: '31%' },
  },
] as const

interface CinematicFocusSequenceProps {
  reducedMotion: boolean
  onCue: (cue: AudioCue) => void
  onComplete: (focus: FocusOutcome, memory: PrologueMemory) => void
}

export function CinematicFocusSequence({ reducedMotion, onCue, onComplete }: CinematicFocusSequenceProps) {
  const [step, setStep] = useState(0)
  const [misses, setMisses] = useState(0)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const preloaders = [distant, approach, glass, blackout, jumpscare, aftermath].map((src) => {
      const image = new Image()
      image.src = src
      return image
    })
    return () => preloaders.forEach((image) => { image.src = '' })
  }, [])

  useEffect(() => {
    if (step !== 4) return
    onCue('scare')
    const timer = window.setTimeout(() => setStep(5), reducedMotion ? 120 : 680)
    return () => window.clearTimeout(timer)
  }, [onCue, reducedMotion, step])

  const advance = () => {
    setFeedback('')
    onCue(step === 3 ? 'transition' : 'select')
    setStep((current) => current + 1)
  }

  const miss = () => {
    if (step >= 4) return
    setMisses((count) => count + 1)
    setFeedback(misses >= 1 ? `焦点仍在画面里：${STEPS[step].instruction}` : '焦点滑开了。重新观察光线和动作。')
    onCue('miss')
  }

  const focus = misses <= 1 ? 'steady' : 'flinched'
  const image = step < 4 ? STEPS[step].src : step === 4 ? jumpscare : aftermath

  return (
    <section className={`cinematic-focus${step === 4 ? ' is-scare' : ''}${feedback ? ' is-missed' : ''}`} aria-label="服务门连续镜头">
      <div className="cinematic-stage">
        <img src={image} alt="" width="1280" height="720" />
        {step < 4 && (
          <button
            type="button"
            className="cinematic-miss-target"
            aria-label="画面其余区域；此处不是当前焦点"
            onClick={miss}
          />
        )}
        {step < 4 && (
          <button
            type="button"
            className={`cinematic-hotspot${misses >= 2 ? ' is-assisted' : ''}`}
            style={STEPS[step].hotspot}
            aria-label={STEPS[step].label}
            onClick={(event) => { event.stopPropagation(); advance() }}
          />
        )}
      </div>

      {step < 4 && (
        <div className="cinematic-instruction" aria-live="polite">
          <span><Aperture size={14} />手动跟焦 · {step + 1}/4</span>
          <strong>{STEPS[step].title}</strong>
          <p>{STEPS[step].instruction}</p>
          {feedback && <small>{feedback}</small>}
        </div>
      )}

      {step === 5 && (
        <div className="cinematic-aftermath">
          <span><ScanEye size={15} />现场记忆写入失败</span>
          <strong>{focus === 'steady' ? '你没有移开镜头。' : '你在最后一帧移开了镜头。'}</strong>
          <p>门重新关上。黑卡出现在你这一侧，旁边却多出一枚属于七岁孩子的湿脚印。</p>
          <div>
            <button type="button" onClick={() => onComplete(focus, 'card')}>捡起落在门内的黑卡</button>
            <button type="button" onClick={() => onComplete(focus, 'signal')}>拍下仍在闪烁的红灯</button>
          </div>
        </div>
      )}
    </section>
  )
}
