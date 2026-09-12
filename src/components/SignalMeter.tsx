interface SignalMeterProps {
  strength: number
}

export function SignalMeter({ strength }: SignalMeterProps) {
  const level = strength > 0.72 ? '时间错位' : strength > 0.34 ? '轻微漂移' : '信号稳定'
  return (
    <div className={`signal-meter level-${level === '时间错位' ? 'high' : level === '轻微漂移' ? 'medium' : 'low'}`} aria-label={`异常强度：${level}`}>
      <span>{level}</span>
      <div aria-hidden="true"><i style={{ width: `${Math.round(strength * 100)}%` }} /></div>
    </div>
  )
}
