import { useEffect, useMemo, useState } from 'react'
import { Billboard, Outlines, Sparkles, Text } from '@react-three/drei'
import { DAO_TRIALS, useDaoGame } from '../daoGameStore'

export default function DaoNodes() {
  const completed = useDaoGame((state) => state.completed)
  const openTrial = useDaoGame((state) => state.openTrial)

  return (
    <group>
      {DAO_TRIALS.map((trial) => (
        <DaoNode
          key={trial.id}
          trial={trial}
          done={completed.includes(trial.id)}
          onOpen={() => openTrial(trial.id)}
        />
      ))}
    </group>
  )
}

function DaoNode({ trial, done, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const color = done ? '#7bb46a' : trial.color
  const ringColor = done ? '#d9f9b8' : '#fff0b8'
  const glowScale = useMemo(() => (done ? [2.8, 1.3, 2.8] : [2.2, 1.1, 2.2]), [done])

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  return (
    <group position={trial.position}>
      <Sparkles
        count={done ? 24 : 16}
        size={done ? 1.5 : 1.1}
        scale={glowScale}
        position={[0, 1.25, 0]}
        speed={0.22}
        opacity={done ? 0.55 : 0.35}
        color={ringColor}
      />

      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.05, 1.28, 48]} />
        <meshBasicMaterial color={ringColor} transparent opacity={hovered || done ? 0.55 : 0.25} />
      </mesh>

      <mesh
        position={[0, 0.72, 0]}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation()
          onOpen()
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.7, 0.92, 1.38, 6]} />
        <meshToonMaterial color={color} />
        <Outlines thickness={hovered ? 0.055 : 0.032} color={hovered ? '#ffffff' : '#342319'} />
      </mesh>

      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[1.5, 0.16, 0.22]} />
        <meshToonMaterial color="#ffe7a1" />
        <Outlines thickness={0.018} color="#5d3b1a" />
      </mesh>

      <Billboard position={[0, 2.15, 0]} follow lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={0.28}
          maxWidth={2.8}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#2c1b12"
          outlineWidth={0.025}
          outlineColor="#fff5d4"
        >
          {done ? `已悟：${trial.title}` : trial.title}
        </Text>
      </Billboard>
    </group>
  )
}