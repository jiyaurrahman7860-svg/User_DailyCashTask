'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { auth, db, testFirestoreConnection, getMissingEnvVars } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { MobileMenu } from '@/components/mobile-menu'
import { Wallet, CheckCircle, Users, ArrowUpRight, Plus, Gift, Trophy, LogOut, ExternalLink, TrendingUp, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRegisterScrollRefresh } from '@/contexts/ScrollRefreshContext'
import { formatActivityTimestamp } from '@/lib/utils/formatTime'
import { fetchUserDataWithRetry } from '@/lib/firebase/googleAuth'

interface DashboardUserData {
  userId: string
  name: string
  email: string
  walletBalance: number
  referralCode: string
  level: number
  tasksCompleted: number
  totalEarned: number
  isBanned?: boolean
  banReason?: string
  bannedAt?: any
  holdingBalance?: number
  walletFrozenAt?: any
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
}

interface Task {
  id: string
  title: string
  description: string
  reward: number
  type: string
  status: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<DashboardUserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [animatedBalance, setAnimatedBalance] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([])
  const userRef = useRef<any>(null)
  const unsubscribeTransactionsRef = useRef<(() => void) | null>(null)

  // Animate balance counting
  useEffect(() => {
    if (userData?.walletBalance !== undefined) {
      const target = userData.walletBalance
      const duration = 1500
      const startTime = Date.now()
      const startValue = animatedBalance

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const current = startValue + (target - startValue) * easeOut
        setAnimatedBalance(current)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [userData?.walletBalance])

  useEffect(() => {
    // Check for missing env vars on mount
    const missing = getMissingEnvVars()
    if (missing.length > 0) {
      console.error('[Dashboard] Missing environment variables:', missing)
      setMissingEnvVars(missing)
      toast.error(`Firebase config missing: ${missing.join(', ')}`)
    }

    // Test Firestore connection
    const testConnection = async () => {
      const isConnected = await testFirestoreConnection()
      setConnectionStatus(isConnected ? 'connected' : 'error')
      if (!isConnected) {
        toast.error('Database connection failed. Please check your internet.')
      }
    }
    testConnection()

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        console.log('[Dashboard] No auth state, redirecting to login...')
        router.push('/login')
        return
      }
      
      console.log('[Dashboard] Auth state detected for user:', currentUser.uid)
      setUser(currentUser)
      userRef.current = currentUser

      const userDataResult = await fetchUserDataWithRetry(currentUser.uid)
        
        // Handle network errors - DON'T logout, just show warning
        if (userDataResult.isNetworkError) {
          console.error('[Dashboard] Network error fetching user data:', userDataResult.error)
          toast.error('Network connection issue. Some data may not load. Retrying...')
          // Stay logged in - don't redirect
          setLoading(false)
          setConnectionStatus('error')
          return
        }
        
        // Handle document not found - user needs to complete signup
        if (!userDataResult.exists || !userDataResult.data) {
          console.error('[Dashboard] User document not found, redirecting to signup...')
          toast.error('Please complete your registration.')
          router.push('/signup')
          return
        }
        
        console.log('[Dashboard] User document found successfully')
        setConnectionStatus('connected')
        const userData = userDataResult.data as DashboardUserData
        
        // Check if user is banned
        if (userData.isBanned) {
          console.log('[Dashboard] User is banned, redirecting to banned page...')
          router.push('/banned')
          return
        }
        
        setUserData(userData)

      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      )

      const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
        const txs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[]
        setTransactions(txs)
        setLoading(false)
      }, (error) => {
        console.error('Transaction query error:', error)
        setLoading(false)
      })

      // Store the unsubscribe function for cleanup during refresh
      unsubscribeTransactionsRef.current = unsubscribeTransactions

