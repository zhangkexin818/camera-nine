import { useCallback, useEffect, useRef, useState } from 'react'

export type AudioMood = 'prologue' | 'investigation' | 'anomaly' | 'revelation'
export type AudioCue = 'select' | 'transition' | 'success' | 'miss' | 'unlock' | 'scare'
export type AudioStatus = 'idle' | 'starting' | 'playing' | 'suspended' | 'muted' | 'error'

interface AudioEngine {
  context: AudioContext
  master: GainNode
  pad: GainNode
  filter: BiquadFilterNode
  padOne: OscillatorNode
  padTwo: OscillatorNode
  timer: number
  noteIndex: number
}

const SCORE: Record<AudioMood, {
  root: number
  drone: number
  notes: readonly number[]
  filter: number
  padVolume: number
  pulseVolume: number
  interval: number
}> = {
  prologue: {
    root: 110,
    drone: 164.81,
    notes: [220, 261.63, 293.66, 196],
    filter: 980,
    padVolume: 0.07,
    pulseVolume: 0.105,
    interval: 3100,
  },
  investigation: {
    root: 98,
    drone: 146.83,
    notes: [196, 233.08, 293.66, 261.63, 220],
    filter: 820,
    padVolume: 0.058,
    pulseVolume: 0.085,
    interval: 3600,
  },
  anomaly: {
    root: 92.5,
    drone: 138.59,
    notes: [185, 277.18, 207.65, 311.13],
    filter: 1380,
    padVolume: 0.08,
    pulseVolume: 0.12,
    interval: 2100,
  },
  revelation: {
    root: 110,
    drone: 164.81,
    notes: [220, 329.63, 293.66, 246.94, 392],
    filter: 1240,
    padVolume: 0.074,
    pulseVolume: 0.11,
    interval: 2800,
  },
}

function scheduleNote(engine: AudioEngine, mood: AudioMood) {
  if (engine.context.state !== 'running') return
  const score = SCORE[mood]
  const now = engine.context.currentTime
  const frequency = score.notes[engine.noteIndex % score.notes.length]
  engine.noteIndex += 1

  const oscillator = engine.context.createOscillator()
  const gain = engine.context.createGain()
  const filter = engine.context.createBiquadFilter()
  oscillator.type = mood === 'anomaly' ? 'triangle' : 'sine'
  oscillator.frequency.setValueAtTime(frequency, now)
  if (mood === 'revelation') {
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 2.4)
  }
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(mood === 'anomaly' ? 760 : 480, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(score.pulseVolume, now + 0.55)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5)
  oscillator.connect(filter).connect(gain).connect(engine.master)
  oscillator.start(now)
  oscillator.stop(now + 3.7)
}

function restartPulse(engine: AudioEngine, mood: AudioMood) {
  window.clearInterval(engine.timer)
  engine.noteIndex = 0
  engine.timer = window.setInterval(() => scheduleNote(engine, mood), SCORE[mood].interval)
  scheduleNote(engine, mood)
}

