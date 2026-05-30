import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { BOUNDS } from '../store'

const SPEED = 5 // 移動速度 (m/s)
const EYE_HEIGHT = 1.7 // 視線高度

/**
 * 第一人稱控制：
 *  - 滑鼠（PointerLockControls）控制視角
 *  - WASD / 方向鍵 控制水平移動
 *  - 碰撞偵測：把座標夾在房間內邊界 BOUNDS 內，無法穿牆
 */
export default function Player({ controlsRef }) {
  const { camera } = useThree()

  // 按鍵狀態
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })

  // 暫存向量，避免每幀新建物件
  const direction = useRef(new Vector3())
  const frontVector = useRef(new Vector3())
  const sideVector = useRef(new Vector3())

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 6)

    const onKeyDown = (e) => setKey(e.code, true)
    const onKeyUp = (e) => setKey(e.code, false)

    const setKey = (code, value) => {
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = value
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = value
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = value
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = value
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [camera])

  useFrame((_, delta) => {
    const { forward, backward, left, right } = keys.current

    // 依鍵盤組合出移動向量（相機座標系）
    frontVector.current.set(0, 0, Number(backward) - Number(forward))
    sideVector.current.set(Number(left) - Number(right), 0, 0)

    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(SPEED * delta)

    // 將移動向量轉到世界座標（只取水平方向 yaw）
    direction.current.applyEuler(camera.rotation)
    direction.current.y = 0 // 保持在地面，不會飛起來

    camera.position.add(direction.current)

    // ── 碰撞偵測：夾在房間內邊界，無法穿牆 ──
    camera.position.x = clamp(camera.position.x, BOUNDS.minX, BOUNDS.maxX)
    camera.position.z = clamp(camera.position.z, BOUNDS.minZ, BOUNDS.maxZ)
    camera.position.y = EYE_HEIGHT
  })

  return <PointerLockControls ref={controlsRef} />
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
