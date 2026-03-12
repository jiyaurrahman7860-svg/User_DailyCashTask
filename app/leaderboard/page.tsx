'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileMenu } from '@/components/mobile-menu'
import { Trophy, Medal, Award } from 'lucide-react'

interface LeaderboardUser {
  id: string
  name: string
  userId: string
  totalEarned: number
  tasksCompleted: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const q = query(
        collection(db, 'users'),
        orderBy('totalEarned', 'desc'),
        limit(50)
      )

      const unsubscribeLeaders = onSnapshot(q, (snapshot) => {
        const leadersList = snapshot.docs.map((doc, index) => {
          const data = doc.data()
          return {
            id: doc.id,
            rank: index + 1,
            name: data.name || 'Unknown',
            userId: data.userId || '',
            totalEarned: data.totalEarned || 0,
            tasksCompleted: data.tasksCompleted || 0
          } as LeaderboardUser
        })
        setLeaders(leadersList)
        setLoading(false)
      })

      return () => unsubscribeLeaders()
    })

    return () => unsubscribe()
  }, [router])

  const getRankIcon = (rank: number) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MobileMenu />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
            </div>

            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Earners</h3>
                {leaders.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {leaders.map((leader, index) => (
                      <div
                        key={leader.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          leader.id === user?.uid ? 'bg-primary/10 border border-primary/20 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex items-center justify-center mr-4">
                            {getRankIcon(index + 1)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {leader.name}
                              {leader.id === user?.uid && (
                                <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">You</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{leader.userId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900 dark:text-white">₹{leader.totalEarned || 0}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{leader.tasksCompleted || 0} tasks</p>
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
    </div>
  )
}
