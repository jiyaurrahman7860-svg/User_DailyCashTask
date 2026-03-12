import os

content = ''''use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/firebaseConfig'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Smartphone, 
  Code, 
  ExternalLink, 
  Play, 
  Clock, 
  Wallet,
  Loader2,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Offerwall {
  id: string
  name: string
  type: 'iframe' | 'sdk' | 'postback'
  iframeUrl?: string
  sdkKey?: string
  postbackUrl?: string
  status: 'active' | 'inactive'
  createdAt: Date
}

interface TaskHistory {
  id: string
  offerwall: string
  reward: number
  status: string
  timestamp: Date
}

const TYPE_ICONS = {
  iframe: Globe,
  sdk: Smartphone,
  postback: Code,
}

const TYPE_LABELS = {
  iframe: 'iFrame',
  sdk: 'SDK',
  postback: 'Postback',
}

export default function TasksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [offerwalls, setOfferwalls] = useState<Offerwall[]>([])
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [startingOfferwall, setStartingOfferwall] = useState<string | null>(null)
  const [selectedOfferwall, setSelectedOfferwall] = useState<Offerwall | null>(null)
  const [showIframe, setShowIframe] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const offerwallsQuery = query(
        collection(db, 'offerwalls'), 
        where('status', '==', 'active')
      )
      
      const unsubscribeOfferwalls = onSnapshot(offerwallsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Offerwall[]
        setOfferwalls(data)
        setLoading(false)
      })

      const historyQuery = query(
        collection(db, 'tasks_history'),
        where('userId', '==', currentUser.uid)
      )
      
      const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TaskHistory[]
        setTaskHistory(data)
      })

      return () => {
        unsubscribeOfferwalls()
        unsubscribeHistory()
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleStartOfferwall = async (offerwall: Offerwall) => {
    if (!user) return
    
    setStartingOfferwall(offerwall.id)
    
    try {
      if (offerwall.type === 'iframe') {
        const url = offerwall.iframeUrl?.replace('{userId}', user.uid)
        setSelectedOfferwall({ ...offerwall, iframeUrl: url })
        setShowIframe(true)
      } else if (offerwall.type === 'postback') {
        const url = `${offerwall.postbackUrl}?uid=${user.uid}&subid=${offerwall.id}`
        window.open(url, '_blank')
        toast.success('Opening offerwall...')
      } else if (offerwall.type === 'sdk') {
        toast.success('Loading SDK...')
        window.open(offerwall.sdkKey, '_blank')
      }
    } catch (error) {
      console.error('Error starting offerwall:', error)
      toast.error('Failed to start offerwall')
    } finally {
      setStartingOfferwall(null)
    }
  }

  const getCompletedCount = (offerwallId: string) => {
    return taskHistory.filter(t => t.offerwall === offerwallId && t.status === 'completed').length
  }

  const getTotalEarned = (offerwallId: string) => {
    return taskHistory
      .filter(t => t.offerwall === offerwallId && t.status === 'completed')
      .reduce((sum, t) => sum + (t.reward || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0 transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offerwall Tasks</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete tasks from our partners and earn rewards
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] px-4 py-2 rounded-xl shadow-sm dark:border dark:border-gray-700">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {offerwalls.length} offerwalls available
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            >
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {taskHistory.filter(t => t.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Earned</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{taskHistory
                          .filter(t => t.status === 'completed')
                          .reduce((sum, t) => sum + (t.reward || 0), 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Available Now</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {offerwalls.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {offerwalls.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">No offerwalls available</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Check back later for new earning opportunities
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {offerwalls.map((offerwall, index) => {
                  const TypeIcon = TYPE_ICONS[offerwall.type]
                  const completedCount = getCompletedCount(offerwall.id)
                  const totalEarned = getTotalEarned(offerwall.id)
                  const isStarting = startingOfferwall === offerwall.id

                  return (
                    <motion.div
                      key={offerwall.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    >
                      <Card className="h-full dark:bg-[#1E293B] dark:border-gray-700 hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mr-3">
                                <TypeIcon className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {offerwall.name}
                                </h3>
                                <Badge variant="secondary" className="text-xs mt-1 dark:bg-gray-700 dark:text-gray-300">
                                  {TYPE_LABELS[offerwall.type]}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{completedCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Earned:</span>
                              <span className="font-medium text-green-600">₹{totalEarned.toFixed(2)}</span>
                            </div>
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => handleStartOfferwall(offerwall)}
                            disabled={isStarting}
                          >
                            {isStarting ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                            ) : (
                              <><Play className="w-4 h-4 mr-2" /> Start Earning</>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {taskHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-8"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                  <CardContent className="p-0">
                    <div className="divide-y dark:divide-gray-700">
                      {taskHistory
                        .sort((a, b) => b.timestamp?.getTime() - a.timestamp?.getTime())
                        .slice(0, 5)
                        .map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                                <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {offerwalls.find(o => o.id === task.offerwall)?.name || 'Offerwall'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {task.timestamp?.toLocaleDateString?.() || 'Recently'}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-green-600">+₹{task.reward?.toFixed(2) || '0.00'}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {showIframe && selectedOfferwall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl h-[80vh] flex flex-col dark:bg-[#1E293B] dark:border-gray-700">
            <CardContent className="p-4 flex items-center justify-between border-b dark:border-gray-700">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-primary mr-2" />
                <span className="font-semibold text-gray-900 dark:text-white">{selectedOfferwall.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedOfferwall.iframeUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" /> Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIframe(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
            <div className="flex-1 p-0 overflow-hidden">
              {selectedOfferwall.iframeUrl ? (
                <iframe
                  src={selectedOfferwall.iframeUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  title={selectedOfferwall.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Failed to load offerwall</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <MobileBottomNav />
    </div>
  )
}
'''

with open('page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('File fixed successfully')
