import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide } from 'three'
import { ContactShadows, Outlines, Sparkles } from '@react-three/drei'
import { FRAMES, ROOM } from '../store'
import Frame from './Frame'

const BLOCK = {
  grass: '#4f8b4f',
  grassDark: '#3e6f3e',
  dirt: '#7a5230',
  oak: '#a87945',
  stone: '#7f8c8d',
  stoneDark: '#526069',
  sand: '#d8c27c',
  prismarine: '#3b9f9a',
  prismarineDark: '#256f78',
  netherrack: '#6e3430',
  lava: '#ff7a2f',
  glow: '#ffd166',
  wall: '#c9b99a',
  wallDark: '#9c8966',
}

export default function Gallery() {
  const { width, depth, height, wallT } = ROOM
  const halfH = height / 2

  return (
    <group>
      <ambientLight intensity={0.58} />
      <hemisphereLight args={['#fff3cf', '#6d8fa1', 0.9]} />
      <directionalLight
        position={[12, 16, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      <Sparkles
        count={48}
        size={1.8}
        scale={[42, 3.5, 34]}
        position={[0, 5.4, -2]}
        speed={0.12}
        opacity={0.25}
        color="#fff0a8"
      />

      <WoodFloor width={width} depth={depth} />
      <JapaneseFurniture />
      <ContactShadows
        position={[0, 0.04, 0]}
        opacity={0.32}
        scale={44}
        blur={2.2}
        far={18}
        resolution={512}
        color="#2b2418"
      />

      <Wall position={[0, halfH, -depth / 2]} args={[width, height, wallT]} accent="north" />
      <Wall position={[0, halfH, depth / 2]} args={[width, height, wallT]} accent="south" />
      <Wall position={[-width / 2, halfH, 0]} args={[wallT, height, depth]} accent="west" />
      <Wall position={[width / 2, halfH, 0]} args={[wallT, height, depth]} accent="east" />
      <Ceiling width={width} depth={depth} height={height} />

      <Lanterns />

      {FRAMES.map((frame) => (
        <ArtSpot key={`light-${frame.id}`} frame={frame} />
      ))}
      {FRAMES.map((frame) => (
        <Frame key={frame.id} {...frame} />
      ))}
    </group>
  )
}

function WoodFloor({ width, depth }) {
  const planks = useMemo(() => {
    const result = []
    const plankWidth = 1.4
    const plankDepth = 5.6
    const colors = ['#9f6b38', '#b47a42', '#8f5c30', '#c08a4e']

    for (let x = -width / 2 + plankWidth / 2; x < width / 2; x += plankWidth) {
      const column = Math.round((x + width / 2) / plankWidth)
      const offset = column % 2 === 0 ? 0 : plankDepth / 2

      for (let z = -depth / 2 + plankDepth / 2 - offset; z < depth / 2; z += plankDepth) {
        result.push({
          x,
          z,
          color: colors[(result.length + column) % colors.length],
        })
      }
    }

    return result
  }, [width, depth])

  return (
    <group>
      <mesh position={[0, -0.14, 0]} receiveShadow>
        <boxGeometry args={[width, 0.22, depth]} />
        <meshToonMaterial color="#5b351f" />
      </mesh>
      {planks.map((plank) => (
        <mesh key={`${plank.x}-${plank.z}`} position={[plank.x, 0.01, plank.z]} receiveShadow>
          <boxGeometry args={[1.3, 0.08, 5.45]} />
          <meshToonMaterial color={plank.color} />
        </mesh>
      ))}
    </group>
  )
}

function JapaneseFurniture() {
  const cushions = [
    [-2.1, 0.2, -0.2, '#8f3f31'],
    [2.1, 0.2, -0.2, '#305f73'],
    [0, 0.2, -2.1, '#6f8f42'],
    [0, 0.2, 1.7, '#d4a64a'],
  ]

  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, 0.03, -0.2]} receiveShadow>
        <boxGeometry args={[6.6, 0.06, 5.2]} />
        <meshToonMaterial color="#d7c184" />
        <Outlines thickness={0.012} color="#6f5b34" />
      </mesh>
      <mesh position={[0, 0.1, -0.2]} receiveShadow>
        <boxGeometry args={[0.08, 0.07, 5.1]} />
        <meshToonMaterial color="#80683e" />
      </mesh>
      <mesh position={[0, 0.34, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.24, 1.45]} />
        <meshToonMaterial color="#6b4024" />
        <Outlines thickness={0.02} color="#2d190e" />
      </mesh>
      <mesh position={[0, 0.52, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.95, 0.16, 1.6]} />
        <meshToonMaterial color="#a06b37" />
        <Outlines thickness={0.02} color="#2d190e" />
      </mesh>

      {cushions.map(([x, y, z, color]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[1.25, 0.24, 1.25]} />
          <meshToonMaterial color={color} />
          <Outlines thickness={0.018} color="#2d190e" />
        </mesh>
      ))}

      <group position={[3.7, 0, 2.2]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[0.22, 1.3, 0.22]} />
          <meshToonMaterial color="#5a341f" />
        </mesh>
        <mesh position={[0, 1.18, 0]} castShadow>
          <boxGeometry args={[0.9, 0.64, 0.9]} />
          <meshToonMaterial color="#fff1bb" />
          <Outlines thickness={0.016} color="#5a341f" />
        </mesh>
        <pointLight position={[0, 1.18, 0]} intensity={0.45} distance={5.5} color="#ffd98a" />
      </group>

      <group position={[-3.7, 0, 2.1]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.22, 0.72]} />
          <meshToonMaterial color="#5a341f" />
        </mesh>
        <mesh position={[0, 0.58, 0]} castShadow>
          <coneGeometry args={[0.52, 0.86, 6]} />
          <meshToonMaterial color="#477347" />
          <Outlines thickness={0.015} color="#1f3a1f" />
        </mesh>
      </group>
    </group>
  )
}

