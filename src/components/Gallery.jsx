import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide } from 'three'
import { ContactShadows, Outlines, Sparkles } from '@react-three/drei'
import { FRAMES, ROOM, ZONES } from '../store'
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

      <VoxelFloor width={width} depth={depth} />
      <ZoneCarpets />
      <PathLines />
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

function VoxelFloor({ width, depth }) {
  const tiles = useMemo(() => {
    const result = []
    const size = 4
    for (let x = -width / 2 + size / 2; x < width / 2; x += size) {
      for (let z = -depth / 2 + size / 2; z < depth / 2; z += size) {
        const checker = (Math.round(x / size) + Math.round(z / size)) % 2 === 0
        result.push({ x, z, color: checker ? '#8fb46a' : '#789a5d' })
      }
    }
    return result
  }, [width, depth])

  return (
    <group>
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[width, 0.32, depth]} />
        <meshToonMaterial color={BLOCK.dirt} />
      </mesh>
      {tiles.map((tile) => (
        <mesh key={`${tile.x}-${tile.z}`} position={[tile.x, 0.02, tile.z]} receiveShadow>
          <boxGeometry args={[3.86, 0.08, 3.86]} />
          <meshToonMaterial color={tile.color} />
        </mesh>
      ))}
    </group>
  )
}

function ZoneCarpets() {
  return (
    <group>
      {ZONES.map((zone) => (
        <group key={zone.id}>
          <mesh position={[zone.x, 0.09, zone.z]} receiveShadow>
            <boxGeometry args={[zone.w, 0.1, zone.d]} />
            <meshToonMaterial color={zone.color} />
            <Outlines thickness={0.018} color="#1f271f" />
          </mesh>
          <mesh position={[zone.x, 0.16, zone.z]} receiveShadow>
            <boxGeometry args={[zone.w - 2, 0.06, zone.d - 2]} />
            <meshToonMaterial color={zone.accent} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function PathLines() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.08, 42]} />
        <meshToonMaterial color={BLOCK.sand} />
      </mesh>
      <mesh position={[0, 0.22, -7]} receiveShadow>
        <boxGeometry args={[42, 0.08, 5.4]} />
        <meshToonMaterial color={BLOCK.sand} />
      </mesh>
      <mesh position={[0, 0.26, 0]} receiveShadow>
        <boxGeometry args={[1.2, 0.08, 38]} />
        <meshToonMaterial color="#f5e6a6" />
      </mesh>
      <mesh position={[0, 0.27, -7]} receiveShadow>
        <boxGeometry args={[38, 0.08, 1.2]} />
        <meshToonMaterial color="#f5e6a6" />
      </mesh>
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

function ZoneMarkers() {
  return (
    <group>
      {ZONES.map((zone) => (
        <group key={`marker-${zone.id}`} position={[zone.x, 0, zone.z]}>
          <mesh position={[0, 1.05, -zone.d / 2 + 1]} castShadow>
            <boxGeometry args={[5.4, 2.1, 0.6]} />
            <meshToonMaterial color={zone.accent} />
            <Outlines thickness={0.025} color="#242424" />
          </mesh>
          <mesh position={[0, 2.45, -zone.d / 2 + 1]} castShadow>
            <boxGeometry args={[6.4, 0.55, 0.9]} />
            <meshToonMaterial color={BLOCK.oak} />
            <Outlines thickness={0.02} color="#3f2a18" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function BlockInstallations() {
  const blocks = useMemo(() => [
    [-20, 0.55, -9, BLOCK.grassDark], [-22, 1.35, -9, BLOCK.grass], [-18, 1.0, -12, BLOCK.oak],
    [18, 0.55, -8, BLOCK.prismarine], [21, 1.25, -10, BLOCK.prismarineDark], [14, 0.95, -13, '#63d7c7'],
    [-4, 0.55, -18, BLOCK.netherrack], [0, 1.2, -18, BLOCK.lava], [4, 0.85, -18, '#9d3a2f'],
    [-8, 0.55, 12, BLOCK.stone], [8, 0.75, 13, BLOCK.stoneDark], [0, 1.05, 16, BLOCK.glow],
  ], [])

  return (
    <group>
      {blocks.map(([x, y, z, color], index) => (
        <mesh key={index} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[2.1, y * 2, 2.1]} />
          <meshToonMaterial color={color} />
          <Outlines thickness={0.02} color="#242424" />
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
