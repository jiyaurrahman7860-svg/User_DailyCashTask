'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { auth, functions, db } from '@/lib/firebase/firebaseConfig'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { 
  Play, 
  DollarSign, 
  Clock, 
  Eye, 
  History,
  Tv,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface RewardAd {
  id: string
  title: string
  rewardAmount: number
  duration: number
  adScript: string
  dailyUserLimit: number
  globalLimit: number
  totalViews: number
  status: 'active' | 'disabled'
  userDailyViews: number
  canWatch: boolean
  createdDate: string
}

interface AdRewardHistory {
  id: string
  adId: string
  adTitle: string
  rewardAmount: number
  status: string
  createdDate: string
}

export default function RewardAdsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<RewardAd[]>([])
  const [history, setHistory] = useState<AdRewardHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAd, setActiveAd] = useState<RewardAd | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isWatching, setIsWatching] = useState(false)
  const [watchCompleted, setWatchCompleted] = useState(false)
  const [processingReward, setProcessingReward] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Device fingerprint utility
  const getDeviceFingerprint = useCallback(() => {
    const nav = navigator
    const screen = window.screen
    return `${nav.userAgent}-${screen.width}x${screen.height}-${nav.language}`
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      fetchAds()
      fetchHistory(currentUser.uid)
    })

    return () => unsubscribe()
  }, [router])

  // Prevent page refresh during ad watch
  useEffect(() => {
    if (isWatching) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = 'Ad is playing. Are you sure you want to leave?'
        return 'Ad is playing. Are you sure you want to leave?'
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isWatching])

  // Timer countdown
  useEffect(() => {
    if (isWatching && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setWatchCompleted(true)
            setIsWatching(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isWatching, timeLeft])

  const fetchAds = async () => {
    try {
      const getActiveRewardAds = httpsCallable(functions, 'getActiveRewardAds')
      const result = await getActiveRewardAds()
      const data = result.data as { success: boolean; ads: RewardAd[] }
      if (data.success) {
        setAds(data.ads)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = (userId: string) => {
    const q = query(
      collection(db, 'ad_reward_history'),
      where('userId', '==', userId),
      orderBy('createdDate', 'desc')
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const historyData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data()
          const adDocRef = doc(db, 'reward_ads', data.adId)
          const adDocSnap = await getDoc(adDocRef)
          const adData = adDocSnap.exists() ? adDocSnap.data() : null

          return {
            id: docSnapshot.id,
            adId: data.adId,
            adTitle: adData?.title || 'Unknown Ad',
            rewardAmount: data.rewardAmount,
            status: data.status,
            createdDate: data.createdDate?.toDate?.() 
              ? data.createdDate.toDate().toISOString() 
              : new Date().toISOString()
          }
        })
      )
      setHistory(historyData)
    })

    return () => unsubscribe()
  }

  const startWatching = (ad: RewardAd) => {
    if (!ad.canWatch) {
      setError('Daily limit reached for this ad')
      return
    }

    setActiveAd(ad)
    setTimeLeft(ad.duration)
    setIsWatching(true)
    setWatchCompleted(false)
    setError(null)
  }

  const closeAd = () => {
    if (!watchCompleted && isWatching) {
      setError('Ad closed before completion. No reward given.')
    }
    setActiveAd(null)
    setIsWatching(false)
    setTimeLeft(0)
    setWatchCompleted(false)
  }

  const claimReward = async () => {
    if (!activeAd || !user || !watchCompleted) return

    setProcessingReward(true)
    setError(null)

    try {
      const processAdReward = httpsCallable(functions, 'processAdReward')
      const result = await processAdReward({
        adId: activeAd.id,
        watchDuration: activeAd.duration,
        ipAddress: '', // Will be handled server-side
        deviceFingerprint: getDeviceFingerprint()
      })

      const data = result.data as { success: boolean; message: string; rewardAmount: number }
      
      if (data.success) {
        alert(data.message)
        fetchAds()
        setActiveAd(null)
        setWatchCompleted(false)
      }
    } catch (error: any) {
      console.error('Error claiming reward:', error)
      setError(error.message || 'Failed to claim reward')
    } finally {
      setProcessingReward(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] pb-20 md:pb-0">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <p className="text-center py-12">Loading...</p>
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] pb-20 md:pb-0 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-3 md:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MobileMenu />
              <div className="flex items-center gap-3">
                <Tv className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-black dark:text-white">Reward Ads</h1>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Active Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {ads.map((ad) => (
                <Card 
                  key={ad.id} 
                  className={`dark:bg-[#1E293B] dark:border-gray-700 transition-all duration-300 ${
                    !ad.canWatch ? 'opacity-60' : 'hover:shadow-lg'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-black dark:text-white">
                      {ad.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Reward</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">₹{ad.rewardAmount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">{ad.duration}s</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span>{ad.userDailyViews}/{ad.dailyUserLimit} today</span>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {ad.totalViews} total views
                      </div>
                    </div>

                    <Button
                      onClick={() => startWatching(ad)}
                      disabled={!ad.canWatch || isWatching}
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {ad.canWatch ? 'Watch Ad' : 'Limit Reached'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {ads.length === 0 && (
              <div className="text-center py-12">
                <Tv className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No active reward ads available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Check back later for new earning opportunities!
                </p>
              </div>
            )}

            {/* Reward History */}
            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-semibold text-black dark:text-white">
                    Ad Reward History
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No ad rewards yet. Watch ads to earn!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Tv className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-black dark:text-white">{item.adTitle}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(item.createdDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            +₹{item.rewardAmount}
                          </p>
                          <p className={`text-xs ${
                            item.status === 'completed' 
                              ? 'text-green-500' 
                              : 'text-yellow-500'
                          }`}>
                            {item.status === 'completed' ? 'Completed' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileBottomNav />

      {/* Ad Watch Modal */}
      {activeAd && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl max-w-2xl w-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tv className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-black dark:text-white">{activeAd.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reward: ₹{activeAd.rewardAmount}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAd}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Ad Container */}
            <div className="relative">
              {/* Timer Overlay */}
              {isWatching && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-full font-mono text-lg">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}

              {/* Ad Script Container */}
              <div 
                id="ad-container"
                className="w-full h-[300px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: activeAd.adScript }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700">
              {isWatching ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Watching ad... Please wait {formatTime(timeLeft)}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${((activeAd.duration - timeLeft) / activeAd.duration) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ) : watchCompleted ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg font-semibold text-black dark:text-white mb-2">
                    Ad Completed!
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Claim your ₹{activeAd.rewardAmount} reward now
                  </p>
                  <Button
                    onClick={claimReward}
                    disabled={processingReward}
                    className="w-full"
                  >
                    {processingReward ? 'Processing...' : `Claim ₹${activeAd.rewardAmount}`}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Ad closed before completion</p>
                  <p className="text-sm">No reward will be given</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
