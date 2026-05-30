import { Canvas } from '@react-three/fiber'
import { PCFSoftShadowMap } from 'three'
import Gallery from './components/Gallery'
import FirstPersonPlayer from './components/FirstPersonPlayer'
import Controls from './components/Controls'
import Joystick from './components/Joystick'
import UploadUI from './components/UploadUI'

export default function App() {
  return (
    <>
      {/* HTML 疊層 UI */}
      <UploadUI />
      <Joystick />
      <div className="hint">
        WASD / 方向鍵或左下搖桿移動 · 拖曳轉視角 · 點畫作聚焦 · 點空白或 Esc 離開
      </div>

      <Canvas
        shadows={{ type: PCFSoftShadowMap }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 60, near: 0.1, far: 200, position: [0, 4, 22] }}
      >
        <color attach="background" args={['#bfe7ff']} />
        <fog attach="fog" args={['#bfe7ff', 42, 88]} />
        <Gallery />
        <FirstPersonPlayer />
        <Controls />
      </Canvas>
    </>
  )
}
