import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PCFSoftShadowMap } from 'three'
import Gallery from './components/Gallery'
import FirstPersonPlayer from './components/FirstPersonPlayer'
import Controls from './components/Controls'
import Joystick from './components/Joystick'
import UploadUI from './components/UploadUI'
import BackgroundMusic from './components/BackgroundMusic'
import { useGallery } from './store'

export default function App() {
  const syncArtworks = useGallery((s) => s.syncArtworks)

  useEffect(() => {
    syncArtworks()
  }, [syncArtworks])

  return (
    <>
      {/* HTML 疊層 UI */}
      <UploadUI />
      <BackgroundMusic />
      <header className="school-brand" aria-label="中華基督教會基慈小學">
        <img src="/school-logo.png" alt="中華基督教會基慈小學校徽" />
        <h1>中華基督教會基慈小學</h1>
      </header>
      <Joystick />

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