      // Fetch available tasks for quick preview
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('status', '==', 'active'),
          orderBy('reward', 'desc'),
          limit(3)
        )
        const tasksSnapshot = await getDocs(tasksQuery)
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[]
        setTasks(tasksData)
      } catch (error) {
        console.error('Error loading tasks:', error)
      }

      return () => unsubscribeTransactions()
    })

    return () => {
      unsubscribe()
      // Clean up transaction listener on unmount
      if (unsubscribeTransactionsRef.current) {
        unsubscribeTransactionsRef.current()
      }
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleWithdraw = useCallback(() => {
    router.push('/withdraw')
  }, [router])

  const handleTasks = useCallback(() => {
    router.push('/tasks')
  }, [router])

  /**
   * Refresh callback for scroll-to-refresh functionality
   * Re-fetches user data and tasks when user scrolls to bottom
   */
  const refreshData = useCallback(async () => {
    const currentUser = userRef.current
    if (!currentUser?.uid) {
      console.log('[ScrollRefresh] No user logged in, skipping refresh')
      return
    }
    
    console.log('[ScrollRefresh] Refreshing dashboard data...')
    
    // Refresh user data with retry
    try {
      const userDataResult = await fetchUserDataWithRetry(currentUser.uid)
      if (userDataResult.exists && userDataResult.data) {
        setUserData(userDataResult.data as DashboardUserData)
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
    
    // Refresh tasks
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'active'),
        orderBy('reward', 'desc'),
        limit(3)
      )
      const tasksSnapshot = await getDocs(tasksQuery)
      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
      setTasks(tasksData)
    } catch (error) {
      console.error('Error refreshing tasks:', error)
    }
    
    toast.success('Dashboard refreshed')
    console.log('[ScrollRefresh] Dashboard refreshed successfully')
  }, [])

  // Register refresh callback with scroll-to-refresh context
  useRegisterScrollRefresh(refreshData, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] pb-20 md:pb-0 transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-3 md:p-6">
            <div className="max-w-6xl mx-auto">
              <DashboardSkeleton />
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
            {/* Environment Variable Error Banner */}
            {missingEnvVars.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Configuration Error</p>
                    <p className="text-sm">Missing environment variables: {missingEnvVars.join(', ')}</p>
                    <p className="text-xs mt-1">Please check Vercel environment settings.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Connection Status Banner */}
            {connectionStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg"
              >
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Connection Issue</p>
                    <p className="text-sm">Unable to connect to database. Please check your internet connection.</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-8 gap-3"
            >
              <div className="flex items-center gap-3">
                <MobileMenu userName={userData?.name} />
                <div>
                  <h1 className="text-2xl font-bold text-black dark:text-white">Dashboard</h1>
                  <p className="text-gray-500 dark:text-gray-400">Welcome back, {userData?.name}</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" onClick={handleLogout} className="dark:border-gray-700 dark:text-gray-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-primary text-white mb-8 shadow-lg shadow-primary/20">
                <CardContent className="p-4 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-blue-100 mb-1 text-sm md:text-base">Available Balance</p>
                      <h2 className="text-3xl md:text-4xl font-bold">₹{animatedBalance.toFixed(2)}</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="outline"
                          className="bg-white text-primary border-white hover:bg-gray-100 w-full sm:w-auto font-semibold"
                          onClick={handleWithdraw}
                        >
                          Withdraw
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          className="bg-white/20 text-white border-white hover:bg-white/30 w-full sm:w-auto backdrop-blur-sm"
                          onClick={handleTasks}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Complete Tasks
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {[{
                icon: Wallet,
                bg: 'bg-green-100 dark:bg-green-900/30',
                iconColor: 'text-green-600 dark:text-green-400',
                label: 'Total Earned',
                value: `₹${userData?.totalEarned || 0}`
              }, {
                icon: CheckCircle,
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                iconColor: 'text-blue-600 dark:text-blue-400',
                label: 'Tasks Completed',
                value: userData?.tasksCompleted || 0
              }, {
                icon: Users,
                bg: 'bg-purple-100 dark:bg-purple-900/30',
                iconColor: 'text-purple-600 dark:text-purple-400',
                label: 'Referral Code',
                value: userData?.referralCode || 'N/A'
              }].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card className="dark:bg-[#1E293B] dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mr-4 transition-colors`}>
                          <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                          <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Task Preview - Mobile UX Improvement */}
            {tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    🔥 High Reward Tasks
                  </h3>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/tasks')}
                      className="text-primary"
                    >
                      View All
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary dark:bg-[#1E293B] dark:border-gray-700 dark:hover:border-primary"
                        onClick={() => router.push('/tasks')}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm line-clamp-1 text-black dark:text-white">{task.title}</h4>
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">
                              ₹{task.reward}
                            </span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-3">
                            {task.description}
                          </p>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                            <Button size="sm" className="w-full text-xs bg-primary hover:bg-primary/90">
                              Start Task
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <Card className="dark:bg-[#1E293B] dark:border-gray-700 transition-colors duration-300">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Recent Activity</h3>
                    {transactions.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transactions yet</p>
                    ) : (
                      <div className="space-y-4">
                        {transactions.map((tx, index) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                            className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                          >
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                              }`}>
                                {tx.amount > 0 ? (
                                  <ArrowUpRight className={`w-5 h-5 ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                                ) : (
                                  <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400 rotate-180" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-black dark:text-white">{tx.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatActivityTimestamp(tx.createdAt)}</p>
                              </div>
                            </div>
                            <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {tx.amount > 0 ? '+' : ''}₹{tx.amount}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 dark:bg-[#1E293B] dark:border-gray-700"
                    onClick={() => router.push('/rewards')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-4">
                          <Gift className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-black dark:text-white">Daily Bonus</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Claim your reward</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 dark:bg-[#1E293B] dark:border-gray-700"
                    onClick={() => router.push('/leaderboard')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4">
                          <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-black dark:text-white">Leaderboard</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Top earners</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
