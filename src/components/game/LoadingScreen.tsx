import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  progress?: number
  message?: string
}

export default function LoadingScreen({ 
  progress = 0, 
  message = "Loading game..." 
}: LoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
    }, 100)

    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center z-10 max-w-md mx-auto px-6">
        {/* Game Logo/Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 animate-pulse-glow">
            Game Template
          </h1>
          <p className="text-blue-200 text-lg">
            3D Interactive Experience
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out rounded-full relative"
              style={{ width: `${displayProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-300 mt-2">
            <span>{message}</span>
            <span>{Math.round(displayProgress)}%</span>
          </div>
        </div>

        {/* Loading Tips */}
        <div className="text-gray-400 text-sm animate-pulse-slow">
          <p>💡 Tip: Use WASD keys to move around</p>
        </div>
      </div>
    </div>
  )
}
