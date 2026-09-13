import { Aperture, Radio, ScanEye, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import type {
  FocusOutcome,
  PlayerMemory,
  PrologueApproach,
  PrologueIdentity,
  PrologueMemory,
} from '../game/types'
import type { AudioCue, AudioMood, AudioStatus } from '../hooks/useGameAudio'
import { CharacterDialogue, type DialogueLine } from './CharacterDialogue'
import { CinematicFocusSequence } from './CinematicFocusSequence'
import { IdentityEvidenceSequence } from './IdentityEvidenceSequence'

const ballroom = new URL('../../art/runtime/cam-01_before.webp', import.meta.url).href
const hotelExterior = new URL('../../art/runtime/cam-03_static.webp', import.meta.url).href
const aftermath = new URL('../../art/runtime/sequences/su-wan-aftermath.webp', import.meta.url).href

const ARRIVAL_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: '周辰',
    channel: '耳机 / 现场导演',
    text: '路野，八号机保持中景。新娘还有四十秒入场。',
    portrait: 'zhou-chen-calm',
    emotion: 'calm',
  },
  {
    speaker: '苏晚',
    channel: '现场收音 / 未登记',
    text: '你还记得……那扇没有楼层号码的门吗？',
    portrait: 'su-wan-warning',
    emotion: 'warning',
  },
  {
    speaker: '周辰',
    channel: '耳机 / 信号串入',
    text: '等等。她没有对着主机位——她在看你。',
    portrait: 'zhou-chen-confused',
    emotion: 'warning',
  },
]

const BLACKOUT_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: '周辰',
    channel: '耳机 / 全线丢帧',
    text: '八路信号同时黑了。路野，你还能看见她吗？',
    portrait: 'zhou-chen-urgent',
    emotion: 'afraid',
  },
  {
    speaker: '周辰',
    channel: '耳机 / 未知回声',
    text: '不对……监视器里站着的，为什么是七岁的你？',
    portrait: 'zhou-chen-afraid',
    emotion: 'afraid',
  },
  {
    speaker: '苏晚',
    channel: '第九路 / 十二年前',
    text: '如果你还记得我，就别把这十秒剪进同一条时间。',
    portrait: 'su-wan-remember',
    emotion: 'remember',
  },
]

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
  const [arrivalDialogueComplete, setArrivalDialogueComplete] = useState(false)

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
        <IdentityEvidenceSequence onCue={onCue} onChoose={chooseIdentity} />
      )}

      {beat === 2 && (
        <section className="story-dialogue-scene">
          <CharacterDialogue
            lines={ARRIVAL_DIALOGUE}
            finalLabel="选择动作"
            onCue={onCue}
            onComplete={() => setArrivalDialogueComplete(true)}
          />
          {arrivalDialogueComplete && (
            <div className="visual-action-choice" aria-label="选择路野的动作">
              <button type="button" onClick={() => chooseApproach('observe')}>
                <Aperture size={19} aria-hidden="true" /><b>保持拍摄</b><span>锁定她的眼睛</span>
              </button>
              <button type="button" onClick={() => chooseApproach('intervene')}>
                <ScanEye size={19} aria-hidden="true" /><b>放下机器</b><span>追向服务门</span>
              </button>
            </div>
          )}
        </section>
      )}

      {beat === 4 && (
        <section className="story-dialogue-scene is-blackout">
          <CharacterDialogue
            lines={BLACKOUT_DIALOGUE}
            finalLabel="接入封存母带"
            onCue={onCue}
            onComplete={() => onComplete({ identity, approach, memory, focus })}
          />
          <span className={`focus-memory-mark is-${focus}`} aria-label={focus === 'steady' ? '完整记录消失帧' : '消失帧缺失'}>
            {focus === 'steady' ? '24 / 24' : '23 / 24'}
          </span>
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
