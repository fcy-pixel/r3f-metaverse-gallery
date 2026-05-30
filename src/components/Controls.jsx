import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useInput } from '../inputStore'
import { useGallery } from '../store'

/**
 * 桌機 / 通用控制：
 *  - 鍵盤 WASD / 方向鍵 → 移動
 *  - 在畫面上按住拖曳 → 旋轉視角（滑鼠或觸控皆可）
 * 監聽掛在 canvas DOM 上，因此 R3F 的畫作點擊事件仍可正常運作。
 */
export default function Controls() {
  const { gl } = useThree()

  useEffect(() => {
    const dom = gl.domElement
    const { setMoveAxis, addLook } = useInput.getState()
    const closeZoom = () => useGallery.getState().closeZoom()

    // ── 鍵盤 ──
    const keyState = { f: 0, b: 0, l: 0, r: 0 }
    const apply = () => {
      setMoveAxis('z', keyState.f - keyState.b)
      setMoveAxis('x', keyState.r - keyState.l)
    }
    const onKey = (down) => (e) => {
      if (down && e.code === 'Escape') {
        closeZoom()
        return
      }
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keyState.f = down
          break
        case 'KeyS':
        case 'ArrowDown':
          keyState.b = down
          break
        case 'KeyA':
        case 'ArrowLeft':
          keyState.l = down
          break
        case 'KeyD':
        case 'ArrowRight':
          keyState.r = down
          break
        default:
          return
      }
      apply()
    }
    const onKeyDown = onKey(1)
    const onKeyUp = onKey(0)

    // ── 拖曳看視角 ──
    let dragging = false
    let lastX = 0
    let lastY = 0
    let pointerId = null

    const onPointerDown = (e) => {
      if (useGallery.getState().zoomFrame !== null) {
        closeZoom()
        return
      }
      dragging = true
      pointerId = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
    }
    const onPointerMove = (e) => {
      if (!dragging || e.pointerId !== pointerId) return
      const dx = (e.clientX - lastX) * 0.005
      const dy = (e.clientY - lastY) * 0.005
      lastX = e.clientX
      lastY = e.clientY
      addLook(dx, dy)
    }
    const onPointerUp = (e) => {
      if (e.pointerId === pointerId) dragging = false
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      dom.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [gl])

  return null
}
