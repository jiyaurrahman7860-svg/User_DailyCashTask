'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { Trophy, Medal, Award, Users, TrendingUp, Crown, Target, Sparkles, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface Friend {
  id: string
  name: string
  userId: string
  totalEarned: number
  walletBalance: number
  tasksCompleted: number
  referralCount: number
  rank: number
  joinedAt: any
  reward: number
}

interface MyStats {
  totalEarned: number
  referralCount: number
  rank: number
  friendsCount: number
}

export default function FriendLeaderboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [myStats, setMyStats] = useState<MyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      try {
        const getFriendLeaderboard = httpsCallable(functions, 'getFriendLeaderboard')
        const result = await getFriendLeaderboard()
        const data = result.data as { success: boolean; friends: Friend[]; myStats: MyStats }
        
        if (data.success) {
          setFriends(data.friends)
          setMyStats(data.myStats)
        }
      } catch (error) {
        console.error('Error fetching friend leaderboard:', error)
        toast.error('Failed to load friend leaderboard')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const getRankIcon = (rank: number, isMe: boolean = false) => {
    if (isMe) {
      return (
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">ME</span>
        </div>
      )
    }
    
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-500">{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 2:
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 3:
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] pb-20 md:pb-0">
        <Navbar />
        <div className="flex">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
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
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <MobileMenu />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Friend Leaderboard
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Compete with your referrals and see who is earning the most!
                  </p>
                </div>
              </div>
            </div>

            {/* My Stats Card */}
            {myStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 overflow-hidden">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Your Rank Among Friends</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl md:text-5xl font-bold">#{myStats.rank}</span>
                          <span className="text-blue-100">of {myStats.friendsCount + 1}</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                      <div className="text-center">
                        <p className="text-2xl font-bold">₹{myStats.totalEarned}</p>
                        <p className="text-blue-100 text-xs">Total Earned</p>
                      </div>
                      <div className="text-center border-x border-white/20">
                        <p className="text-2xl font-bold">{myStats.friendsCount}</p>
                        <p className="text-blue-100 text-xs">Friends</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{myStats.referralCount}</p>
                        <p className="text-blue-100 text-xs">Your Referrals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Friends List */}
            <Card className="border-0 shadow-sm dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Friend Rankings
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    By Total Earnings
                  </span>
                </div>

                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Friends Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-sm mx-auto">
                      Invite friends using your referral code and see them compete here!
                    </p>
                    <Button 
                      onClick={() => router.push('/referral')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Invite Friends
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {friends.map((friend, index) => (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                            friend.rank <= 3 
                              ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-100 dark:border-yellow-900/30' 
                              : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center">
                              {getRankIcon(friend.rank)}
                            </div>
                            
                            <div className="relative">
                              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-primary font-semibold text-lg">
                                  {friend.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {friend.rank === 1 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <Sparkles className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {friend.name}
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getRankBadge(friend.rank)}`}>
                                  #{friend.rank}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {friend.userId} • {friend.tasksCompleted} tasks
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                              ₹{friend.totalEarned}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {friend.referralCount} referrals
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add My Position at bottom if not in top friends */}
                    {myStats && myStats.rank > friends.length && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 mt-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center">
                            {getRankIcon(myStats.rank, true)}
                          </div>
                          
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">Y</span>
                          </div>
                          
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              You
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                #{myStats.rank}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Your position among friends
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">
                            ₹{myStats.totalEarned}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Keep earning!
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Challenge Card */}
            {friends.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Challenge Your Friends!</h3>
                          <p className="text-white/80 text-sm">
                            {friends[0]?.name} is leading with ₹{friends[0]?.totalEarned}. Can you beat them?
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="bg-white text-purple-600 hover:bg-white/90 border-0 shrink-0"
                        onClick={() => router.push('/tasks')}
                      >
                        Start Earning
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
