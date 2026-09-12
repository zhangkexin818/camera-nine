import { Application, Assets, Container, Sprite, Texture, type Ticker } from 'pixi.js'
import { memo, useEffect, useRef, useState } from 'react'

interface CameraViewportProps {
  source: string
  preloadSources: string[]
  reducedMotion: boolean
  fallbackLabel: string
}

function fitSprite(sprite: Sprite, width: number, height: number) {
  const textureWidth = Math.max(1, sprite.texture.width)
  const textureHeight = Math.max(1, sprite.texture.height)
  const scale = Math.max(width / textureWidth, height / textureHeight)
  sprite.scale.set(scale)
  sprite.position.set(width / 2, height / 2)
}

export const CameraViewport = memo(function CameraViewport({
  source,
  preloadSources,
  reducedMotion,
  fallbackLabel,
}: CameraViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const layerRef = useRef<Container | null>(null)
  const spriteRef = useRef<Sprite | null>(null)
  const transitionRef = useRef<((ticker: Ticker) => void) | null>(null)
  const [ready, setReady] = useState(false)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let initialized = false
    const app = new Application()
    const layer = new Container()
    const resize = () => {
      if (disposed || !initialized || !host.clientWidth || !host.clientHeight) return
      app.renderer.resize(host.clientWidth, host.clientHeight)
      layer.children.forEach((child) => {
        if (child instanceof Sprite) fitSprite(child, app.screen.width, app.screen.height)
      })
    }

    void app
      .init({
        background: '#020607',
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        width: Math.max(1, host.clientWidth),
        height: Math.max(1, host.clientHeight),
      })
      .then(() => {
        initialized = true
        if (disposed) {
          app.destroy(true, { children: true })
          return
        }
        app.stage.addChild(layer)
        appRef.current = app
        layerRef.current = layer
        host.appendChild(app.canvas)
        resize()
        setReady(true)
      })
      .catch(() => {
        if (!disposed) setLoadState('error')
      })

    const observer = new ResizeObserver(resize)
    observer.observe(host)

    return () => {
      disposed = true
      observer.disconnect()
      if (transitionRef.current) app.ticker.remove(transitionRef.current)
      if (appRef.current === app) {
        appRef.current = null
        layerRef.current = null
        spriteRef.current = null
        app.destroy(true, { children: true })
      }
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const app = appRef.current
    const layer = layerRef.current
    if (!app || !layer) return
    let cancelled = false
    setLoadState('loading')

    void Assets.load<Texture>(source)
      .then((texture) => {
        if (cancelled || !appRef.current || !layerRef.current) return
        const next = new Sprite(texture)
        next.anchor.set(0.5)
        fitSprite(next, app.screen.width, app.screen.height)
        const previous = spriteRef.current

        if (transitionRef.current) {
          app.ticker.remove(transitionRef.current)
          transitionRef.current = null
          layer.children.forEach((child) => {
            if (child !== previous) child.destroy()
          })
          if (previous) previous.alpha = 1
        }

        layer.addChild(next)

        if (!previous || reducedMotion) {
          next.alpha = 1
          if (previous) previous.destroy()
        } else {
          next.alpha = 0
          let elapsed = 0
          const transition = (ticker: Ticker) => {
            elapsed += ticker.deltaMS
            const progress = Math.min(1, elapsed / 160)
            next.alpha = progress
            previous.alpha = 1 - progress
            if (progress >= 1) {
              app.ticker.remove(transition)
              if (transitionRef.current === transition) transitionRef.current = null
              previous.destroy()
            }
          }
          transitionRef.current = transition
          app.ticker.add(transition)
        }

        spriteRef.current = next
        setLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadState('error')
      })

    return () => {
      cancelled = true
    }
  }, [source, ready, reducedMotion])

  useEffect(() => {
    if (!ready) return
    const idle = window.setTimeout(() => {
      void Promise.allSettled(preloadSources.map((item) => Assets.load(item)))
    }, 300)
    return () => window.clearTimeout(idle)
  }, [preloadSources, ready])

  return (
    <div className="pixi-host" ref={hostRef} data-load-state={loadState}>
      {loadState === 'loading' && <span className="feed-loading">同步信号…</span>}
      {loadState === 'error' && (
        <>
          <img className="feed-fallback" src={source} alt={fallbackLabel} />
          <span className="feed-error">实时渲染不可用 · 已切换静态信号</span>
        </>
      )}
    </div>
  )
})
