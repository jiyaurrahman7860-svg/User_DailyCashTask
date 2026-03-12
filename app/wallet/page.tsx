'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/firebaseConfig'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { WalletSkeleton } from '@/components/ui/skeleton'
import { Wallet, ArrowUpRight, ArrowDownLeft, Gift, CheckCircle, Tv } from 'lucide-react'
import { withPageVisibility } from '@/components/withPageVisibility'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  status: string
  createdAt: any // Firestore Timestamp
  createdAtFormatted?: string
}

interface UserData {
  walletBalance: number
  totalEarned: number
  totalWithdrawn: number
  isBanned?: boolean
}

function WalletPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        
        // Check if user is banned
        if (userData.isBanned) {
          router.push('/banned')
          return
        }
        
        setUserData(userData)
      }

      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )

      const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
        const txs = snapshot.docs.map(doc => {
          const data = doc.data()
          // Handle Firestore Timestamp
          let createdAt = data.createdAt
          let createdAtFormatted = 'Invalid Date'
          
          if (createdAt) {
            // If it's a Firestore Timestamp
            if (createdAt.toDate && typeof createdAt.toDate === 'function') {
              createdAtFormatted = createdAt.toDate().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            } 
            // If it's already a Date object
            else if (createdAt instanceof Date) {
              createdAtFormatted = createdAt.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
            // If it's a string
            else if (typeof createdAt === 'string') {
              const date = new Date(createdAt)
              if (!isNaN(date.getTime())) {
                createdAtFormatted = date.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
            }
            // If it's seconds (Unix timestamp)
            else if (typeof createdAt === 'number') {
              const date = new Date(createdAt * 1000)
              createdAtFormatted = date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          }
          
          return {
            id: doc.id,
            ...data,
            createdAt,
            createdAtFormatted
          }
        }) as Transaction[]
        setTransactions(txs)
        setLoading(false)
      })

      return () => unsubscribeTransactions()
    })

    return () => unsubscribe()
  }, [router])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      case 'referral':
        return <ArrowUpRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      case 'bonus':
        return <Gift className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      case 'withdrawal':
        return <ArrowDownLeft className="w-5 h-5 text-red-600 dark:text-red-400" />
      case 'ad_reward':
        return <Tv className="w-5 h-5 text-pink-600 dark:text-pink-400" />
      default:
        return <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const [animatedBalance, setAnimatedBalance] = useState(0)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] pb-20 md:pb-0 transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <WalletSkeleton />
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
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 mb-6"
            >
              <MobileMenu />
              <h1 className="text-2xl font-bold text-black dark:text-white">My Wallet</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-primary text-white mb-8 shadow-lg shadow-primary/20">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 mb-1">Available Balance</p>
                      <h2 className="text-3xl md:text-4xl font-bold">₹{animatedBalance.toFixed(2)}</h2>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                    >
                      <Wallet className="w-8 h-8 text-white" />
                    </motion.div>
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
                label: 'Total Earned',
                value: `₹${userData?.totalEarned || 0}`,
                color: 'text-green-600 dark:text-green-400'
              }, {
                label: 'Total Withdrawn',
                value: `₹${userData?.totalWithdrawn || 0}`,
                color: 'text-red-600 dark:text-red-400'
              }, {
                label: 'Pending',
                value: `₹${transactions.filter(tx => tx.status === 'pending').reduce((sum, tx) => sum + tx.amount, 0)}`,
                color: 'text-yellow-600 dark:text-yellow-400'
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="dark:bg-[#1E293B] dark:border-gray-700 transition-colors duration-300">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Transaction History</h3>
                  {transactions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transactions yet</p>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((tx, index) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                          className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <p className="font-medium text-black dark:text-white">{tx.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{tx.createdAtFormatted}</p>
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
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Wrap with page visibility check - redirects to dashboard if wallet page is disabled
export default withPageVisibility(WalletPage, 'wallet');
