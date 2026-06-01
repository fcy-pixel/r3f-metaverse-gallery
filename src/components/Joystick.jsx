import { useRef, useState, useEffect } from 'react'
import { useInput } from '../inputStore'

/**
 * 行動裝置虛擬搖桿。
 *  - mode="move"（左下）：寫入 move 向量控制移動
 *  - mode="look"（右下）：持續旋轉視角（推得越遠轉得越快）
 * 使用 Pointer Events + 指標捕捉，左右搖桿可同時雙指操作。
 * 只在觸控裝置顯示。
 */
export default function Joystick({ side = 'left', mode = 'move' }) {
  const baseRef = useRef()
  const pointerId = useRef(null)
  const offset = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const lastT = useRef(0)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const RADIUS = 55
  const LOOK_RATE = 2.6 // 視角旋轉速度（弧度/秒，於最大偏移時）

  // look 模式：每幀依搖桿偏移持續旋轉視角
  const lookLoop = (t) => {
    const dt = lastT.current ? Math.min((t - lastT.current) / 1000, 0.05) : 0
    lastT.current = t
    const { x, y } = offset.current
    useInput.getState().addLook((x / RADIUS) * LOOK_RATE * dt, (y / RADIUS) * LOOK_RATE * dt)
    rafRef.current = requestAnimationFrame(lookLoop)
  }

  const startLoop = () => {
    if (mode !== 'look' || rafRef.current) return
    lastT.current = 0
    rafRef.current = requestAnimationFrame(lookLoop)
  }
  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  useEffect(() => () => stopLoop(), [])

  const handle = (clientX, clientY) => {
    const base = baseRef.current.getBoundingClientRect()
    const cx = base.left + base.width / 2
    const cy = base.top + base.height / 2
    let dx = clientX - cx
    let dy = clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS
      dy = (dy / dist) * RADIUS
    }
    setKnob({ x: dx, y: dy })
    if (mode === 'move') {
      // 上 = 前進(z=+1)；y 軸往下為正，因此取負
      useInput.getState().setMove(dx / RADIUS, -dy / RADIUS)
    } else {
      offset.current = { x: dx, y: dy }
    }
  }

  const onPointerDown = (e) => {
    e.stopPropagation()
    pointerId.current = e.pointerId
    e.currentTarget.setPointerCapture?.(e.pointerId)
    handle(e.clientX, e.clientY)
    startLoop()
  }
  const onPointerMove = (e) => {
    if (pointerId.current !== e.pointerId) return
    e.stopPropagation()
    handle(e.clientX, e.clientY)
  }
  const onPointerUp = (e) => {
    if (pointerId.current !== e.pointerId) return
    e.stopPropagation()
    pointerId.current = null
    offset.current = { x: 0, y: 0 }
    setKnob({ x: 0, y: 0 })
    stopLoop()
    if (mode === 'move') useInput.getState().setMove(0, 0)
  }

  if (!isTouch) return null

  return (
    <div
      ref={baseRef}
      className={`joystick-base joystick-${side}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span className="joystick-hint">{mode === 'look' ? '視角' : '移動'}</span>
      <div className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  )
}
