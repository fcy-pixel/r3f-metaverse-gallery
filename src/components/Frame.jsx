import { useMemo, useEffect, useState } from 'react'
import { TextureLoader, SRGBColorSpace } from 'three'
import { Outlines } from '@react-three/drei'
import { useGallery } from '../store'

const FRAME_W = 2.8 // 畫框寬
const FRAME_H = 1.9 // 畫框高
const BORDER = 0.18 // 邊框厚度
const MAT_W = FRAME_W + 0.34
const MAT_H = FRAME_H + 0.34

/**
 * 單一畫框：卡通外框 + 畫布。
 *  - 使用者上傳圖片時，畫布材質換成對應 Texture
 *  - 點擊畫作 → 放大觀看（openZoom）
 *  - hover 有描邊與游標提示
 */
export default function Frame({ id, position, rotation, color }) {
  const dataURL = useGallery((s) => s.artworks[id])
  const openZoom = useGallery((s) => s.openZoom)
  const [hovered, setHovered] = useState(false)

  // 將上傳的 dataURL 動態載入為 Texture
  const texture = useMemo(() => {
    if (!dataURL) return null
    const tex = new TextureLoader().load(dataURL)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [dataURL])

  useEffect(() => {
    return () => {
      if (texture) texture.dispose()
    }
  }, [texture])

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  return (
    <group position={position} rotation={rotation}>
      {/* 外框（卡通描邊木框）*/}
      <mesh castShadow>
        <boxGeometry args={[MAT_W + BORDER, MAT_H + BORDER, 0.16]} />
        <meshToonMaterial color="#7a4f25" />
        <Outlines thickness={0.05} color="#000000" />
      </mesh>

      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[MAT_W, MAT_H, 0.08]} />
        <meshToonMaterial color="#fff4d8" />
        <Outlines thickness={0.025} color="#8f6b3e" />
      </mesh>

      <mesh position={[0, -MAT_H / 2 - 0.18, 0.1]} castShadow>
        <boxGeometry args={[0.86, 0.16, 0.08]} />
        <meshToonMaterial color="#ffc857" />
        <Outlines thickness={0.018} color="#5a3b12" />
      </mesh>

      {/* 畫布：點擊放大 */}
      <mesh
        position={[0, 0, 0.16]}
        onClick={(e) => {
          e.stopPropagation()
          openZoom(id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        {texture ? (
          <meshToonMaterial map={texture} />
        ) : (
          <meshToonMaterial color={color} />
        )}
        {hovered && <Outlines thickness={0.06} color="#ffffff" />}
      </mesh>

      {!texture && <PlaceholderArt color={color} />}

      <mesh position={[-0.55, 0.38, 0.175]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[1.05, 0.16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

function PlaceholderArt({ color }) {
  return (
    <group position={[0, 0, 0.18]}>
      <mesh position={[-0.55, 0.2, 0.01]}>
        <circleGeometry args={[0.36, 32]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.5, -0.18, 0.012]} rotation={[0, 0, -0.42]}>
        <planeGeometry args={[1.45, 0.28]} />
        <meshToonMaterial color="#fff0c2" />
      </mesh>
      <mesh position={[0.46, 0.32, 0.014]} rotation={[0, 0, 0.26]}>
        <planeGeometry args={[0.9, 0.16]} />
        <meshToonMaterial color="#2f4858" />
      </mesh>
      <mesh position={[0.95, -0.52, 0.016]}>
        <circleGeometry args={[0.2, 24]} />
        <meshToonMaterial color={color} />
      </mesh>
    </group>
  )
}

