import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import { Vector3, MathUtils } from 'three'
import { useInput } from '../inputStore'
import { useGallery } from '../store'
import { groundHeightAt, BOUNDS, ROOM } from '../store'

const SPEED = 7 // 移動速度 (m/s)
const GRAVITY = 22
const CAM_DIST = 7 // 攝影機與角色距離
const HEAD_Y = 1.6 // 角色注視點高度

/**
 * 第三人稱卡通角色：
 *  - 讀取輸入 store 的 move / yaw / pitch
 *  - 移動方向相對於攝影機 yaw，含重力與多層地面偵測（斜坡/二樓）
 *  - 攝影機在角色後方跟隨
 */
export default function Character() {
  const { camera } = useThree()
  const group = useRef()
  const pos = useRef(new Vector3(0, 0, 8)) // 角色腳底位置
  const velY = useRef(0)
  const faceYaw = useRef(Math.PI) // 角色面向

  const tmpLook = useRef(new Vector3())
  const tmpRight = useRef(new Vector3())
  const tmpTarget = useRef(new Vector3())

  useFrame((_, dRaw) => {
    const delta = Math.min(dRaw, 0.05) // 防止分頁切換造成大跳動
    const { move, yaw, pitch } = useInput.getState()
    const zoomed = useGallery.getState().zoomFrame !== null

    // 攝影機朝向（水平）
    const lookX = Math.sin(yaw)
    const lookZ = -Math.cos(yaw)
    tmpLook.current.set(lookX, 0, lookZ)
    tmpRight.current.set(-lookZ, 0, lookX) // 右方向

    // ── 水平移動 ──
    if (!zoomed && (move.x !== 0 || move.z !== 0)) {
      const vx = tmpLook.current.x * move.z + tmpRight.current.x * move.x
      const vz = tmpLook.current.z * move.z + tmpRight.current.z * move.x
      const len = Math.hypot(vx, vz) || 1
      const nx = (vx / len) * SPEED * delta
      const nz = (vz / len) * SPEED * delta

      pos.current.x += nx
      pos.current.z += nz

      // 外牆碰撞：夾在房間邊界內
      pos.current.x = MathUtils.clamp(pos.current.x, BOUNDS.minX, BOUNDS.maxX)
      pos.current.z = MathUtils.clamp(pos.current.z, BOUNDS.minZ, BOUNDS.maxZ)

      // 角色面向移動方向
      faceYaw.current = Math.atan2(nx, nz)
    }

    // ── 重力 + 多層地面 ──
    const ground = groundHeightAt(pos.current.x, pos.current.z, pos.current.y)
    velY.current -= GRAVITY * delta
    pos.current.y += velY.current * delta
    if (pos.current.y <= ground) {
      pos.current.y = ground
      velY.current = 0
    }

    // 更新角色模型
    if (group.current) {
      group.current.position.set(pos.current.x, pos.current.y, pos.current.z)
      group.current.rotation.y = faceYaw.current
    }

    // ── 第三人稱跟隨攝影機 ──
    tmpTarget.current.set(pos.current.x, pos.current.y + HEAD_Y, pos.current.z)
    const horiz = CAM_DIST * Math.cos(pitch)
    let camX = tmpTarget.current.x - lookX * horiz
    let camZ = tmpTarget.current.z - lookZ * horiz
    let camY = tmpTarget.current.y + CAM_DIST * Math.sin(pitch)

    // 攝影機碰撞：夾在房間內部，避免穿牆 / 卡進牆面
    const limit = ROOM.width / 2 - ROOM.wallT - 0.3
    const limitZ = ROOM.depth / 2 - ROOM.wallT - 0.3
    camX = MathUtils.clamp(camX, -limit, limit)
    camZ = MathUtils.clamp(camZ, -limitZ, limitZ)
    camY = MathUtils.clamp(camY, 0.8, ROOM.height - 0.6)

    // 平滑跟隨
    camera.position.lerp(_tmp.set(camX, camY, camZ), 0.18)
    camera.lookAt(tmpTarget.current)
  })

  return (
    <group ref={group}>
      <CartoonAvatar />
    </group>
  )
}

const _tmp = new Vector3()

/** 簡單的卡通小人：身體 + 頭 + 帽子 + 描邊。 */
function CartoonAvatar() {
  return (
    <group>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.14} />
      </mesh>

      {/* 背包 */}
      <mesh position={[0, 0.92, -0.36]} castShadow>
        <boxGeometry args={[0.58, 0.72, 0.28]} />
        <meshToonMaterial color="#27b6a5" />
        <Outlines thickness={0.035} color="#0e4a47" />
      </mesh>

      {/* 身體 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <meshToonMaterial color="#4d7cff" />
        <Outlines thickness={0.04} color="#15203a" />
      </mesh>
      <mesh position={[0, 1.03, 0.39]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshToonMaterial color="#ffc857" />
        <Outlines thickness={0.02} color="#624315" />
      </mesh>

      {/* 手 */}
      <mesh position={[-0.48, 0.78, 0.08]} rotation={[0.2, 0, -0.55]} castShadow>
        <capsuleGeometry args={[0.1, 0.52, 8, 12]} />
        <meshToonMaterial color="#ffd9a8" />
        <Outlines thickness={0.028} color="#4c3324" />
      </mesh>
      <mesh position={[0.48, 0.78, 0.08]} rotation={[0.2, 0, 0.55]} castShadow>
        <capsuleGeometry args={[0.1, 0.52, 8, 12]} />
        <meshToonMaterial color="#ffd9a8" />
        <Outlines thickness={0.028} color="#4c3324" />
      </mesh>

      {/* 腳 */}
      <mesh position={[-0.22, 0.13, 0.16]} castShadow>
        <boxGeometry args={[0.24, 0.18, 0.46]} />
        <meshToonMaterial color="#263547" />
        <Outlines thickness={0.025} color="#111822" />
      </mesh>
      <mesh position={[0.22, 0.13, 0.16]} castShadow>
        <boxGeometry args={[0.24, 0.18, 0.46]} />
        <meshToonMaterial color="#263547" />
        <Outlines thickness={0.025} color="#111822" />
      </mesh>

      {/* 頭 */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshToonMaterial color="#ffd9a8" />
        <Outlines thickness={0.04} color="#3a2a18" />
      </mesh>
      {/* 頭髮 */}
      <mesh position={[0, 1.88, 0.12]} rotation={[0.2, 0, 0]} castShadow>
        <sphereGeometry args={[0.37, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#4b2f24" />
      </mesh>
      {/* 帽子 */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.45, 0.5, 24]} />
        <meshToonMaterial color="#ff5a8a" />
        <Outlines thickness={0.04} color="#3a1020" />
      </mesh>
      {/* 眼睛（面向 +Z，即角色預設正面）*/}
      <mesh position={[-0.15, 1.7, 0.38]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.15, 1.7, 0.38]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.28, 1.6, 0.36]}>
        <sphereGeometry args={[0.045, 12, 8]} />
        <meshBasicMaterial color="#ff8fa3" />
      </mesh>
      <mesh position={[0.28, 1.6, 0.36]}>
        <sphereGeometry args={[0.045, 12, 8]} />
        <meshBasicMaterial color="#ff8fa3" />
      </mesh>
    </group>
  )
}
