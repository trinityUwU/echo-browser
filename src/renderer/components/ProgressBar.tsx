import { useEffect, useRef, useState } from 'react'

interface Props { loading: boolean }

export default function ProgressBar({ loading }: Props): JSX.Element | null {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timer.current)
    if (loading) {
      setVisible(true)
      setProgress(0)
      const start = Date.now()
      const tick = (): void => {
        const p = 85 * (1 - Math.exp(-(Date.now() - start) / 1000))
        setProgress(p)
        if (p < 84) timer.current = setTimeout(tick, 40)
      }
      timer.current = setTimeout(tick, 40)
    } else {
      setProgress(100)
      timer.current = setTimeout(() => { setVisible(false); setProgress(0) }, 350)
    }
    return () => clearTimeout(timer.current)
  }, [loading])

  if (!visible) return null

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, overflow: 'hidden', zIndex: 10 }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #6366f1, #818cf8)',
        borderRadius: '0 2px 2px 0',
        transition: progress === 100 ? 'width 0.15s ease-out, opacity 0.3s 0.1s ease' : 'width 0.08s linear',
        opacity: progress >= 100 ? 0 : 1,
      }} />
    </div>
  )
}