function Wall({ position, args, accent }) {
  const color = accent === 'west' ? '#b7d69a' : accent === 'east' ? '#9ed6d1' : accent === 'north' ? '#b88d86' : BLOCK.wall
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={args} />
      <meshToonMaterial color={color} />
      <Outlines thickness={0.025} color={BLOCK.wallDark} />
    </mesh>
  )
}

function Ceiling({ width, depth, height }) {
  return (
    <group>
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshToonMaterial color="#d6c9aa" side={DoubleSide} />
      </mesh>
      {[-18, -6, 6, 18].map((x) => (
        <mesh key={x} position={[x, height - 0.35, 0]} castShadow>
          <boxGeometry args={[1.1, 0.7, depth - 2]} />
          <meshToonMaterial color={BLOCK.oak} />
          <Outlines thickness={0.018} color="#3f2a18" />
        </mesh>
      ))}
    </group>
  )
}

function Lanterns() {
  const lamps = useMemo(() => [
    [-22, 4.2, 18], [0, 4.4, 17], [22, 4.2, 18],
    [-20, 4.2, -9], [20, 4.2, -9], [0, 4.2, -20],
  ], [])

  return (
    <group>
      {lamps.map(([x, y, z]) => (
        <group key={`${x}-${z}`} position={[x, y, z]}>
          <mesh position={[0, 1.15, 0]} castShadow>
            <boxGeometry args={[0.24, 2.3, 0.24]} />
            <meshToonMaterial color={BLOCK.oak} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshToonMaterial color={BLOCK.glow} />
            <Outlines thickness={0.018} color="#5a3b12" />
          </mesh>
          <pointLight intensity={0.9} distance={10} color="#ffd98a" />
        </group>
      ))}
    </group>
  )
}

function ArtSpot({ frame }) {
  const light = useRef()
  const target = useRef()
  const ry = frame.rotation[1]
  const dir = useMemo(() => ({ x: Math.sin(ry), z: Math.cos(ry) }), [ry])
  const [fx, fy, fz] = frame.position

  useEffect(() => {
    if (light.current && target.current) {
      light.current.target = target.current
      light.current.target.updateMatrixWorld()
    }
  }, [])

  return (
    <group>
      <spotLight
        ref={light}
        position={[fx + dir.x * 3.4, fy + 2.3, fz + dir.z * 3.4]}
        angle={0.48}
        penumbra={0.6}
        intensity={2.1}
        distance={13}
        decay={2}
        color="#fff0c0"
      />
      <object3D ref={target} position={[fx, fy, fz]} />
    </group>
  )
}
