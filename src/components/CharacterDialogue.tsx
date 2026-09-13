import { ChevronRight, Radio, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { AudioCue } from '../hooks/useGameAudio'

const PORTRAITS = {
  'su-wan-calm': new URL('../../art/runtime/portraits/su-wan-calm.webp', import.meta.url).href,
  'su-wan-warning': new URL('../../art/runtime/portraits/su-wan-warning.webp', import.meta.url).href,
  'su-wan-afraid': new URL('../../art/runtime/portraits/su-wan-afraid.webp', import.meta.url).href,
  'su-wan-remember': new URL('../../art/runtime/portraits/su-wan-remember.webp', import.meta.url).href,
  'zhou-chen-calm': new URL('../../art/runtime/portraits/zhou-chen-calm.webp', import.meta.url).href,
  'zhou-chen-confused': new URL('../../art/runtime/portraits/zhou-chen-confused.webp', import.meta.url).href,
  'zhou-chen-urgent': new URL('../../art/runtime/portraits/zhou-chen-urgent.webp', import.meta.url).href,
  'zhou-chen-afraid': new URL('../../art/runtime/portraits/zhou-chen-afraid.webp', import.meta.url).href,
} as const

export type DialoguePortrait = keyof typeof PORTRAITS
export type DialogueEmotion = 'calm' | 'warning' | 'afraid' | 'remember'

export interface DialogueLine {
  speaker: string
  channel: string
  text: string
  portrait: DialoguePortrait
  emotion: DialogueEmotion
}

interface CharacterDialogueProps {
  lines: readonly DialogueLine[]
  finalLabel: string
  onCue: (cue: AudioCue) => void
  onComplete: () => void
}

export function CharacterDialogue({ lines, finalLabel, onCue, onComplete }: CharacterDialogueProps) {
  const [lineIndex, setLineIndex] = useState(0)
  const line = lines[lineIndex]
  const isLast = lineIndex === lines.length - 1

  const advance = useCallback(() => {
    onCue(isLast ? 'transition' : 'select')
    if (isLast) onComplete()
    else setLineIndex((current) => current + 1)
  }, [isLast, onComplete, onCue])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Enter' || event.repeat) return
      event.preventDefault()
      advance()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [advance])

  return (
    <section className={`character-dialogue is-${line.emotion}`} aria-live="polite">
      <figure key={line.portrait}>
        <img src={PORTRAITS[line.portrait]} alt={`${line.speaker}，${line.emotion}情绪`} width="450" height="600" />
      </figure>
      <div className="speech-ui">
        <header>
          <div><strong>{line.speaker}</strong><span>{line.channel}</span></div>
          <i className="speech-wave" aria-hidden="true"><b /><b /><b /><b /><b /></i>
          {line.channel.includes('耳机') ? <Radio size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
        </header>
        <p key={`${lineIndex}-${line.text}`}>{line.text}</p>
        <button type="button" onClick={advance} aria-label={`${line.speaker}，${isLast ? finalLabel : '下一句'}`}>
          <span>{isLast ? finalLabel : '下一句'}</span><ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
      <small>{String(lineIndex + 1).padStart(2, '0')} / {String(lines.length).padStart(2, '0')}</small>
    </section>
  )
}
