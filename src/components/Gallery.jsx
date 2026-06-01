import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide } from 'three'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Outlines, Sparkles, Text } from '@react-three/drei'
import { FRAMES, PARTITIONS, PARTITION_H, ROOM, ZONES } from '../store'
import Frame from './Frame'

// 科學實驗室色盤
const LAB = {
  floor: '#eef3f8',
  floorAlt: '#dde6ef',
  grout: '#c2ccd9',
  wall: '#f4f7fb',
  wainscot: '#d6dee9',
  trim: '#a9b6c6',
  steel: '#c2cbd6',
  steelDark: '#8b96a4',
  benchTop: '#2e3a45',
  benchBody: '#fbfdff',
  benchTrim: '#cdd6e0',
  glass: '#d4eefb',
  panel: '#f0fbff',
}

export default function Gallery() {
  const { width, depth, height, wallT } = ROOM
  const halfH = height / 2

  return (
    <group>
      {/* 明亮、偏冷的實驗室照明 */}
      <ambientLight intensity={0.72} />
      <hemisphereLight args={['#ffffff', '#aab8c6', 0.95]} />
      <directionalLight
        position={[14, 20, 12]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
      />

      {/* 空氣中漂浮的細微粒子，像顯微鏡下的微觀世界 */}
      <Sparkles
        count={60}
        size={1.6}
        scale={[54, 4, 46]}
        position={[0, 5, -2]}
        speed={0.1}
        opacity={0.22}
        color="#bfe8ff"
      />

      <LabFloor width={width} depth={depth} />
      <ContactShadows
        position={[0, 0.04, 0]}
        opacity={0.3}
        scale={60}
        blur={2.4}
        far={20}
        resolution={512}
        color="#2b3540"
      />

      <Wall position={[0, halfH, -depth / 2]} args={[width, height, wallT]} accent="nether" />
      <Wall position={[0, halfH, depth / 2]} args={[width, height, wallT]} accent="spawn" />
      <Wall position={[-width / 2, halfH, 0]} args={[wallT, height, depth]} accent="forest" vertical />
      <Wall position={[width / 2, halfH, 0]} args={[wallT, height, depth]} accent="ocean" vertical />
      <Ceiling width={width} depth={depth} height={height} />

      <Partitions />
      <LabStations />
      <ZoneSigns height={height} />

      {FRAMES.map((frame) => (
        <ArtSpot key={`light-${frame.id}`} frame={frame} />
      ))}
      {FRAMES.map((frame) => (
        <Frame key={frame.id} {...frame} />
      ))}
    </group>
  )
}

/* ---------- 地板：實驗室方格地磚 + 分區色帶 ---------- */
function LabFloor({ width, depth }) {
  const tiles = useMemo(() => {
    const result = []
    const size = 4
    for (let x = -width / 2 + size / 2; x < width / 2; x += size) {
      for (let z = -depth / 2 + size / 2; z < depth / 2; z += size) {
        const checker = (Math.round(x / size) + Math.round(z / size)) % 2 === 0
        result.push({ x, z, color: checker ? LAB.floor : LAB.floorAlt })
      }
    }
    return result
  }, [width, depth])

  return (
    <group>
      {/* 底板（接縫色）*/}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[width, 0.16, depth]} />
        <meshToonMaterial color={LAB.grout} />
      </mesh>
      {tiles.map((t) => (
        <mesh key={`${t.x}-${t.z}`} position={[t.x, 0.01, t.z]} receiveShadow>
          <boxGeometry args={[3.82, 0.04, 3.82]} />
          <meshToonMaterial color={t.color} />
        </mesh>
      ))}
      {/* 分區地面指示色帶 */}
      {ZONES.map((zone) => (
        <mesh key={zone.id} position={[zone.x, 0.035, zone.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.1, 3.6, 48]} />
          <meshBasicMaterial color={zone.accent} transparent opacity={0.5} side={DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------- 牆面：乾淨白牆 + 分區色帶 ---------- */
function Wall({ position, args, accent, vertical }) {
  const zone = ZONES.find((z) => z.id === accent)
  const band = zone ? zone.accent : LAB.trim
  // 色帶尺寸：沿牆長方向延伸的細條
  const len = vertical ? args[2] : args[0]
  const bandArgs = vertical ? [args[0] + 0.05, 0.45, len * 0.96] : [len * 0.96, 0.45, args[2] + 0.05]
  const inward = vertical ? (position[0] < 0 ? 0.02 : -0.02) : position[2] < 0 ? 0.02 : -0.02

  return (
    <group>
      <mesh position={position} receiveShadow castShadow>
        <boxGeometry args={args} />
        <meshToonMaterial color={LAB.wall} />
        <Outlines thickness={0.02} color={LAB.trim} />
      </mesh>
      {/* 牆腳護板 */}
      <mesh position={vertical ? [position[0] + inward, 0.55, 0] : [0, 0.55, position[2] + inward]}>
        <boxGeometry args={vertical ? [args[0] + 0.04, 1.1, len * 0.985] : [len * 0.985, 1.1, args[2] + 0.04]} />
        <meshToonMaterial color={LAB.wainscot} />
      </mesh>
      {/* 分區色帶（高處）*/}
      <mesh position={vertical ? [position[0] + inward, 5.4, 0] : [0, 5.4, position[2] + inward]}>
        <boxGeometry args={bandArgs} />
        <meshToonMaterial color={band} />
      </mesh>
    </group>
  )
}

/* ---------- 天花板：白色 + 嵌入式 LED 燈板 ---------- */
function Ceiling({ width, depth, height }) {
  const panels = useMemo(() => {
    const result = []
    for (let x = -width / 2 + 8; x < width / 2 - 4; x += 12) {
      for (let z = -depth / 2 + 8; z < depth / 2 - 4; z += 12) {
        result.push([x, z])
      }
    }
    return result
  }, [width, depth])

  return (
    <group>
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshToonMaterial color="#e9eef4" side={DoubleSide} />
      </mesh>
      {/* 結構樑 */}
      {[-21, -7, 7, 21].map((x) => (
        <mesh key={x} position={[x, height - 0.25, 0]}>
          <boxGeometry args={[0.5, 0.5, depth - 2]} />
          <meshToonMaterial color={LAB.steel} />
        </mesh>
      ))}
      {/* LED 燈板 */}
      {panels.map(([x, z], i) => (
        <group key={`${x}-${z}`} position={[x, height - 0.18, z]}>
          <mesh>
            <boxGeometry args={[5, 0.12, 5]} />
            <meshStandardMaterial color={LAB.panel} emissive="#eef9ff" emissiveIntensity={0.9} />
          </mesh>
          {i % 2 === 0 && <pointLight position={[0, -0.6, 0]} intensity={0.55} distance={16} color="#eaf6ff" />}
        </group>
      ))}
    </group>
  )
}

/* ---------- 室內隔斷：金屬框 + 霧面玻璃 ---------- */
function Partitions() {
  return (
    <group>
      {PARTITIONS.map((p, i) => {
        const isX = p.w > p.d // 沿 X 延伸
        const len = isX ? p.w : p.d
        const thick = isX ? p.d : p.w
        return (
          <group key={i} position={[p.x, 0, p.z]}>
            {/* 下方不透光面板 */}
            <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
              <boxGeometry args={isX ? [len, 1.4, thick] : [thick, 1.4, len]} />
              <meshToonMaterial color={LAB.benchBody} />
              <Outlines thickness={0.02} color={LAB.steelDark} />
            </mesh>
            {/* 上方霧面玻璃 */}
            <mesh position={[0, PARTITION_H / 2 + 0.9, 0]}>
              <boxGeometry args={isX ? [len, PARTITION_H - 1.4, thick * 0.4] : [thick * 0.4, PARTITION_H - 1.4, len]} />
              <meshStandardMaterial color={LAB.glass} transparent opacity={0.28} roughness={0.1} metalness={0.1} />
            </mesh>
            {/* 頂框 */}
            <mesh position={[0, PARTITION_H, 0]}>
              <boxGeometry args={isX ? [len, 0.14, thick + 0.08] : [thick + 0.08, 0.14, len]} />
              <meshToonMaterial color={LAB.steel} />
            </mesh>
            {/* 立柱 */}
            {[-len / 2 + 0.1, len / 2 - 0.1].map((o) => (
              <mesh key={o} position={isX ? [o, PARTITION_H / 2, 0] : [0, PARTITION_H / 2, o]}>
                <boxGeometry args={[0.18, PARTITION_H, 0.18]} />
                <meshToonMaterial color={LAB.steelDark} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

/* ---------- 各分區的實驗器材陳設 ---------- */
function LabStations() {
  return (
    <group>
      {/* 入口：迎賓櫃台 + DNA 雙螺旋 + 地球儀 */}
      <LabBench position={[-12, 0, 19]} />
      <LabBench position={[12, 0, 19]} />
      <Glassware position={[12, 1.02, 19]} />
      <DnaHelix position={[10, 0, 22]} />
      <Globe position={[-10, 1.02, 19]} />

      {/* 生命科學區（左後）：顯微鏡 + 植物標本 */}
      <LabBench position={[-20, 0, -10]} />
      <Microscope position={[-20, 1.02, -10]} />
      <LabBench position={[-12, 0, -16]} />
      <PlantSpecimens position={[-12, 1.02, -16]} />

      {/* 化學實驗區（右後）：玻璃器皿 + 試管架 */}
      <LabBench position={[20, 0, -10]} />
      <Glassware position={[20, 1.02, -10]} />
      <LabBench position={[12, 0, -16]} />
      <TestTubeRack position={[12, 1.02, -16]} />

      {/* 物理與能量區（後方中央）：原子模型 + 能量球 */}
      <LabBench position={[-9, 0, -24]} />
      <MoleculeModel position={[-9, 1.6, -24]} />
      <LabBench position={[9, 0, -24]} />
      <PlasmaBall position={[9, 1.32, -24]} />
    </group>
  )
}

function LabBench({ position }) {
  return (
    <group position={position}>
      {/* 桌身（白色櫃）*/}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1, 1.5]} />
        <meshToonMaterial color={LAB.benchBody} />
        <Outlines thickness={0.015} color={LAB.steelDark} />
      </mesh>
      {/* 抽屜縫 */}
      <mesh position={[0, 0.5, 0.76]}>
        <boxGeometry args={[3.2, 0.9, 0.02]} />
        <meshToonMaterial color={LAB.benchTrim} />
      </mesh>
      {/* 黑色環氧樹脂桌面 */}
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.1, 1.7]} />
        <meshToonMaterial color={LAB.benchTop} />
        <Outlines thickness={0.015} color="#11181f" />
      </mesh>
    </group>
  )
}

function Beaker({ position, liquid, fill = 0.55, r = 0.18, h = 0.42 }) {
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r, h, 18]} />
        <meshStandardMaterial color={LAB.glass} transparent opacity={0.32} roughness={0.08} />
      </mesh>
      <mesh position={[0, (h * fill) / 2 + 0.01, 0]}>
        <cylinderGeometry args={[r * 0.92, r * 0.92, h * fill, 18]} />
        <meshToonMaterial color={liquid} />
      </mesh>
    </group>
  )
}

function Flask({ position, liquid }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.34, 12]} />
        <meshStandardMaterial color={LAB.glass} transparent opacity={0.32} roughness={0.08} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.26, 0.4, 20]} />
        <meshStandardMaterial color={LAB.glass} transparent opacity={0.3} roughness={0.08} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <coneGeometry args={[0.2, 0.24, 20]} />
        <meshToonMaterial color={liquid} />
      </mesh>
    </group>
  )
}

function Glassware({ position }) {
  return (
    <group position={position}>
      <Beaker position={[-0.7, 0, 0.2]} liquid="#39a7d4" fill={0.6} />
      <Beaker position={[-0.1, 0, -0.2]} liquid="#f0883e" fill={0.45} r={0.14} h={0.34} />
      <Flask position={[0.6, 0, 0.15]} liquid="#9b59b6" />
      <Flask position={[1.1, 0, -0.2]} liquid="#54c275" />
    </group>
  )
}

function TestTubeRack({ position }) {
  const tubes = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6']
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.5, 0.16, 0.4]} />
        <meshToonMaterial color="#7a8696" />
        <Outlines thickness={0.012} color={LAB.steelDark} />
      </mesh>
      {tubes.map((c, i) => {
        const x = -0.6 + i * 0.3
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.6, 12]} />
              <meshStandardMaterial color={LAB.glass} transparent opacity={0.32} roughness={0.08} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
              <meshToonMaterial color={c} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Microscope({ position }) {
  return (
    <group position={position}>
      {/* 底座 */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.4, 0.12, 6]} />
        <meshToonMaterial color={LAB.steelDark} />
      </mesh>
      {/* 立臂 */}
      <mesh position={[0.16, 0.55, -0.05]} rotation={[0, 0, -0.18]} castShadow>
        <boxGeometry args={[0.16, 0.95, 0.18]} />
        <meshToonMaterial color={LAB.steel} />
      </mesh>
      {/* 載物台 */}
      <mesh position={[0, 0.5, 0.12]}>
        <boxGeometry args={[0.5, 0.07, 0.45]} />
        <meshToonMaterial color="#3a4654" />
      </mesh>
      {/* 鏡筒 */}
      <mesh position={[0, 0.95, 0.1]} rotation={[0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 14]} />
        <meshToonMaterial color={LAB.steelDark} />
      </mesh>
      {/* 目鏡 */}
      <mesh position={[0, 1.18, 0.28]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.18, 14]} />
        <meshToonMaterial color="#1f2730" />
      </mesh>
    </group>
  )
}

function PlantSpecimens({ position }) {
  const pots = [
    [-0.7, '#54c275'],
    [0, '#3da35d'],
    [0.7, '#7bd389'],
  ]
  return (
    <group position={position}>
      {pots.map(([x, leaf], i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* 培養皿 / 花盆 */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.24, 16]} />
            <meshToonMaterial color="#d98b5f" />
          </mesh>
          {/* 葉片 */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <coneGeometry args={[0.22, 0.5, 7]} />
            <meshToonMaterial color={leaf} />
            <Outlines thickness={0.012} color="#27502f" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function MoleculeModel({ position }) {
  // 中央原子 + 三個外圍原子（球棍模型）
  const atoms = [
    [1.1, 0.2, 0, '#e74c3c'],
    [-0.7, 0.9, 0.4, '#3498db'],
    [-0.6, -0.7, -0.5, '#f1c40f'],
  ]
  const tref = useRef()
  useFrameSpin(tref)
  return (
    <group position={position} ref={tref}>
      <mesh castShadow>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshToonMaterial color="#2f3a45" />
        <Outlines thickness={0.01} color="#11181f" />
      </mesh>
      {atoms.map(([x, y, z, c], i) => {
        const len = Math.hypot(x, y, z)
        return (
          <group key={i}>
            <mesh position={[x / 2, y / 2, z / 2]} rotation={bondRotation(x, y, z)}>
              <cylinderGeometry args={[0.06, 0.06, len, 10]} />
              <meshToonMaterial color="#cdd6e0" />
            </mesh>
            <mesh position={[x, y, z]} castShadow>
              <sphereGeometry args={[0.26, 20, 20]} />
              <meshToonMaterial color={c} />
              <Outlines thickness={0.012} color="#11181f" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function PlasmaBall({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.46, 0.24, 20]} />
        <meshToonMaterial color={LAB.steelDark} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.5, 28, 28]} />
        <meshStandardMaterial
          color="#7a5cff"
          emissive="#9b6bff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.55}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight position={[0, 0.7, 0]} intensity={0.7} distance={6} color="#b08bff" />
    </group>
  )
}

function DnaHelix({ position }) {
  const ref = useRef()
  useFrameSpin(ref, 0.4)
  const rungs = useMemo(() => {
    const arr = []
    const count = 14
    for (let i = 0; i < count; i++) {
      const t = i / count
      const y = t * 3.4
      const a = t * Math.PI * 4
      arr.push({ y, a })
    }
    return arr
  }, [])
  return (
    <group position={position} ref={ref}>
      {rungs.map((r, i) => {
        const x1 = Math.cos(r.a) * 0.5
        const z1 = Math.sin(r.a) * 0.5
        return (
          <group key={i}>
            <mesh position={[x1, r.y + 0.4, z1]}>
              <sphereGeometry args={[0.13, 14, 14]} />
              <meshToonMaterial color={i % 2 ? '#39a7d4' : '#54c275'} />
            </mesh>
            <mesh position={[-x1, r.y + 0.4, -z1]}>
              <sphereGeometry args={[0.13, 14, 14]} />
              <meshToonMaterial color={i % 2 ? '#f0883e' : '#e74c3c'} />
            </mesh>
            <mesh position={[0, r.y + 0.4, 0]} rotation={[0, -r.a, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 1, 8]} />
              <meshToonMaterial color="#cdd6e0" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Globe({ position }) {
  const ref = useRef()
  useFrameSpin(ref, 0.3)
  return (
    <group position={position}>
      {/* 支架 */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.1, 16]} />
        <meshToonMaterial color={LAB.steelDark} />
      </mesh>
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0.4]} ref={ref}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshToonMaterial color="#3a8fd0" />
        <Outlines thickness={0.012} color="#1e5a8a" />
      </mesh>
    </group>
  )
}

/* ---------- 懸吊的分區指示牌 ---------- */
function ZoneSigns({ height }) {
  return (
    <group>
      {ZONES.map((zone) => (
        <group key={zone.id} position={[zone.x, height - 1.4, zone.z]}>
          {/* 吊桿 */}
          <mesh position={[-1.6, 0.7, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshToonMaterial color={LAB.steelDark} />
          </mesh>
          <mesh position={[1.6, 0.7, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshToonMaterial color={LAB.steelDark} />
          </mesh>
          {/* 牌面 */}
          <mesh>
            <boxGeometry args={[3.8, 0.9, 0.12]} />
            <meshToonMaterial color="#ffffff" />
            <Outlines thickness={0.02} color={zone.accent} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[3.8, 0.14, 0.12]} />
            <meshToonMaterial color={zone.accent} />
          </mesh>
          {[0.07, -0.07].map((zf) => (
            <Text
              key={zf}
              position={[0, 0.02, zf]}
              rotation={[0, zf > 0 ? 0 : Math.PI, 0]}
              fontSize={0.42}
              anchorX="center"
              anchorY="middle"
              color="#243240"
            >
              {`${zone.icon}  ${zone.name}`}
            </Text>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ---------- 畫作投射燈 ---------- */
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
        intensity={1.9}
        distance={13}
        decay={2}
        color="#f3fbff"
      />
      <object3D ref={target} position={[fx, fy, fz]} />
    </group>
  )
}

/* ---------- 小工具：緩慢自轉 ---------- */
function useFrameSpin(ref, speed = 0.5) {
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })
}
function bondRotation(x, y, z) {
  // 讓圓柱（預設沿 Y 軸）對齊鍵結方向，回傳尤拉角
  const len = Math.hypot(x, y, z) || 1
  const ax = Math.acos(y / len)
  const az = Math.atan2(x, z)
  return [ax, 0, -az + Math.PI / 2]
}
