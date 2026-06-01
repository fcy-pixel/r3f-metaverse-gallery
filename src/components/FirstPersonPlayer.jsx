import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { useInput } from '../inputStore'
import { BOUNDS, FRAMES, ROOM, groundHeightAt, resolvePartitions, useGallery } from '../store'

const SPEED = 6.8
const EYE_HEIGHT = 1.7
const GRAVITY = 24
const VIEW_FOV = 60
const ZOOM_FOV = 38

// 放大觀看時要完整看到的範圍（畫框外緣 + 邊距），用來依螢幕比例算出鏡頭距離
const FIT_W = 3.6
const FIT_H = 2.7
const MAX_ZOOM_DIST = 16

const _target = new Vector3()
const _focus = new Vector3()
const _normal = new Vector3()
const _zoomPos = new Vector3()

export default function FirstPersonPlayer() {
  const { camera } = useThree()
  const feet = useRef(new Vector3(0, 0, 8))
  const velY = useRef(0)
  const look = useRef(new Vector3())
  const right = useRef(new Vector3())

  useEffect(() => {
    camera.rotation.order = 'YXZ'
    camera.position.set(feet.current.x, EYE_HEIGHT, feet.current.z)
    camera.fov = VIEW_FOV
    camera.updateProjectionMatrix()
  }, [camera])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const { move, yaw, pitch } = useInput.getState()
    const { zoomFrame } = useGallery.getState()

    const zoomedFrame = zoomFrame ? FRAMES.find((frame) => frame.id === zoomFrame) : null
    if (zoomedFrame) {
      focusArtwork(camera, zoomedFrame)
      return
    }

    const targetFov = VIEW_FOV
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = MathUtils.lerp(camera.fov, targetFov, 0.18)
      camera.updateProjectionMatrix()
    }

    const lookX = -Math.sin(yaw)
    const lookZ = -Math.cos(yaw)
    look.current.set(lookX, 0, lookZ)
    right.current.set(-lookZ, 0, lookX)

    if (move.x !== 0 || move.z !== 0) {
      const vx = look.current.x * move.z + right.current.x * move.x
      const vz = look.current.z * move.z + right.current.z * move.x
      const len = Math.hypot(vx, vz) || 1
      feet.current.x += (vx / len) * SPEED * delta
      feet.current.z += (vz / len) * SPEED * delta

      feet.current.x = MathUtils.clamp(feet.current.x, BOUNDS.minX, BOUNDS.maxX)
      feet.current.z = MathUtils.clamp(feet.current.z, BOUNDS.minZ, BOUNDS.maxZ)

      const [rx, rz] = resolvePartitions(feet.current.x, feet.current.z)
      feet.current.x = rx
      feet.current.z = rz
    }

    const ground = groundHeightAt(feet.current.x, feet.current.z, feet.current.y)
    velY.current -= GRAVITY * delta
    feet.current.y += velY.current * delta
    if (feet.current.y <= ground) {
      feet.current.y = ground
      velY.current = 0
    }

    camera.position.set(feet.current.x, feet.current.y + EYE_HEIGHT, feet.current.z)
    camera.position.y = MathUtils.clamp(camera.position.y, EYE_HEIGHT, ROOM.height - 0.45)
    camera.rotation.y = yaw
    camera.rotation.x = MathUtils.clamp(pitch, -1.05, 1.05)
  })

  return null
}

function focusArtwork(camera, frame) {
  const [x, y, z] = frame.position
  const ry = frame.rotation[1]
  _focus.set(x, y, z)
  _normal.set(Math.sin(ry), 0, Math.cos(ry))

  // 依目前視窗比例計算鏡頭距離，確保整幅畫作（含畫框）都進得了畫面。
  // 直立手機（aspect < 1）時水平視野較窄，鏡頭會自動退後，避免畫作被裁切。
  const vFov = (ZOOM_FOV * Math.PI) / 180
  const tanV = Math.tan(vFov / 2)
  const aspect = camera.aspect || 1
  const distV = FIT_H / 2 / tanV
  const distH = FIT_W / 2 / (tanV * aspect)
  const dist = Math.min(Math.max(distV, distH), MAX_ZOOM_DIST)

  _zoomPos.copy(_focus).addScaledVector(_normal, dist)
  _zoomPos.y = y + 0.05

  camera.position.lerp(_zoomPos, 0.2)
  _target.copy(_focus)
  camera.lookAt(_target)

  if (Math.abs(camera.fov - ZOOM_FOV) > 0.01) {
    camera.fov = MathUtils.lerp(camera.fov, ZOOM_FOV, 0.18)
    camera.updateProjectionMatrix()
  }
}