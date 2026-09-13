import { useMachine } from '@xstate/react'
import {
  CircleHelp,
  Lightbulb,
  Pause,
  Play,
  ScanSearch,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CameraRail } from './components/CameraRail'
import { ArchiveHint } from './components/ArchiveHint'
import { CaseBoard, type LinkFeedback } from './components/CaseBoard'
import { DiscoveryNotice } from './components/DiscoveryNotice'
import { EvidenceDrawer } from './components/EvidenceDrawer'
import { GameHelp } from './components/GameHelp'
import { HypothesisPanel } from './components/HypothesisPanel'
import { IncidentTimeline } from './components/IncidentTimeline'
import { InspectionLayer } from './components/InspectionLayer'
import { InvestigationBrief } from './components/InvestigationBrief'
import { RevelationPanel } from './components/RevelationPanel'
import { SignalMeter } from './components/SignalMeter'
import { StoryPrologue } from './components/StoryPrologue'
import { TemporalSplicePanel } from './components/TemporalSplicePanel'
import { getEvidenceLink, REQUIRED_EVIDENCE_LINKS } from './game/archive'
import { getInvestigationHint } from './game/guidance'
import {
  ALL_CAMERA_SOURCES,
  CAMERAS,
  CORE_EVIDENCE_IDS,
  EVIDENCE_BY_ID,
  getActiveEvidence,
  getCameraFrame,
  getSignalStrength,
} from './game/cameras'
import { countCoreEvidence, reviewMachine } from './game/machine'
import { formatClock, FRAME_RATE } from './game/time'
import type { CameraId, EndingId, EvidenceId, HypothesisId, PlayerMemory } from './game/types'
import { useGameAudio } from './hooks/useGameAudio'
import { useReducedMotion } from './hooks/useReducedMotion'

const CameraViewport = lazy(() => import('./components/CameraViewport').then((module) => ({
  default: module.CameraViewport,
})))

interface ScanFeedback {
  tone: 'quiet' | 'near' | 'known'
  text: string
}

