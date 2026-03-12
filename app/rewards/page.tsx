'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { claimDailyBonusStreak, getDailyBonusStreak, spinWheel as spinWheelFn, claimScratchCardReward } from '@/lib/firebase/functions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { ScratchCard, ScratchCardGrid } from '@/components/scratch-card'
import { Gift, RotateCw, Ticket, CheckCircle, Flame, Sparkles, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface StreakInfo {
  streak: number
  lastClaimDate: string | null
  totalEarned: number
  canClaim: boolean
  nextReward: number
  rewards: number[]
}

interface ScratchCardData {
  id: string
  isUnlocked: boolean
  isScratched: boolean
  reward: number
  theme: 'gold' | 'silver' | 'bronze'
  unlockRequirement: string
}

export default function RewardsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<number | null>(null)
  const [canSpin, setCanSpin] = useState(true)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [selectedCard, setSelectedCard] = useState<ScratchCardData | null>(null)
  const [showScratchModal, setShowScratchModal] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [scratchCards, setScratchCards] = useState<ScratchCardData[]>([])
  const [tasksCompleted, setTasksCompleted] = useState(0)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserData(data)
        setTasksCompleted(data.tasksCompleted || 0)
      }

      // Load streak info
      try {
        const streakResult = await getDailyBonusStreak() as { data: StreakInfo }
        setStreakInfo(streakResult.data)
      } catch (error) {
        console.error('Error loading streak info:', error)
      }

      // Check if user can spin today
      const today = new Date().toISOString().split('T')[0]
      const spinDoc = await getDoc(doc(db, 'spinHistory', `${currentUser.uid}_${today}`))
      setCanSpin(!spinDoc.exists())

      // Load scratch cards state
      loadScratchCards(currentUser.uid)

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Generate scratch cards based on tasks completed
  const loadScratchCards = async (userId: string) => {
    // Get user's scratched cards from Firestore
    const scratchedQuery = query(
      collection(db, 'scratchCards'),
      where('userId', '==', userId)
    )
    const scratchedSnapshot = await getDocs(scratchedQuery)
    const scratchedIds = scratchedSnapshot.docs.map(d => d.data().cardId)

    // Generate cards based on tasks completed
    const cards: ScratchCardData[] = [
      {
        id: 'card-1',
        isUnlocked: true,
        isScratched: scratchedIds.includes('card-1'),
        reward: [5, 10, 15, 20, 25][Math.floor(Math.random() * 5)],
        theme: 'bronze',
        unlockRequirement: 'Free'
      },
      {
        id: 'card-2',
        isUnlocked: tasksCompleted >= 5,
        isScratched: scratchedIds.includes('card-2'),
        reward: [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)],
        theme: 'silver',
        unlockRequirement: 'Complete 5 tasks'
      },
      {
        id: 'card-3',
        isUnlocked: tasksCompleted >= 10,
        isScratched: scratchedIds.includes('card-3'),
        reward: [20, 30, 40, 50, 100][Math.floor(Math.random() * 5)],
        theme: 'gold',
        unlockRequirement: 'Complete 10 tasks'
      }
    ]

    setScratchCards(cards)
  }

  const claimDailyBonus = async () => {
    if (!user || !streakInfo?.canClaim || claiming) return

    setClaiming(true)
    try {
      const result = await claimDailyBonusStreak() as { data: { success: boolean; amount: number; streak: number; message: string } }

      if (result.data.success) {
        // Refresh streak info
        const streakResult = await getDailyBonusStreak() as { data: StreakInfo }
        setStreakInfo(streakResult.data)
        toast.success(result.data.message)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim bonus')
    } finally {
      setClaiming(false)
    }
  }

  const spinWheel = async () => {
    if (!user || !canSpin || spinning) return

    setSpinning(true)

    try {
      const result = await spinWheelFn() as { data: { success: boolean; reward: number; label: string } }

      setSpinResult(result.data.reward)
      setSpinning(false)

      if (result.data.reward > 0) {
        toast.success(`Congratulations! You won ${result.data.label}!`)
      } else {
        toast('Better luck next time!')
      }

      setCanSpin(false)
    } catch (error: any) {
      setSpinning(false)
      toast.error(error.message || 'Failed to spin wheel')
    }
  }

  const handleScratchCardClick = (card: ScratchCardData) => {
    if (!card.isUnlocked || card.isScratched) return
    setSelectedCard(card)
    setShowScratchModal(true)
  }

  const handleScratchComplete = async (reward: number) => {
    if (!user || !selectedCard) return

    try {
      // Save to Firestore that user scratched this card
      const { setDoc, doc, serverTimestamp } = await import('firebase/firestore')
      await setDoc(doc(db, 'scratchCards', `${user.uid}_${selectedCard.id}`), {
        userId: user.uid,
        cardId: selectedCard.id,
        reward: reward,
        scratchedAt: serverTimestamp()
      })

      // Claim reward via Cloud Function
      const result = await claimScratchCardReward({
        cardId: selectedCard.id,
        reward: reward
      }) as { data: { success: boolean; message: string } }

      if (result.data.success) {
        toast.success(`₹${reward} added to your wallet!`)
      }

      // Update local state
      setScratchCards(prev => prev.map(card =>
        card.id === selectedCard.id ? { ...card, isScratched: true } : card
      ))
    } catch (error: any) {
      console.error('Error claiming scratch card:', error)
      toast.error(error.message || 'Failed to claim reward')
    }
  }

  const handleCloseScratchModal = () => {
    setShowScratchModal(false)
    setSelectedCard(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  const currentDay = streakInfo?.streak || 0
  const canClaimToday = streakInfo?.canClaim ?? false
  const nextReward = streakInfo?.nextReward || 1

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <MobileMenu />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards</h1>
            </motion.div>

            {/* Daily Bonus Streak Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white mb-6 border-0">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Flame className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Daily Bonus Streak</h3>
                    <p className="text-white/80 mb-4">
                      Claim daily to build your streak and earn more!
                    </p>

                    {/* Streak Display */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <motion.span 
                        key={currentDay}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold"
                      >
                        {currentDay}
                      </motion.span>
                      <span className="text-white/80">day streak</span>
                    </div>

                    {/* Streak Days */}
                    <div className="grid grid-cols-7 gap-2 mb-4 max-w-md mx-auto">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: day * 0.05 }}
                          className={`p-2 rounded-lg text-center ${
                            day < currentDay
                              ? 'bg-white/30'
                              : day === currentDay && !canClaimToday
                              ? 'bg-white/40 ring-2 ring-white'
                              : day === currentDay && canClaimToday
                              ? 'bg-white/20 ring-2 ring-yellow-300 animate-pulse'
                              : 'bg-white/10'
                          }`}
                        >
                          <div className="text-xs text-white/70">Day {day}</div>
                          <div className="font-bold text-sm">₹{streakInfo?.rewards?.[day - 1] || [1, 1.5, 2, 2, 2.5, 3, 3.5][day - 1]}</div>
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-white/90 mb-4">
                      Next reward: <span className="font-bold text-yellow-300">₹{nextReward}</span>
                    </p>

                    <Button
                      className="bg-white text-orange-600 hover:bg-gray-100"
                      onClick={claimDailyBonus}
                      disabled={!canClaimToday || claiming}
                    >
                      {claiming ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : canClaimToday ? (
                        <Gift className="w-4 h-4 mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {claiming ? 'Claiming...' : canClaimToday ? `Claim Day ${currentDay + 1} Bonus` : 'Claimed for Today'}
                    </Button>

                    {!canClaimToday && currentDay > 0 && (
                      <p className="text-sm text-white/70 mt-2">
                        Come back tomorrow to continue your streak!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Spin Wheel */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 h-full">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RotateCw className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Spin Wheel</h3>
                      <p className="text-white/80 mb-4">Spin to win rewards!</p>
                      <motion.p 
                        key={spinResult}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold mb-4"
                      >
                        {spinning ? '...' : spinResult !== null ? `₹${spinResult}` : '?'}
                      </motion.p>
                      <Button
                        className="bg-white text-purple-600 hover:bg-gray-100"
                        onClick={spinWheel}
                        disabled={!canSpin || spinning}
                      >
                        {spinning ? (
                          <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {spinning ? 'Spinning...' : canSpin ? 'Spin Now' : 'Already Spun Today'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Scratch Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="dark:bg-[#1E293B] dark:border-gray-700 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scratch Cards</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tasksCompleted < 10 ? `Complete ${10 - tasksCompleted} more tasks to unlock all cards` : 'All cards unlocked!'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ticket className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {scratchCards.filter(c => c.isUnlocked).length}/{scratchCards.length}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {scratchCards.map((card, index) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <ScratchCardGrid
                            id={card.id}
                            isUnlocked={card.isUnlocked}
                            isScratched={card.isScratched}
                            reward={card.reward}
                            onClick={() => handleScratchCardClick(card)}
                            theme={card.theme}
                          />
                          {card.isUnlocked && !card.isScratched && (
                            <p className="text-[10px] text-center text-gray-500 mt-1">
                              ₹{card.reward}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
      <MobileBottomNav />

      {/* Scratch Card Modal */}
      <AnimatePresence>
        {showScratchModal && selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseScratchModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <ScratchCard
                id={selectedCard.id}
                isUnlocked={selectedCard.isUnlocked}
                reward={selectedCard.reward}
                onScratchComplete={handleScratchComplete}
                onClose={handleCloseScratchModal}
                theme={selectedCard.theme}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
