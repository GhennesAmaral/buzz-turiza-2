import { useState } from 'react'
import { Play, Pause, Square, Settings, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { motion, AnimatePresence } from 'framer-motion'

interface GameUIProps {
  gameState: 'menu' | 'playing' | 'paused'
  onStartGame: () => void
  onPauseGame: () => void
  onResumeGame: () => void
  onBackToMenu: () => void
}

export default function GameUI({
  gameState,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onBackToMenu
}: GameUIProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="game-ui-overlay">
      {/* Main Menu */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="text-center"
            >
              <h1 className="text-6xl font-bold text-white mb-4 animate-glow">
                Game Template
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                3D Interactive Experience
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={onStartGame}
                  size="lg"
                  className="game-button text-xl px-8 py-4 w-48"
                >
                  <Play className="mr-2 h-6 w-6" />
                  Start Game
                </Button>
                
                <Button
                  onClick={() => setShowSettings(true)}
                  size="lg"
                  variant="outline"
                  className="game-button text-xl px-8 py-4 w-48"
                >
                  <Settings className="mr-2 h-6 w-6" />
                  Settings
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Controls (Top Bar) */}
      <AnimatePresence>
        {(gameState === 'playing' || gameState === 'paused') && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 left-0 right-0 p-4 safe-area-inset-top"
          >
            <div className="flex justify-between items-center">
              {/* Left side - Game info */}
              <div className="game-panel">
                <div className="flex items-center space-x-4">
                  <div className="text-white">
                    <div className="text-sm text-gray-300">Score</div>
                    <div className="text-xl font-bold">1,234</div>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-white">
                    <div className="text-sm text-gray-300">Level</div>
                    <div className="text-xl font-bold">5</div>
                  </div>
                </div>
              </div>

              {/* Right side - Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={isMuted ? () => {} : toggleMute}
                  variant="outline"
                  size="icon"
                  className="game-button"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  size="icon"
                  className="game-button"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {gameState === 'playing' ? (
                  <Button
                    onClick={onPauseGame}
                    variant="outline"
                    className="game-button"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={onResumeGame}
                    className="game-button bg-green-600 hover:bg-green-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                )}

                <Button
                  onClick={onBackToMenu}
                  variant="outline"
                  className="game-button"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Menu
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Overlay */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="game-panel text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Game Paused</h2>
              <p className="text-gray-300 mb-6">Click Resume to continue</p>
              
              <div className="space-y-3">
                <Button
                  onClick={onResumeGame}
                  className="game-button bg-green-600 hover:bg-green-700 w-32"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
                
                <Button
                  onClick={onBackToMenu}
                  variant="outline"
                  className="game-button w-32"
                >
                  Main Menu
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="game-panel w-96 max-w-full">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Volume Control */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        Master Volume
                      </label>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={toggleMute}
                          variant="outline"
                          size="icon"
                          className="game-button"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1">
                          <Slider
                            value={volume}
                            onValueChange={setVolume}
                            max={100}
                            step={1}
                            disabled={isMuted}
                            className="w-full"
                          />
                        </div>
                        <span className="text-white text-sm w-8">
                          {isMuted ? '0' : volume[0]}
                        </span>
                      </div>
                    </div>

                    {/* Graphics Quality */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        Graphics Quality
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Low', 'Medium', 'High'].map((quality) => (
                          <Button
                            key={quality}
                            variant={quality === 'Medium' ? 'default' : 'outline'}
                            className="game-button text-sm"
                          >
                            {quality}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setShowSettings(false)}
                      className="game-button"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Instructions (Bottom) */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="absolute bottom-0 left-0 right-0 p-4 safe-area-inset-bottom"
          >
            <div className="game-panel text-center">
              <p className="text-gray-300 text-sm">
                🖱️ Click and drag to rotate camera • 🎯 Click objects to interact • ⚙️ Use settings for options
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
