import { Fingerprint, MapPin, Radio, UserRound, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import type {
  FocusOutcome,
  PlayerMemory,
  PrologueApproach,
  PrologueIdentity,
  PrologueMemory,
} from '../game/types'
import type { AudioCue, AudioMood, AudioStatus } from '../hooks/useGameAudio'
import { CinematicFocusSequence } from './CinematicFocusSequence'

const ballroom = new URL('../../art/runtime/cam-01_before.webp', import.meta.url).href
const hotelExterior = new URL('../../art/runtime/cam-03_static.webp', import.meta.url).href
const aftermath = new URL('../../art/runtime/sequences/su-wan-aftermath.webp', import.meta.url).href

interface StoryPrologueProps {
  soundEnabled: boolean
  audioStatus: AudioStatus
  reducedMotion: boolean
  onToggleSound: () => void
  onBeginAudio: () => void
  onCue: (cue: AudioCue) => void
  onSetMood: (mood: AudioMood) => void
  onComplete: (memory: PlayerMemory) => void
}

export function StoryPrologue({
  soundEnabled,
  audioStatus,
  reducedMotion,
  onToggleSound,
  onBeginAudio,
  onCue,
  onSetMood,
  onComplete,
}: StoryPrologueProps) {
  const [beat, setBeat] = useState(0)
  const [identity, setIdentity] = useState<PrologueIdentity>('remember')
  const [approach, setApproach] = useState<PrologueApproach>('observe')
  const [memory, setMemory] = useState<PrologueMemory>('card')
  const [focus, setFocus] = useState<FocusOutcome>('steady')

  const advanceFromTitle = () => {
    onBeginAudio()
    onSetMood('prologue')
    onCue('transition')
    setBeat(1)
  }

  const chooseIdentity = (next: PrologueIdentity) => {
    setIdentity(next)
    onCue('select')
    setBeat(2)
  }

  const chooseApproach = (next: PrologueApproach) => {
    setApproach(next)
    onCue('transition')
    onSetMood('anomaly')
    setBeat(3)
  }

  const completeFocus = (nextFocus: FocusOutcome, nextMemory: PrologueMemory) => {
    setFocus(nextFocus)
    setMemory(nextMemory)
    onSetMood('revelation')
    onCue('transition')
    setBeat(4)
  }

  const handleSoundControl = () => {
    if (!soundEnabled) {
      onToggleSound()
      onBeginAudio()
      return
    }
    if (audioStatus !== 'playing') {
      onBeginAudio()
      return
    }
    onToggleSound()
  }

  const soundLabel = !soundEnabled
    ? '纯音乐关闭'
    : audioStatus === 'playing'
      ? '纯音乐播放中'
      : audioStatus === 'starting'
        ? '正在启动配乐'
        : audioStatus === 'suspended' || audioStatus === 'error'
          ? '配乐未启动 · 点此重试'
          : '点击开始播放配乐'

  return (
    <div
      className={`story-prologue beat-${beat}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={beat === 0 ? 'story-title' : undefined}
      aria-label={beat === 0 ? undefined : '第九机位序幕'}
    >
      {beat !== 3 && (
        <div className="story-frame" key={beat}>
          <img
            src={beat === 1 ? hotelExterior : beat === 4 ? aftermath : ballroom}
            alt=""
            aria-hidden="true"
            width={beat === 4 ? 1280 : beat === 1 ? 1918 : 1915}
            height={beat === 4 ? 720 : beat === 1 ? 820 : 821}
          />
          <div className="story-vignette" aria-hidden="true" />
          <div className="story-grain" aria-hidden="true" />
        </div>
      )}

      {beat === 3 && (
        <CinematicFocusSequence reducedMotion={reducedMotion} onCue={onCue} onComplete={completeFocus} />
      )}

      <button
        className="story-sound"
        type="button"
        onClick={handleSoundControl}
        aria-label={soundLabel}
        aria-pressed={soundEnabled}
        data-audio-mode="instrumental"
        data-audio-status={audioStatus}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>{soundLabel}</span>
      </button>

      {beat === 0 && (
        <section className="story-title-card">
          <span>白礁酒店婚礼影像 · 未公开母带</span>
          <div><Radio size={17} aria-hidden="true" /><b>互动悬疑影游</b></div>
          <h1 id="story-title">第九机位</h1>
          <p>今晚你受雇记录一场婚礼。<br />十二年前，你也曾被这里记录。</p>
          <button type="button" onClick={advanceFromTitle}>
            确认身份 <i aria-hidden="true">→</i>
          </button>
          <small>建议开启配乐 · 含一次短暂惊吓画面<br />选择、观察与失误都会改变结局</small>
        </section>
      )}

      {beat === 1 && (
        <section className="identity-record">
          <header>
            <span>现场身份校验 / 23:38:07</span>
            <strong>路野，29 岁。婚礼纪录片摄影师。</strong>
          </header>
          <div className="identity-facts">
            <p><UserRound size={15} /><span><b>你是谁</b>今晚婚礼的主摄影，也是十二年前零层事故中唯一留下影像的孩子。</span></p>
            <p><MapPin size={15} /><span><b>你在哪</b>临海断崖上的白礁酒店。公开建筑没有零层，但电梯每晚会经过一次不存在的停靠。</span></p>
            <p><Fingerprint size={15} /><span><b>你和苏晚</b>档案说今天是初见；一卷烧坏的家庭录像里，却是她牵着七岁的你走出酒店。</span></p>
          </div>
          <blockquote>这里的镜头不会穿越时间。它们只会把“仍有人记得的十秒”覆盖到现在。</blockquote>
          <div className="story-choices" aria-label="选择路野相信的身份">
            <button type="button" onClick={() => chooseIdentity('remember')}>
              <em>相信身体留下的记忆</em><span>苏晚认识我，只是我忘了她。</span>
            </button>
            <button type="button" onClick={() => chooseIdentity('record')}>
              <em>相信没有被烧毁的档案</em><span>先把她当作今晚的拍摄对象。</span>
            </button>
          </div>
        </section>
      )}

      {beat === 2 && (
        <section className="story-subtitle-card">
          <header><span>23:43:12</span><b>宴会厅 · 婚礼直播中</b></header>
          <p className="story-radio"><i>耳机 / 导演</i>“路野，别乱动镜头。新娘马上宣誓。”</p>
          <p>苏晚没有走向台前。她穿过整间宴会厅，停在你的镜头正中央。</p>
          <strong>她在看你。不是在看摄像机。</strong>
          <div className="story-choices" aria-label="选择路野的行动">
            <button type="button" onClick={() => chooseApproach('observe')}>
              <em>保持职业距离</em><span>拉近焦距，继续拍她</span>
            </button>
            <button type="button" onClick={() => chooseApproach('intervene')}>
              <em>相信她在求救</em><span>压下摄影机，追去服务门</span>
            </button>
          </div>
        </section>
      )}

      {beat === 4 && (
        <section className="story-subtitle-card is-blackout">
          <header><span>23:47:00</span><b>全酒店断电</b></header>
          <p className="story-radio"><i>耳机 / 导演</i>“所有机位同时丢帧——路野，你还看得到她吗？”</p>
          <strong>{focus === 'steady' ? '你看清了她消失的整整一帧。' : '你移开过镜头，母带里因此缺了一帧。'}</strong>
          <p>
            十秒后灯重新亮起，苏晚从八台摄影机里同时消失。凌晨，一个没有发件人的地址进入你的相机：<br />
            <b>“如果你还记得我，就证明这十秒不属于同一条时间。”</b>
          </p>
          <button
            className="story-enter-review"
            type="button"
            onClick={() => {
              onCue('transition')
              onComplete({ identity, approach, memory, focus })
            }}
          >
            进入封存回放 <i aria-hidden="true">→</i>
          </button>
        </section>
      )}

      <div
        className="story-progress"
        role="progressbar"
        aria-label="序幕进度"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={beat + 1}
      >
        {[0, 1, 2, 3, 4].map((item) => <i className={item <= beat ? 'is-active' : ''} key={item} />)}
      </div>
    </div>
  )
}
