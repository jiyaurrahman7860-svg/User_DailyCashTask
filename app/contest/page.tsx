'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { Trophy, Crown, Target, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { withPageVisibility } from '@/components/withPageVisibility'

interface Contestant {
  id: string
  name: string
  weeklyEarnings: number
  rank: number
}

interface Contest {
  id: string
  title: string
  description: string
  prizePool: number
  startDate: Timestamp
  endDate: Timestamp
  status: 'active' | 'completed' | 'upcoming'
  participants: number
  prizes: {
    rank1: number
    rank2: number
    rank3: number
    rank4: number
    rank5: number
    rank6to10: number
  }
}

function ContestPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [daysLeft, setDaysLeft] = useState(7)
  const [contest, setContest] = useState<Contest | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const contestQuery = query(
        collection(db, 'weeklyContests'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(1)
      )

      const unsubscribeContest = onSnapshot(contestQuery, (snapshot) => {
        if (!snapshot.empty) {
          const contestData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Contest
          setContest(contestData)

          // Calculate days left
          const endDate = contestData.endDate.toDate()
          const now = new Date()
          const diff = endDate.getTime() - now.getTime()
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
          setDaysLeft(days > 0 ? days : 0)
        }
      })

      const q = query(
        collection(db, 'users'),
        orderBy('weeklyEarnings', 'desc'),
        limit(20)
      )

      const unsubscribeContestants = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data()
        })) as Contestant[]
        setContestants(list)

        const userIndex = list.findIndex(c => c.id === currentUser.uid)
        setUserRank(userIndex !== -1 ? userIndex + 1 : null)
        setLoading(false)
      })

      return () => {
        unsubscribeContest()
        unsubscribeContestants()
      }
    })

    return () => unsubscribe()
  }, [router])

  const getPrize = (rank: number): number => {
    if (!contest) return 0
    if (rank === 1) return contest.prizes.rank1
    if (rank === 2) return contest.prizes.rank2
    if (rank === 3) return contest.prizes.rank3
    if (rank === 4) return contest.prizes.rank4
    if (rank === 5) return contest.prizes.rank5
    if (rank >= 6 && rank <= 10) return contest.prizes.rank6to10
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show message if no active contest
  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] pb-20 md:pb-0 transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-3 md:p-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 mb-6"
              >
                <MobileMenu />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Contest</h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white">
                  <CardContent className="p-8 md:p-12">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Trophy className="w-10 h-10 text-white" />
                      </motion.div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">No Active Contest</h2>
                      <p className="text-white/80 mb-6">
                        There is no weekly contest running currently. Check back soon!
                      </p>
                      <Button
                        onClick={() => router.push('/dashboard')}
                        className="bg-white text-gray-600 hover:bg-white/90"
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 mb-6"
            >
              <MobileMenu />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Contest</h1>
            </motion.div>

            {/* Contest Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white mb-8">
                <CardContent className="p-6 md:p-8">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Trophy className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      {contest?.title || 'Weekly Earning Contest'}
                    </h2>
                    <p className="text-white/80 mb-4">
                      {contest?.description || 'Top 10 winners share a prize pool!'}
                    </p>
                    <div className="flex justify-center gap-8">
                      <div>
                        <p className="text-2xl md:text-3xl font-bold">
                          ₹{(contest?.prizePool || 5000).toLocaleString()}
                        </p>
                        <p className="text-sm text-white/70">Prize Pool</p>
                      </div>
                      <div>
                        <p className="text-2xl md:text-3xl font-bold">{daysLeft}</p>
                        <p className="text-sm text-white/70">Days Left</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Rank Card */}
            {userRank && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="mb-6 bg-primary/5 border-primary/20 dark:bg-blue-900/10 dark:border-blue-800/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Crown className="w-8 h-8 text-primary mr-3" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Your Current Rank</p>
                          <p className="text-2xl font-bold text-primary">#{userRank}</p>
                        </div>
                      </div>
                      {userRank <= 10 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Potential Prize</p>
                          <p className="text-2xl font-bold text-green-600">₹{getPrize(userRank)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Top Earners */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    <Target className="w-5 h-5 mr-2" />
                    Top Earners This Week
                  </h3>
                  <div className="space-y-3">
                    {contestants.slice(0, 10).map((contestant, index) => (
                      <motion.div
                        key={contestant.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          contestant.id === user?.uid 
                            ? 'bg-primary/10 border border-primary/20 dark:bg-blue-900/20 dark:border-blue-800' 
                            : 'bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            contestant.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                            contestant.rank === 2 ? 'bg-gray-200 dark:bg-gray-700' :
                            contestant.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/50' :
                            'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <span className={`font-bold text-sm ${
                              contestant.rank === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                              contestant.rank === 2 ? 'text-gray-600 dark:text-gray-400' :
                              contestant.rank === 3 ? 'text-orange-600 dark:text-orange-400' :
                              'text-gray-500 dark:text-gray-400'
                            }`}>
                              {contestant.rank}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {contestant.name}
                              {contestant.id === user?.uid && (
                                <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">You</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            ₹{(contestant.weeklyEarnings || 0).toLocaleString()}
                          </p>
                          {contestant.rank <= 10 && (
                            <p className="text-sm text-green-600 font-medium">+₹{getPrize(contestant.rank)}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Prize Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-6"
            >
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Prize Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { rank: 1, prize: contest?.prizes.rank1 || 1000 },
                      { rank: 2, prize: contest?.prizes.rank2 || 500 },
                      { rank: 3, prize: contest?.prizes.rank3 || 300 },
                      { rank: 4, prize: contest?.prizes.rank4 || 200 },
                      { rank: 5, prize: contest?.prizes.rank5 || 100 },
                    ].map((item) => (
                      <div key={item.rank} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="font-bold text-primary">#{item.rank}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{item.prize}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Ranks 6-10 receive ₹{contest?.prizes.rank6to10 || 50} each
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

// Wrap with page visibility check - redirects to dashboard if contest page is disabled
export default withPageVisibility(ContestPage, 'contest');
