import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere, Plane } from '@react-three/drei'
import { Mesh, Color } from 'three'
import { motion } from 'framer-motion'

interface GameSceneProps {
  isActive: boolean
  isPaused: boolean
}

export default function GameScene({ isActive, isPaused }: GameSceneProps) {
  const cubeRef = useRef<Mesh>(null)
  const sphereRef = useRef<Mesh>(null)
  const [cubeColor, setCubeColor] = useState('#3b82f6')
  const [sphereHovered, setSphereHovered] = useState(false)

  // Animation loop
  useFrame((state, delta) => {
    if (!isActive || isPaused) return

    // Rotate the cube
    if (cubeRef.current) {
      cubeRef.current.rotation.x += delta * 0.5
      cubeRef.current.rotation.y += delta * 0.3
    }

    // Float the sphere
    if (sphereRef.current) {
      sphereRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.5
    }
  })

  const handleCubeClick = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setCubeColor(randomColor)
  }

  return (
    <group>
      {/* Ground Plane */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#2a2a2a" />
      </Plane>

      {/* Interactive Cube */}
      <motion.group
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, type: "spring" }}
      >
        <Box
          ref={cubeRef}
          args={[1, 1, 1]}
          position={[-2, 0.5, 0]}
          onClick={handleCubeClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={cubeColor} />
        </Box>
      </motion.group>

      {/* Floating Sphere */}
      <motion.group
        initial={{ scale: 0, y: 5 }}
        animate={{ scale: 1, y: 1 }}
        transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
      >
        <Sphere
          ref={sphereRef}
          args={[0.5, 32, 32]}
          position={[2, 1, 0]}
          onPointerOver={() => setSphereHovered(true)}
          onPointerOut={() => setSphereHovered(false)}
          castShadow
        >
          <meshStandardMaterial 
            color={sphereHovered ? "#ff6b6b" : "#4ecdc4"}
            emissive={sphereHovered ? new Color("#ff6b6b").multiplyScalar(0.2) : new Color("#000000")}
          />
        </Sphere>
      </motion.group>

      {/* Decorative Objects */}
      {[...Array(5)].map((_, i) => (
        <motion.group
          key={i}
          initial={{ scale: 0, y: -2 }}
          animate={{ scale: 1, y: 0.2 }}
          transition={{ 
            duration: 0.8, 
            delay: 1 + i * 0.2,
            type: "spring",
            stiffness: 100
          }}
        >
          <Box
            args={[0.3, 0.4, 0.3]}
            position={[
              (Math.random() - 0.5) * 8,
              0.2,
              (Math.random() - 0.5) * 8
            ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial 
              color={`hsl(${i * 60}, 70%, 60%)`}
            />
          </Box>
        </motion.group>
      ))}

      {/* Ambient particles effect */}
      {isActive && (
        <group>
          {[...Array(10)].map((_, i) => (
            <motion.group
              key={i}
              animate={{
                y: [0, 2, 0],
                x: [0, Math.sin(i) * 2, 0],
                z: [0, Math.cos(i) * 2, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <Sphere
                args={[0.02, 8, 8]}
                position={[
                  (Math.random() - 0.5) * 10,
                  Math.random() * 5,
                  (Math.random() - 0.5) * 10
                ]}
              >
                <meshBasicMaterial 
                  color="#ffffff"
                  transparent
                  opacity={0.6}
                />
              </Sphere>
            </motion.group>
          ))}
        </group>
      )}
    </group>
  )
}