function App() {
  const [snapshot, send] = useMachine(reviewMachine)
  const { time, playing, cameraId, evidence, links, drawerOpen, mistakes, hypothesisCorrect, ending } = snapshot.context
  const [helpOpen, setHelpOpen] = useState(false)
  const [revelationOpen, setRevelationOpen] = useState(true)
  const [recentEvidence, setRecentEvidence] = useState<EvidenceId | null>(null)
  const [playerMemory, setPlayerMemory] = useState<PlayerMemory | null>(null)
  const [memoryRevealed, setMemoryRevealed] = useState(false)
  const [scanMode, setScanMode] = useState(false)
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null)
  const [hypothesisOpen, setHypothesisOpen] = useState(false)
  const [hypothesisFeedback, setHypothesisFeedback] = useState<string | null>(null)
  const [caseBoardOpen, setCaseBoardOpen] = useState(false)
  const [spliceOpen, setSpliceOpen] = useState(false)
  const [spliceSolved, setSpliceSolved] = useState(false)
  const [linkFeedback, setLinkFeedback] = useState<LinkFeedback | null>(null)
  const [hintVisible, setHintVisible] = useState(false)
  const [hintAutomatic, setHintAutomatic] = useState(false)
  const isIntro = snapshot.matches('intro')
  const reducedMotion = useReducedMotion()
  const {
    enabled: soundEnabled,
    status: audioStatus,
    begin: beginAudio,
    toggle: toggleSound,
    setMood,
    playCue,
  } = useGameAudio()
  const lastFrameRef = useRef<number | null>(null)
  const previousEvidenceCountRef = useRef(0)
  const camera = CAMERAS[cameraId]
  const frame = getCameraFrame(cameraId, time)
  const activeEvidence = getActiveEvidence(cameraId, time)
  const coreFound = countCoreEvidence(evidence)
  const cameraNineUnlocked = coreFound >= CORE_EVIDENCE_IDS.length &&
    links.length >= REQUIRED_EVIDENCE_LINKS && hypothesisCorrect
  const signalStrength = getSignalStrength(cameraId, time, evidence)
  const modalVisible = isIntro || helpOpen || hypothesisOpen || caseBoardOpen || spliceOpen
  const interactionBlocked = modalVisible || recentEvidence !== null
  const investigationHint = useMemo(
    () => getInvestigationHint(evidence, links, hypothesisCorrect),
    [evidence, hypothesisCorrect, links],
  )

  const preloadSources = useMemo(
    () => ALL_CAMERA_SOURCES.filter((source) => source !== frame.src),
    [frame.src],
  )

  useEffect(() => {
    if (!playing) {
      lastFrameRef.current = null
      return
    }

    let animationFrame = 0
    const tick = (now: number) => {
      const previous = lastFrameRef.current ?? now
      const elapsed = now - previous
      if (elapsed >= 1000 / FRAME_RATE) {
        lastFrameRef.current = now
        send({ type: 'TICK', delta: Math.min(0.1, elapsed / 1000) })
      }
      animationFrame = window.requestAnimationFrame(tick)
    }
    animationFrame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [playing, send])

  useEffect(() => {
    if (cameraId === '09') setRevelationOpen(true)
  }, [cameraId])

  useEffect(() => {
    if (evidence.length > previousEvidenceCountRef.current) {
      setRecentEvidence(evidence[evidence.length - 1])
    } else if (evidence.length === 0) {
      setRecentEvidence(null)
    }
    previousEvidenceCountRef.current = evidence.length
  }, [evidence])

  useEffect(() => {
    if (!scanFeedback) return
    const timer = window.setTimeout(() => setScanFeedback(null), 3000)
    return () => window.clearTimeout(timer)
  }, [scanFeedback])

  useEffect(() => {
    if (isIntro) setMood('prologue')
    else if (cameraId === '09') setMood('revelation')
    else if (scanMode && signalStrength > 0.7) setMood('anomaly')
    else setMood('investigation')
  }, [cameraId, isIntro, scanMode, setMood, signalStrength])

  useEffect(() => {
    setHintVisible(false)
  }, [evidence.length, hypothesisCorrect, links.length])

  useEffect(() => {
    if (isIntro || modalVisible || recentEvidence || cameraId === '09' || hintVisible || !investigationHint) return
    const timer = window.setTimeout(() => {
      setHintAutomatic(true)
      setHintVisible(true)
    }, 10_000)
    return () => window.clearTimeout(timer)
  }, [cameraId, hintVisible, investigationHint, isIntro, modalVisible, recentEvidence])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || isIntro) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return

      if (recentEvidence) {
        if (event.code === 'Escape') setRecentEvidence(null)
        return
      }

      if (helpOpen || hypothesisOpen || caseBoardOpen || spliceOpen) {
        if (event.code === 'Escape') {
          setHelpOpen(false)
          setHypothesisOpen(false)
          setCaseBoardOpen(false)
          setSpliceOpen(false)
        }
        return
      }

      if (event.code === 'Space' && !scanMode) {
        event.preventDefault()
        send({ type: 'TOGGLE_PLAY' })
      } else if (event.code === 'ArrowLeft' && !scanMode) {
        event.preventDefault()
        send({ type: 'STEP', frames: -1 })
      } else if (event.code === 'ArrowRight' && !scanMode) {
        event.preventDefault()
        send({ type: 'STEP', frames: 1 })
      } else if (/^Digit[1-9]$/.test(event.code) && !scanMode) {
        send({ type: 'SELECT_CAMERA', cameraId: `0${event.code.slice(-1)}` as CameraId })
      } else if (event.code === 'KeyE' && cameraId !== '09') {
        event.preventDefault()
        send({ type: 'SEEK', time })
        setScanMode((active) => !active)
        setScanFeedback(null)
        playCue('select')
      } else if (event.code === 'KeyC') {
        send({ type: 'TOGGLE_DRAWER' })
      } else if (event.code === 'KeyB' && evidence.length >= 2) {
        send({ type: 'CLOSE_DRAWER' })
        setLinkFeedback(null)
        setCaseBoardOpen(true)
      } else if (event.code === 'KeyR') {
        send({ type: 'RESET' })
        setScanMode(false)
        setMemoryRevealed(false)
      } else if (event.code === 'Escape') {
        setScanMode(false)
        send({ type: 'CLOSE_DRAWER' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cameraId, caseBoardOpen, evidence.length, helpOpen, hypothesisOpen, isIntro, playCue, recentEvidence, scanMode, send, spliceOpen, time])

  const selectCamera = useCallback((nextCamera: CameraId) => {
    send({ type: 'SELECT_CAMERA', cameraId: nextCamera })
    setScanFeedback(null)
    playCue(nextCamera === '09' ? 'unlock' : 'select')
  }, [playCue, send])

  const seek = useCallback((nextTime: number) => {
    send({ type: 'SEEK', time: nextTime })
    setScanFeedback(null)
  }, [send])

  const completePrologue = useCallback((memory: PlayerMemory) => {
    setPlayerMemory(memory)
    send({ type: 'START' })
    send({ type: 'SELECT_CAMERA', cameraId: memory.memory === 'signal' ? '02' : '08' })
    send({ type: 'SEEK', time: 0 })
  }, [send])

  const inspectFrame = useCallback((x: number, y: number) => {
    if (!scanMode || cameraId === '09') return
    const candidate = getActiveEvidence(cameraId, time)
    const alreadyFound = candidate ? evidence.includes(candidate.id) : false
    const hit = candidate &&
      x >= candidate.hotspot.x && x <= candidate.hotspot.x + candidate.hotspot.width &&
      y >= candidate.hotspot.y && y <= candidate.hotspot.y + candidate.hotspot.height

    if (candidate && alreadyFound && hit) {
      setScanFeedback({ tone: 'known', text: '这处矛盾已经记录。它不会再提供新的信息。' })
      playCue('select')
      return
    }

    if (candidate && hit) {
      send({ type: 'DISCOVER', evidenceId: candidate.id })
      setScanMode(false)
      setScanFeedback(null)
      playCue('success')
      return
    }

    send({ type: 'MISS' })
    playCue('miss')
    setScanFeedback(signalStrength > 0.72
      ? { tone: 'near', text: '异常就在这一帧，但你指出的细节无法形成矛盾。' }
      : { tone: 'quiet', text: '没有捕捉到时间错位。换一个秒数，或与其他机位比较。' })
  }, [cameraId, evidence, playCue, scanMode, send, signalStrength, time])

  const submitHypothesis = useCallback((hypothesisId: HypothesisId) => {
    send({ type: 'SUBMIT_HYPOTHESIS', hypothesisId })
    if (hypothesisId === 'split-time') {
      setHypothesisFeedback(null)
      setHypothesisOpen(false)
      playCue('unlock')
      return
    }
    playCue('miss')
    setHypothesisFeedback(hypothesisId === 'escape'
      ? '结论不成立：逃离无法解释同一物件在同一秒出现于两个地点。'
      : '结论不成立：同步故障可以制造丢帧，却不能制造真实存在的干燥轮廓。')
  }, [playCue, send])

  const openCaseBoard = useCallback(() => {
    send({ type: 'CLOSE_DRAWER' })
    setLinkFeedback(null)
    setCaseBoardOpen(true)
  }, [send])

  const trackEvidenceFromArchive = useCallback((evidenceId: EvidenceId) => {
    const target = EVIDENCE_BY_ID[evidenceId]
    setCaseBoardOpen(false)
    setLinkFeedback(null)
    send({ type: 'SELECT_CAMERA', cameraId: target.cameraId })
    send({ type: 'SEEK', time: target.time })
    setScanMode(true)
    setScanFeedback({
      tone: 'near',
      text: `档案回声已锁定 CAM-${target.cameraId}：移动放大镜，检查画面中断的位置。`,
    })
    playCue('transition')
  }, [playCue, send])

  const continueFromCaseBoard = useCallback(() => {
    setCaseBoardOpen(false)
    setLinkFeedback(null)
    setHypothesisFeedback(null)
    if (spliceSolved) setHypothesisOpen(true)
    else setSpliceOpen(true)
    playCue('transition')
  }, [playCue, spliceSolved])

  const openDeduction = useCallback(() => {
    setHypothesisFeedback(null)
    if (spliceSolved) setHypothesisOpen(true)
    else setSpliceOpen(true)
    playCue('transition')
  }, [playCue, spliceSolved])

  const completeSplice = useCallback(() => {
    setSpliceSolved(true)
    setSpliceOpen(false)
    setHypothesisOpen(true)
    playCue('unlock')
  }, [playCue])

  const missSplice = useCallback(() => {
    send({ type: 'MISS' })
    playCue('miss')
  }, [playCue, send])

  const verifyEvidenceLink = useCallback((left: EvidenceId, right: EvidenceId) => {
    const link = getEvidenceLink(left, right)
    send({ type: 'VERIFY_LINK', left, right })
    if (!link) {
      setLinkFeedback({
        tone: 'miss',
        title: '联结不成立',
        body: '这两条记录可以发生在同一条时间里。换一条证据，寻找物件、路径或信号上的互斥关系。',
      })
      playCue('miss')
      return
    }
    if (links.includes(link.id)) {
      setLinkFeedback({ tone: 'known', title: '联结已记录', body: link.finding })
      playCue('select')
      return
    }
    setLinkFeedback({ tone: 'success', title: link.title, body: link.finding })
    playCue('unlock')
  }, [links, playCue, send])

  const chooseEnding = useCallback((endingId: EndingId) => {
    send({ type: 'CHOOSE_ENDING', endingId })
    playCue(endingId === 'erase' ? 'miss' : 'unlock')
  }, [playCue, send])

  const resetReview = useCallback(() => {
    send({ type: 'RESET' })
    setRevelationOpen(true)
    setScanMode(false)
    setScanFeedback(null)
    setMemoryRevealed(false)
    setHypothesisOpen(false)
    setHypothesisFeedback(null)
    setCaseBoardOpen(false)
    setLinkFeedback(null)
    setSpliceOpen(false)
    setSpliceSolved(false)
  }, [send])

  const openEvidence = useCallback(() => {
    setRevelationOpen(false)
    send({ type: 'OPEN_DRAWER' })
  }, [send])

  const showHint = useCallback(() => {
    setHintAutomatic(false)
    setHintVisible(true)
    playCue('select')
  }, [playCue])

  const handleSoundControl = useCallback(() => {
    if (soundEnabled && audioStatus !== 'playing') {
      beginAudio()
      return
    }
    toggleSound()
  }, [audioStatus, beginAudio, soundEnabled, toggleSound])

  const dismissHint = useCallback(() => {
    setHintVisible(false)
  }, [])

  const followHint = useCallback(() => {
    if (!investigationHint) return
    setHintVisible(false)
    if (investigationHint.cameraId && investigationHint.time !== undefined) {
      send({ type: 'SELECT_CAMERA', cameraId: investigationHint.cameraId })
      send({ type: 'SEEK', time: investigationHint.time })
      setScanMode(false)
      setScanFeedback(null)
      playCue('transition')
      return
    }
    if (investigationHint.action === 'case-board') openCaseBoard()
    if (investigationHint.action === 'deduction') openDeduction()
    if (investigationHint.action === 'camera-nine') selectCamera('09')
  }, [investigationHint, openCaseBoard, openDeduction, playCue, selectCamera, send])

  return (
    <main className="game-shell">
      <h1 className="sr-only">第九机位 · 交互影像调查</h1>
      <section
        className="playback-console"
        aria-label="第九机位监控回放台"
        aria-hidden={interactionBlocked || undefined}
        inert={interactionBlocked || undefined}
      >
        <header className="feed-header">
          <div className="camera-heading">
            <strong>CAM-{cameraId}</strong>
            <span>{camera.location}</span>
          </div>
          <time className={cameraId === '09' ? 'is-anomalous' : ''}>
            {cameraId === '09' ? '12年前 · 23:47:00:00' : formatClock(time)}
          </time>
          <div className="header-actions">
            {cameraId !== '09' && <SignalMeter strength={signalStrength} />}
            <button className="help-button" type="button" onClick={() => setHelpOpen(true)} aria-label="查看行动规则">
              <CircleHelp size={14} aria-hidden="true" /><span>规则</span>
            </button>
            {cameraId !== '09' && (
              <button className="help-button hint-button" type="button" onClick={showHint} aria-label="显示调查提示">
                <Lightbulb size={14} aria-hidden="true" /><span>提示</span>
              </button>
            )}
            <button
              className="sound-button"
              type="button"
              onClick={handleSoundControl}
              aria-label={!soundEnabled ? '开启纯音乐配乐' : audioStatus === 'playing' ? '关闭纯音乐配乐' : '重试播放纯音乐配乐'}
              aria-pressed={soundEnabled}
              data-audio-status={audioStatus}
              title={!soundEnabled ? '纯音乐配乐已关闭' : audioStatus === 'playing' ? '纯音乐正在播放' : '点击启动纯音乐'}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <div className="record-state" aria-label={playing ? '正在播放' : '已暂停'}>
              <i /><span>{playing ? 'REC' : 'HOLD'}</span>
            </div>
          </div>
        </header>

        {!modalVisible && cameraId !== '09' && (
          <div className="guidance-slot">
            <InvestigationBrief
              coreFound={coreFound}
              totalFound={evidence.length}
              linkCount={links.length}
              memory={playerMemory}
              memoryRevealed={memoryRevealed}
              hypothesisCorrect={hypothesisCorrect}
              onRevealMemory={() => setMemoryRevealed(true)}
              onOpenDeduction={openDeduction}
              onOpenCaseBoard={openCaseBoard}
              onEnterCameraNine={() => selectCamera('09')}
            />
          </div>
        )}

        <div className={`feed-stage${cameraId === '09' ? ' is-camera-nine' : ''}${scanMode ? ' is-inspecting' : ''}`}>
          <Suspense fallback={<span className="feed-loading">正在接通信号…</span>}>
            <CameraViewport
              source={frame.src}
              preloadSources={preloadSources}
              reducedMotion={reducedMotion}
              fallbackLabel={`CAM-${cameraId}：${camera.location}`}
            />
          </Suspense>
          <div className="screen-sheen" aria-hidden="true" />
          <div className="scan-pass" aria-hidden="true" />
          <InspectionLayer active={scanMode} source={frame.src} onInspect={inspectFrame} onExit={() => setScanMode(false)} />
          {scanFeedback && (
            <aside className={`scan-feedback is-${scanFeedback.tone}`} role="status">{scanFeedback.text}</aside>
          )}
          {!modalVisible && cameraId === '09' && (
            <div className="desktop-revelation">
              <RevelationPanel
                open={revelationOpen}
                mistakes={mistakes}
                linkCount={links.length}
                memory={playerMemory}
                ending={ending}
                onDismiss={() => setRevelationOpen((open) => !open)}
                onOpenEvidence={openEvidence}
                onChooseEnding={chooseEnding}
                onReset={resetReview}
                renderEndingPv
              />
            </div>
          )}
        </div>

        <div className="control-deck">
          <CameraRail
            activeCamera={cameraId}
            cameraNineUnlocked={cameraNineUnlocked}
            onSelect={selectCamera}
          />
          <IncidentTimeline time={time} foundEvidence={evidence} onSeek={seek} />
          <div className="transport-row">
            <div className="transport-controls" aria-label="播放控制">
              <button type="button" onClick={() => send({ type: 'STEP', frames: -1 })} aria-label="上一帧"><SkipBack size={17} fill="currentColor" /></button>
              <button className="play-toggle" type="button" onClick={() => send({ type: 'TOGGLE_PLAY' })} aria-label={playing ? '暂停' : '播放'}>
                {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button type="button" onClick={() => send({ type: 'STEP', frames: 1 })} aria-label="下一帧"><SkipForward size={17} fill="currentColor" /></button>
            </div>
            <button
              className={`mark-evidence-button${scanMode ? ' is-active' : ''}`}
              type="button"
              onClick={() => {
                send({ type: 'SEEK', time })
                setScanMode((active) => !active)
                setScanFeedback(null)
                playCue('select')
              }}
              disabled={cameraId === '09'}
              aria-pressed={scanMode}
            >
              <ScanSearch size={15} aria-hidden="true" />
              {scanMode ? '退出检视' : '开启画面检视'}
            </button>
            <EvidenceDrawer
              open={drawerOpen}
              evidence={evidence}
              coreFound={coreFound}
              linksFound={links.length}
              onToggle={() => send({ type: 'TOGGLE_DRAWER' })}
              onClose={() => send({ type: 'CLOSE_DRAWER' })}
              onOpenCaseBoard={openCaseBoard}
              onReset={resetReview}
            />
          </div>
          <p className="control-hint"><span>空格</span> 播放/暂停 · <span>← →</span> 逐帧 · <span>1–9</span> 切换 · <span>E</span> 检视 · <span>B</span> 联结 · 误判 {mistakes}</p>
        </div>
      </section>

      {hintVisible && investigationHint && !modalVisible && !recentEvidence && cameraId !== '09' && (
        <ArchiveHint
          hint={investigationHint}
          automatic={hintAutomatic}
          onFollow={followHint}
          onDismiss={dismissHint}
        />
      )}

      {!modalVisible && cameraId === '09' && (
        <div className={`mobile-revelation${revelationOpen ? ' is-open' : ''}`}>
          <RevelationPanel
            open={revelationOpen}
            mistakes={mistakes}
            linkCount={links.length}
            memory={playerMemory}
            ending={ending}
            onDismiss={() => setRevelationOpen((open) => !open)}
            onOpenEvidence={openEvidence}
            onChooseEnding={chooseEnding}
            onReset={resetReview}
          />
        </div>
      )}

      {recentEvidence && !modalVisible && (
        <DiscoveryNotice evidence={EVIDENCE_BY_ID[recentEvidence]} onDismiss={() => setRecentEvidence(null)} />
      )}
      {isIntro && (
        <StoryPrologue
          soundEnabled={soundEnabled}
          audioStatus={audioStatus}
          onToggleSound={toggleSound}
          onBeginAudio={beginAudio}
          onCue={playCue}
          onSetMood={setMood}
          onComplete={completePrologue}
          reducedMotion={reducedMotion}
        />
      )}
      {helpOpen && <GameHelp onClose={() => setHelpOpen(false)} />}
      {caseBoardOpen && (
        <CaseBoard
          evidence={evidence}
          links={links}
          feedback={linkFeedback}
          onVerify={verifyEvidenceLink}
          onTrackEvidence={trackEvidenceFromArchive}
          onContinue={continueFromCaseBoard}
          onClose={() => setCaseBoardOpen(false)}
        />
      )}
      {hypothesisOpen && (
        <HypothesisPanel
          links={links}
          feedback={hypothesisFeedback}
          onSubmit={submitHypothesis}
          onClose={() => setHypothesisOpen(false)}
        />
      )}
      {spliceOpen && (
        <TemporalSplicePanel
          onMiss={missSplice}
          onComplete={completeSplice}
          onClose={() => setSpliceOpen(false)}
        />
      )}
    </main>
  )
}

export default App
