'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Sparkles, X, RotateCcw, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScratchCardProps {
  id: string
  isUnlocked: boolean
  reward: number
  onScratchComplete: (reward: number) => void
  onClose: () => void
  theme?: 'gold' | 'silver' | 'bronze'
}

const themes = {
  gold: {
    gradient: 'from-yellow-400 via-yellow-500 to-amber-600',
    scratchColor: '#C9A227',
    textColor: 'text-yellow-600',
    bgPattern: 'radial-gradient(circle at 30% 30%, #FEF3C7 0%, #FDE68A 50%, #F59E0B 100%)',
  },
  silver: {
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    scratchColor: '#9CA3AF',
    textColor: 'text-gray-600',
    bgPattern: 'radial-gradient(circle at 30% 30%, #F3F4F6 0%, #E5E7EB 50%, #9CA3AF 100%)',
  },
  bronze: {
    gradient: 'from-orange-400 via-orange-500 to-amber-700',
    scratchColor: '#B45309',
    textColor: 'text-orange-600',
    bgPattern: 'radial-gradient(circle at 30% 30%, #FED7AA 0%, #FDBA74 50%, #EA580C 100%)',
  },
}

export function ScratchCard({ 
  id, 
  isUnlocked, 
  reward, 
  onScratchComplete, 
  onClose,
  theme = 'gold' 
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScratched, setIsScratched] = useState(false)
  const [scratchPercent, setScratchPercent] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [isScratching, setIsScratching] = useState(false)
  const currentTheme = themes[theme]

  useEffect(() => {
    if (!canvasRef.current || !isUnlocked) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 280
    canvas.height = 160

    // Fill with scratch layer
    ctx.fillStyle = currentTheme.scratchColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 10, 10)
        }
      }
    }

    // Add text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 5)
    ctx.font = '14px sans-serif'
    ctx.fillText('To Win Reward', canvas.width / 2, canvas.height / 2 + 15)
  }, [isUnlocked, currentTheme.scratchColor])

  const calculateScratchPercent = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparentPixels = 0
    const totalPixels = pixels.length / 4

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparentPixels++
      }
    }

    return (transparentPixels / totalPixels) * 100
  }, [])

  const scratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || isScratched || !isUnlocked) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 25, 0, Math.PI * 2)
    ctx.fill()

    const percent = calculateScratchPercent(canvas)
    setScratchPercent(percent)

    if (percent > 45 && !isScratched) {
      setIsScratched(true)
      setShowReward(true)
      onScratchComplete(reward)
    }
  }, [isScratched, isUnlocked, reward, onScratchComplete, calculateScratchPercent])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isUnlocked) return
    setIsScratching(true)
    scratch(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching || !isUnlocked) return
    scratch(e)
  }

  const handleMouseUp = () => {
    setIsScratching(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isUnlocked) return
    e.preventDefault()
    setIsScratching(true)
    scratch(e)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isScratching || !isUnlocked) return
    e.preventDefault()
    scratch(e)
  }

  const handleTouchEnd = () => {
    setIsScratching(false)
  }

  if (!isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[280px] mx-auto"
      >
        <div className="aspect-[1.75/1] bg-gray-200 dark:bg-gray-700 rounded-xl flex flex-col items-center justify-center cursor-not-allowed relative overflow-hidden">
          <Lock className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Complete tasks to unlock</p>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-300/50 to-gray-400/30" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative w-full max-w-[280px] mx-auto"
    >
      {/* Reward Display */}
      <div
        ref={containerRef}
        className={`relative aspect-[1.75/1] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br ${currentTheme.gradient}`}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0"
          style={{ background: currentTheme.bgPattern }}
        />

        {/* Reward Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-2"
          >
            <Sparkles className={`w-8 h-8 ${currentTheme.textColor}`} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-wider mb-1">
              You Won
            </p>
            <p className={`text-3xl font-bold ${currentTheme.textColor}`}>
              ₹{reward}
            </p>
          </motion.div>
        </div>

        {/* Scratch Canvas */}
        {!showReward && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-pointer touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          />
        )}

        {/* Scratch Progress */}
        {!showReward && scratchPercent > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-white/30 rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-white h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((scratchPercent / 45) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/80 text-center mt-1">
              {Math.round((scratchPercent / 45) * 100)}% scratched
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Scratch Again / Continue Button */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Claim ₹{reward}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Compact card for grid display
interface ScratchCardGridProps {
  id: string
  isUnlocked: boolean
  isScratched: boolean
  reward?: number
  onClick: () => void
  theme?: 'gold' | 'silver' | 'bronze'
}

export function ScratchCardGrid({
  id,
  isUnlocked,
  isScratched,
  reward,
  onClick,
  theme = 'gold'
}: ScratchCardGridProps) {
  const currentTheme = themes[theme]

  return (
    <motion.div
      whileHover={isUnlocked && !isScratched ? { scale: 1.05 } : {}}
      whileTap={isUnlocked && !isScratched ? { scale: 0.95 } : {}}
      onClick={isUnlocked && !isScratched ? onClick : undefined}
      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${
        isUnlocked && !isScratched
          ? 'shadow-lg hover:shadow-xl'
          : 'cursor-not-allowed opacity-70'
      }`}
    >
      {/* Card Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient}`}>
        <div 
          className="absolute inset-0 opacity-50"
          style={{ background: currentTheme.bgPattern }}
        />
      </div>

      {/* Card Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-3">
        {!isUnlocked ? (
          <>
            <Lock className="w-8 h-8 text-white/60 mb-2" />
            <p className="text-xs text-white/70 text-center">Locked</p>
          </>
        ) : isScratched ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-xs text-white/80 mb-1">Won</p>
              <p className="text-xl font-bold text-white">₹{reward}</p>
            </motion.div>
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </>
        ) : (
          <>
            <Ticket className={`w-10 h-10 ${currentTheme.textColor} mb-2`} />
            <p className="text-xs text-white/90 text-center font-medium">Scratch to Win</p>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute bottom-2"
            >
              <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                <RotateCcw className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Theme Badge */}
      <div className="absolute top-2 left-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider text-white/90 bg-black/20 px-2 py-0.5 rounded-full`}>
          {theme}
        </span>
      </div>
    </motion.div>
  )
}
