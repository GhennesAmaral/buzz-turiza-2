import { useState, useEffect, Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import { Toaster } from '@/components/ui/sonner'
import GameCanvas from '@/components/game/GameCanvas'
import GameUI from '@/components/game/GameUI'
import LoadingScreen from '@/components/game/LoadingScreen'
import '@fontsource/inter'

function App() {
  const [isGameLoaded, setIsGameLoaded] = useState(false)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused'>('menu')

  // Game initialization
  useEffect(() => {
    // Simulate game loading
    const timer = setTimeout(() => {
      setIsGameLoaded(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleStartGame = () => {
    setGameState('playing')
  }

  const handlePauseGame = () => {
    setGameState('paused')
  }

  const handleResumeGame = () => {
    setGameState('playing')
  }

  const handleBackToMenu = () => {
    setGameState('menu')
  }

  return (
    <>
      <Helmet>
        <title>Game Template - 3D Interactive Experience</title>
        <meta name="description" content="A modern 3D game template built with Three.js, React, and TypeScript" />
      </Helmet>

      <div className="w-full h-screen overflow-hidden relative bg-black">
        {!isGameLoaded ? (
          <LoadingScreen />
        ) : (
          <>
            {/* Game Canvas - Always rendered but may be hidden */}
            <Suspense fallback={<LoadingScreen />}>
              <GameCanvas 
                isActive={gameState === 'playing'} 
                isPaused={gameState === 'paused'}
              />
            </Suspense>

            {/* Game UI Overlay */}
            <GameUI
              gameState={gameState}
              onStartGame={handleStartGame}
              onPauseGame={handlePauseGame}
              onResumeGame={handleResumeGame}
              onBackToMenu={handleBackToMenu}
            />
          </>
        )}

        {/* Toast notifications */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </div>
    </>
  )
}

export default App
