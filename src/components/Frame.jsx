import { useMemo, useEffect, useState } from 'react'
import { TextureLoader, SRGBColorSpace } from 'three'
import { Outlines, Text } from '@react-three/drei'
import { useGallery } from '../store'

const FRAME_W = 2.88 // 畫布寬（16:9，對應 1920×1080 橫向相片）
const FRAME_H = 1.62 // 畫布高（2.88 × 9/16）
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
  const artwork = useGallery((s) => s.artworks[id])
  const dataURL = typeof artwork === 'string' ? artwork : artwork?.dataURL
  const title = typeof artwork === 'object' ? artwork.title : ''
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
      {/* 外框（鋁合金細邊）*/}
      <mesh castShadow>
        <boxGeometry args={[MAT_W + BORDER, MAT_H + BORDER, 0.16]} />
        <meshToonMaterial color="#aeb9c7" />
        <Outlines thickness={0.04} color="#3a4654" />
      </mesh>

      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[MAT_W, MAT_H, 0.08]} />
        <meshToonMaterial color="#ffffff" />
        <Outlines thickness={0.025} color="#c2ccd9" />
      </mesh>

      {/* 解說牌 */}
      <mesh position={[0, -MAT_H / 2 - 0.18, 0.1]} castShadow>
        <boxGeometry args={[1.7, 0.26, 0.08]} />
        <meshToonMaterial color="#5bc0de" />
        <Outlines thickness={0.018} color="#2f7d97" />
      </mesh>

      {title && (
        <Text
          position={[0, -MAT_H / 2 - 0.18, 0.16]}
          fontSize={0.14}
          maxWidth={1.6}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#0f2a33"
        >
          {title}
        </Text>
      )}

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
          <meshBasicMaterial map={texture} toneMapped={false} />
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

