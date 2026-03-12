'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/firebaseConfig'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { ReferralSkeleton } from '@/components/ui/skeleton'
import { 
  Users, Copy, Gift, TrendingUp, Share2, Wallet, Crown, 
  ChevronRight, UserPlus, ChevronLeft, ArrowUpRight, Calendar, IndianRupee, Trophy
} from 'lucide-react'
import { getMyReferrals } from '@/lib/firebase/functions'
import toast from 'react-hot-toast'

interface Referral {
  id: string
  referredName: string
  reward: number
  status: string
  createdAt: string
}

export default function ReferralPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data())
      }

      const q = query(collection(db, 'referrals'), where('referrerId', '==', currentUser.uid))
      const unsubscribeReferrals = onSnapshot(q, (snapshot) => {
        const refList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Referral[]
        setReferrals(refList)
        setLoading(false)
      })

      return () => unsubscribeReferrals()
    })

    return () => unsubscribe()
  }, [router])

  const copyReferralCode = () => {
    if (userData?.referralCode) {
      navigator.clipboard.writeText(userData.referralCode)
      setCopied(true)
      toast.success('Referral code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${userData?.referralCode}`
    if (navigator.share) {
      navigator.share({
        title: 'Join DailyTaskPay',
        text: `Use my referral code ${userData?.referralCode} to join DailyTaskPay and earn ₹20 bonus!`,
        url: link,
      })
      toast.success('Sharing...')
    } else {
      navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const totalEarned = referrals.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.reward, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] pb-20 md:pb-0 transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 p-3 md:p-6 w-full">
            <div className="max-w-5xl mx-auto">
              <ReferralSkeleton />
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
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-3 md:p-6 w-full">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <MobileMenu />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Refer & Earn</h1>
            </div>

            {/* Hero Card - Modern Design */}
            <Card className="bg-primary text-white mb-6 border-0 overflow-hidden">
              <CardContent className="p-5 md:p-8">
                <div className="text-center">
                  {/* Gift Icon */}
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold mb-2">Invite Friends & Earn ₹20 Each!</h2>
                  <p className="text-blue-100 text-sm md:text-base mb-6">
                    Share your referral code with friends and earn ₹20 for each successful referral
                  </p>

                  {/* Referral Code Box */}
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                    <p className="text-xs text-blue-100 mb-2 uppercase tracking-wide">Your Referral Code</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl md:text-3xl font-bold tracking-wider">{userData?.referralCode}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/20 border-white/50 text-white hover:bg-white/30 h-10"
                        onClick={copyReferralCode}
                      >
                        {copied ? (
                          <><span className="text-xs">Copied!</span></>
                        ) : (
                          <><Copy className="w-4 h-4" /><span className="hidden sm:inline text-xs ml-1">Copy</span></>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Share Button */}
                  <Button
                    className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 font-semibold"
                    onClick={shareReferralLink}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Referral Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
              <Card className="border-0 shadow-sm dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Referrals</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{referrals.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Earnings</p>
                      <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">₹{totalEarned}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm dark:bg-[#1E293B] dark:border-gray-700 col-span-2 md:col-span-1">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{userData?.level || 1}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Referrals */}
            {referrals.length > 0 && (
              <Card className="border-0 shadow-sm mb-6 dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                      <UserPlus className="w-5 h-5 text-primary" />
                      Recent Referrals
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {referrals.slice(0, 5).map((ref) => (
                      <div key={ref.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">{ref.referredName?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{ref.referredName || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ref.status === 'approved' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : ref.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          }`}>
                            {ref.status === 'approved' ? 'Completed' : ref.status === 'pending' ? 'Pending' : 'New'}
                          </span>
                          {ref.status === 'approved' && (
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">+₹{ref.reward}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Friend Leaderboard Link */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      className="w-full justify-between border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => router.push('/friend-leaderboard')}
                    >
                      <span className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        View Friend Leaderboard
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      See who is earning the most among your referrals!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Level System - Collapsible Cards */}
            <Card className="border-0 shadow-sm dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Level System
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">Starter</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">5% commission on referral earnings</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">0-9 ref</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      5
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">Pro</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">7% commission on referral earnings</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">10-49 ref</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-10 h-10 bg-purple-400 dark:bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      10
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">Elite</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">10% commission on referral earnings</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">50+ ref</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
