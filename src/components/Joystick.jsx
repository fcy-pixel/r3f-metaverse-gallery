import { useRef, useState, useEffect } from 'react'
import { useInput } from '../inputStore'

/**
 * 行動裝置虛擬搖桿（畫面左下）。
 * 觸控拖曳搖桿 → 寫入 move 向量；放開歸零。
 * 只在觸控裝置顯示。
 */
export default function Joystick() {
  const baseRef = useRef()
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const setMove = useInput((s) => s.setMove)

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window || navigator.maxTouchPoints > 0
    )
  }, [])

  const RADIUS = 55

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
    // 上 = 前進(z=+1)；y 軸往下為正，因此取負
    setMove(dx / RADIUS, -dy / RADIUS)
  }

  const onStart = (e) => {
    e.stopPropagation()
    setActive(true)
    const t = e.touches ? e.touches[0] : e
    handle(t.clientX, t.clientY)
  }
  const onMove = (e) => {
    if (!active) return
    e.stopPropagation()
    const t = e.touches ? e.touches[0] : e
    handle(t.clientX, t.clientY)
  }
  const onEnd = (e) => {
    e.stopPropagation()
    setActive(false)
    setKnob({ x: 0, y: 0 })
    setMove(0, 0)
  }

  if (!isTouch) return null

  return (
    <div
      ref={baseRef}
      className="joystick-base"
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onPointerDown={onStart}
      onPointerMove={onMove}
      onPointerUp={onEnd}
    >
      <div
        className="joystick-knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  )
}