export function useGameAudio() {
  const [enabled, setEnabled] = useState(true)
  const [status, setStatus] = useState<AudioStatus>('idle')
  const enabledRef = useRef(true)
  const engineRef = useRef<AudioEngine | null>(null)
  const moodRef = useRef<AudioMood>('prologue')

  const ensureEngine = useCallback(() => {
    if (engineRef.current) {
      void engineRef.current.context.resume()
      return engineRef.current
    }

    const context = new AudioContext()
    const master = context.createGain()
    const compressor = context.createDynamicsCompressor()
    const pad = context.createGain()
    const filter = context.createBiquadFilter()
    const padOne = context.createOscillator()
    const padTwo = context.createOscillator()
    const score = SCORE[moodRef.current]

    master.gain.setValueAtTime(enabledRef.current ? 0.9 : 0.0001, context.currentTime)
    compressor.threshold.value = -18
    compressor.ratio.value = 6
    master.connect(compressor).connect(context.destination)

    padOne.type = 'triangle'
    padTwo.type = 'sine'
    padOne.frequency.value = score.root
    padTwo.frequency.value = score.drone
    padTwo.detune.value = -7
    pad.gain.value = score.padVolume
    padOne.connect(pad)
    padTwo.connect(pad)
    pad.connect(filter).connect(master)
    padOne.start()
    padTwo.start()

    filter.type = 'lowpass'
    filter.frequency.value = score.filter
    filter.Q.value = 0.8

    const engine: AudioEngine = {
      context,
      master,
      pad,
      filter,
      padOne,
      padTwo,
      timer: 0,
      noteIndex: 0,
    }
    context.onstatechange = () => {
      if (!enabledRef.current) return
      setStatus(context.state === 'running' ? 'playing' : 'suspended')
    }
    engineRef.current = engine
    restartPulse(engine, moodRef.current)
    return engine
  }, [])

  const begin = useCallback(() => {
    if (!enabledRef.current) return
    const engine = ensureEngine()
    setStatus('starting')
    void engine.context.resume().then(() => {
      engine.master.gain.setTargetAtTime(0.9, engine.context.currentTime, 0.08)
      scheduleNote(engine, moodRef.current)
      setStatus(engine.context.state === 'running' ? 'playing' : 'suspended')
    }).catch(() => setStatus('error'))
  }, [ensureEngine])

  const toggle = useCallback(() => {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    setStatus(next ? 'starting' : 'muted')
    const engine = next ? ensureEngine() : engineRef.current
    if (engine) {
      if (next) {
        void engine.context.resume().then(() => {
          engine.master.gain.setTargetAtTime(0.9, engine.context.currentTime, 0.06)
          scheduleNote(engine, moodRef.current)
          setStatus(engine.context.state === 'running' ? 'playing' : 'suspended')
        }).catch(() => setStatus('error'))
      } else {
        engine.master.gain.setTargetAtTime(0.0001, engine.context.currentTime, 0.06)
      }
    }
    return next
  }, [ensureEngine])

  const setMood = useCallback((mood: AudioMood) => {
    if (moodRef.current === mood) return
    moodRef.current = mood
    const engine = engineRef.current
    if (!engine) return
    const now = engine.context.currentTime
    const score = SCORE[mood]
    engine.filter.frequency.setTargetAtTime(score.filter, now, 0.7)
    engine.pad.gain.setTargetAtTime(score.padVolume, now, 0.65)
    engine.padOne.frequency.setTargetAtTime(score.root, now, 0.75)
    engine.padTwo.frequency.setTargetAtTime(score.drone, now, 0.75)
    restartPulse(engine, mood)
  }, [])

  const playCue = useCallback((cue: AudioCue) => {
    if (!enabledRef.current) return
    const engine = ensureEngine()
    const now = engine.context.currentTime
    const settings: Record<AudioCue, readonly [number, number, number]> = {
      select: [330, 0.04, 0.12],
      transition: [110, 0.065, 0.55],
      success: [440, 0.065, 0.7],
      miss: [92.5, 0.055, 0.38],
      unlock: [220, 0.075, 1.2],
      scare: [73.42, 0.14, 0.72],
    }
    const [frequency, volume, duration] = settings[cue]
    const oscillator = engine.context.createOscillator()
    const gain = engine.context.createGain()
    oscillator.type = cue === 'scare' ? 'sawtooth' : cue === 'miss' ? 'triangle' : 'sine'
    oscillator.frequency.setValueAtTime(frequency, now)
    if (cue === 'success' || cue === 'unlock') {
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration)
    } else if (cue === 'scare') {
      oscillator.frequency.exponentialRampToValueAtTime(49, now + duration)
    }
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    oscillator.connect(gain).connect(engine.master)
    oscillator.start(now)
    oscillator.stop(now + duration + 0.05)
  }, [ensureEngine])

  useEffect(() => () => {
    const engine = engineRef.current
    if (!engine) return
    window.clearInterval(engine.timer)
    void engine.context.close()
    engineRef.current = null
  }, [])

  return {
    enabled,
    status,
    begin,
    toggle,
    setMood,
    playCue,
  }
}
