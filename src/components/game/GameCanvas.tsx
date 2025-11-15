import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Stats } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import GameScene from './GameScene'

interface GameCanvasProps {
  isActive: boolean
  isPaused: boolean
  showStats?: boolean
  showPerf?: boolean
}

export interface GameCanvasRef {
  resetCamera: () => void
  takeScreenshot: () => string | null
}

const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(({
  isActive,
  isPaused,
  showStats = false,
  showPerf = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlsRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        controlsRef.current.reset()
      }
    },
    takeScreenshot: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png')
      }
      return null
    }
  }))

  // Handle pause/resume
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = isActive && !isPaused
    }
  }, [isActive, isPaused])

  return (
    <div className={`absolute inset-0 ${isActive ? 'opacity-100' : 'opacity-50'} transition-opacity duration-500`}>
      <Canvas
        ref={canvasRef}
        camera={{ 
          position: [10, 10, 10], 
          fov: 60,
          near: 0.1,
          far: 1000 
        }}
        shadows
        dpr={[1, 2]} // Responsive pixel ratio for performance
        performance={{ min: 0.5 }} // Automatic performance scaling
      >
        {/* Performance monitoring (development only) */}
        {showPerf && <Perf position="top-left" />}
        
        {/* Stats (development only) */}
        {showStats && <Stats />}

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* Environment */}
        <Environment preset="sunset" />
        
        {/* Ground Grid */}
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#ffffff" 
          sectionSize={5} 
          sectionThickness={1}
          sectionColor="#4a90e2"
          fadeDistance={25}
          fadeStrength={1}
          position={[0, -0.01, 0]}
        />

        {/* Main Game Scene */}
        <GameScene 
          isActive={isActive} 
          isPaused={isPaused} 
        />

        {/* Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enabled={isActive && !isPaused}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2} // Prevent camera from going below ground
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  )
})

GameCanvas.displayName = 'GameCanvas'

export default GameCanvas
