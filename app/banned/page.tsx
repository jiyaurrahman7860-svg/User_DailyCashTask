'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Ban,
  Lock,
  Wallet,
  AlertTriangle,
  Mail,
  UserPlus,
  Clock,
  ShieldAlert,
  ArrowRight,
  History,
  Receipt,
  Users,
  Megaphone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock3,
  ArrowLeftRight,
  Gift,
  FileText,
  Send,
  AlertCircle,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface BanInfo {
  isBanned: boolean
  banReason?: string
  bannedAt?: any
  walletBalance?: number
  holdingBalance?: number
  walletFrozenAt?: any
  userId?: string
  name?: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  status: string
  createdAt: any
}

interface Withdrawal {
  id: string
  amount: number
  method: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: any
  rejectionReason?: string
}

interface Referral {
  id: string
  referredName: string
  referredEmail: string
  reward: number
  status: string
  createdAt: any
}

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  createdAt: any
}

interface SupportTicket {
  id: string
  subject: string
  message: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: any
  replies?: number
}

export default function BannedPage() {
  const router = useRouter()
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')
      setUserId(user.uid)

      try {
        // Fetch user ban info
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()

        if (!userData?.isBanned) {
          router.push('/dashboard')
          return
        }

        setBanInfo({
          isBanned: true,
          banReason: userData.banReason || 'Violation of platform terms',
          bannedAt: userData.bannedAt,
          walletBalance: userData.holdingBalance || 0,
          holdingBalance: userData.holdingBalance || 0,
          walletFrozenAt: userData.walletFrozenAt,
          userId: userData.userId,
          name: userData.name
        })

        // Fetch read-only data for banned users
        fetchBannedUserData(user.uid)
      } catch (error) {
        console.error('Error fetching ban info:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchBannedUserData = (uid: string) => {
    setDataLoading(true)
    setDataError(null)
    
    let loadedCount = 0
    const totalQueries = 5
    
    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount >= totalQueries) {
        setDataLoading(false)
      }
    }

    // Fetch transactions (read-only)
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
      console.log('✅ Transactions loaded:', txs.length)
      setTransactions(txs)
      checkAllLoaded()
    }, (error) => {
      console.error('❌ Transactions error:', error.message)
      setDataError('Unable to load some data. Please refresh.')
      setTransactions([])
      checkAllLoaded()
    })

    // Fetch withdrawals (read-only)
    const withdrawalsQuery = query(
      collection(db, 'withdrawals'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeWithdrawals = onSnapshot(withdrawalsQuery, (snapshot) => {
      const wds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Withdrawal))
      console.log('✅ Withdrawals loaded:', wds.length)
      setWithdrawals(wds)
      checkAllLoaded()
    }, (error) => {
      console.error('❌ Withdrawals error:', error.message)
      setWithdrawals([])
      checkAllLoaded()
    })

    // Fetch referrals (read-only)
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('referrerId', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeReferrals = onSnapshot(referralsQuery, (snapshot) => {
      const refs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Referral))
      console.log('✅ Referrals loaded:', refs.length)
      setReferrals(refs)
      checkAllLoaded()
    }, (error) => {
      console.error('❌ Referrals error:', error.message)
      setReferrals([])
      checkAllLoaded()
    })

    // Fetch announcements (public read)
    const announcementsQuery = query(
      collection(db, 'site_announcements'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
      const anns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement))
      console.log('✅ Announcements loaded:', anns.length)
      setAnnouncements(anns)
      checkAllLoaded()
    }, (error) => {
      console.error('❌ Announcements error:', error.message)
      setAnnouncements([])
      checkAllLoaded()
    })

    // Fetch support tickets
    const ticketsQuery = query(
      collection(db, 'supportTickets'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
      const tks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket))
      console.log('✅ Tickets loaded:', tks.length)
      setTickets(tks)
      checkAllLoaded()
    }, (error) => {
      console.error('❌ Tickets error:', error.message)
      setTickets([])
      checkAllLoaded()
    })

    return () => {
      unsubscribeTransactions()
      unsubscribeWithdrawals()
      unsubscribeReferrals()
      unsubscribeAnnouncements()
      unsubscribeTickets()
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketMessage.trim()) return

    setSubmittingTicket(true)
    try {
      await addDoc(collection(db, 'supportTickets'), {
        userId: userId,
        userEmail: userEmail,
        subject: ticketSubject,
        message: ticketMessage,
        status: 'open',
        category: 'ban-appeal',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      setTicketSubject('')
      setTicketMessage('')
      setShowTicketForm(false)
      alert('Support ticket created successfully!')
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to create ticket. Please try again.')
    } finally {
      setSubmittingTicket(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
    return new Date(timestamp).toLocaleDateString('en-IN')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock3 className="w-4 h-4 text-yellow-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full"
        />
      </div>
    )
  }

  if (!banInfo?.isBanned) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col overflow-hidden">
      <header className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white relative z-50 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div 
                animate={{ x: [0, -3, 3, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
              >
                <Ban className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <div>
                <span className="font-bold text-base sm:text-lg">DailyTaskPay</span>
                <Badge className="ml-1 sm:ml-2 bg-red-800 text-white border-0 text-[10px] sm:text-xs">BANNED</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-white/80 hidden sm:block max-w-[150px] truncate">{userEmail}</span>
              <Button size="sm" onClick={handleSignOut} className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-5">
        {/* Hero Banner - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-5 relative w-full"
        >
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl sm:shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px'}} />
            </div>
            <div className="relative z-10 flex flex-row items-center gap-3 sm:gap-6">
              <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <ShieldAlert className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Account Suspended</h1>
                <p className="text-white/90 text-sm sm:text-lg leading-tight">
                  Your account has been permanently banned
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-4 text-xs sm:text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{formatDate(banInfo.bannedAt)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{banInfo.banReason}</span>
                  </span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/70 text-xs sm:text-sm">Frozen Balance</p>
                <p className="text-2xl sm:text-4xl font-bold">₹{banInfo.holdingBalance?.toLocaleString('en-IN') || '0'}</p>
              </div>
            </div>
            {/* Mobile Frozen Balance */}
            <div className="sm:hidden mt-3 pt-3 border-t border-white/20 flex justify-between items-center">
              <span className="text-white/70 text-xs">Frozen Balance</span>
              <span className="text-xl font-bold">₹{banInfo.holdingBalance?.toLocaleString('en-IN') || '0'}</span>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Menu Cards Section - Mobile Optimized */}
          <div className="flex flex-col gap-2 sm:gap-3 w-full relative z-[1] mt-3 sm:mt-4">
            {/* Menu Card: Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setActiveTab('transactions')}
              className={`cursor-pointer w-full bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${activeTab === 'transactions' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Transactions</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">View history (Read Only)</p>
                </div>
                <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${activeTab === 'transactions' ? 'rotate-90' : ''}`} />
              </div>
            </motion.div>

            {/* Menu Card: Withdrawals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setActiveTab('withdrawals')}
              className={`cursor-pointer w-full bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${activeTab === 'withdrawals' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Withdrawals</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">View history (Read Only)</p>
                </div>
                <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${activeTab === 'withdrawals' ? 'rotate-90' : ''}`} />
              </div>
            </motion.div>

            {/* Menu Card: Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setActiveTab('referrals')}
              className={`cursor-pointer w-full bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${activeTab === 'referrals' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Referrals</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">View referrals (Read Only)</p>
                </div>
                <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${activeTab === 'referrals' ? 'rotate-90' : ''}`} />
              </div>
            </motion.div>

            {/* Menu Card: Support Tickets - ACTIVE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setActiveTab('support')}
              className={`cursor-pointer w-full bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${activeTab === 'support' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Support Tickets</h3>
                  <p className="text-xs sm:text-sm text-green-600 font-medium">Active - Submit appeal</p>
                </div>
                <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${activeTab === 'support' ? 'rotate-90' : ''}`} />
              </div>
            </motion.div>
          </div>

          {/* Back to Overview Button - Show when on other tabs */}
          {activeTab !== 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-[1]">
              <Button
                variant="outline"
                onClick={() => setActiveTab('overview')}
                className="w-full py-3 rounded-xl border-gray-300"
              >
                ← Back to Overview
              </Button>
            </motion.div>
          )}

          <TabsContent value="overview" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            {/* Cards Section - Mobile Optimized */}
            <div className="flex flex-col gap-3 w-full">
              {/* Ban Details Card */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="relative z-[1]">
                <Card className="border-red-200 shadow-md overflow-hidden rounded-lg sm:rounded-xl">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 sm:p-4">
                    <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                      <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                      Ban Information
                    </CardTitle>
                  </div>
                  <CardContent className="p-3 sm:p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-xs text-red-600 uppercase font-semibold">Status</p>
                        <Badge className="mt-1 bg-red-500 text-white text-xs">PERMANENTLY BANNED</Badge>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xs text-orange-600 uppercase font-semibold">Reason</p>
                        <p className="font-medium text-orange-900 mt-1 text-sm truncate">{banInfo.banReason}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Banned Date</p>
                      <p className="font-medium text-gray-900 mt-1 text-sm">{formatDate(banInfo.bannedAt)}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                          Creating new accounts to bypass this ban will result in immediate detection.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Frozen Wallet Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative z-[1]">
                <Card className="border-blue-200 shadow-md overflow-hidden rounded-lg sm:rounded-xl">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 sm:p-4">
                    <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Frozen Wallet
                    </CardTitle>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-center py-4 sm:py-6">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3"
                      >
                        <Wallet className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
                      </motion.div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Frozen Balance</p>
                      <p className="text-2xl sm:text-4xl font-bold text-blue-600">
                        ₹{banInfo.holdingBalance?.toLocaleString('en-IN') || '0'}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900 text-sm">Wallet Locked</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Frozen since {formatDate(banInfo.walletFrozenAt)}. Balance cannot be accessed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Stats - Mobile 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { label: 'Transactions', value: transactions.length, icon: Receipt, color: 'from-blue-500 to-cyan-500' },
                { label: 'Withdrawals', value: withdrawals.length, icon: ArrowLeftRight, color: 'from-green-500 to-emerald-500' },
                { label: 'Referrals', value: referrals.length, icon: Users, color: 'from-purple-500 to-pink-500' },
                { label: 'Support', value: tickets.length, icon: MessageSquare, color: 'from-indigo-500 to-violet-500' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => setActiveTab(stat.label.toLowerCase())}
                  className="cursor-pointer relative z-[1] active:scale-[0.98] transition-transform"
                >
                  <Card className="hover:shadow-lg transition-shadow border-0 shadow-md rounded-lg sm:rounded-xl">
                    <CardContent className="p-2 sm:p-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-2`}>
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Site Announcements */}
            {announcements.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="border-yellow-200">
                  <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <Megaphone className="w-5 h-5" />
                      Site Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {announcements.slice(0, 3).map((ann, idx) => (
                      <div key={ann.id} className={`p-4 ${idx !== announcements.length - 1 ? 'border-b' : ''}`}>
                        <div className="flex items-start gap-3">
                          <Badge className={
                            ann.priority === 'high' ? 'bg-red-100 text-red-700' :
                            ann.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {ann.priority}
                          </Badge>
                          <div>
                            <h4 className="font-semibold text-gray-900">{ann.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{ann.content}</p>
                            <p className="text-xs text-gray-400 mt-2">{formatDate(ann.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Transactions Tab - Mobile Optimized */}
          <TabsContent value="transactions" className="mt-3 sm:mt-4 pb-3 sm:pb-4 relative z-[1]">
            <Card className="border-0 shadow-md overflow-hidden mb-3 rounded-lg sm:rounded-xl">
              <div className="bg-slate-900 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Transaction History</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Read Only</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-0 bg-white">
                {dataLoading ? (
                  <div className="p-6 sm:p-8 text-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-500">Loading...</p>
                  </div>
                ) : dataError ? (
                  <div className="p-6 sm:p-8 text-center text-red-500">
                    <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3" />
                    <p className="text-sm">{dataError}</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium text-sm sm:text-base">No transactions found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {transactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            tx.type === 'task' ? 'bg-blue-100 text-blue-600' :
                            tx.type === 'referral' ? 'bg-purple-100 text-purple-600' :
                            tx.type === 'bonus' ? 'bg-amber-100 text-amber-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {tx.type === 'task' ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> :
                             tx.type === 'referral' ? <Users className="w-5 h-5 sm:w-6 sm:h-6" /> :
                             tx.type === 'bonus' ? <Gift className="w-5 h-5 sm:w-6 sm:h-6" /> :
                             <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm truncate">{tx.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`font-bold text-base sm:text-lg ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount > 0 ? '+' : ''}₹{tx.amount}
                          </p>
                          <Badge className={`${getStatusColor(tx.status)} text-xs`}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab - Mobile Optimized */}
          <TabsContent value="withdrawals" className="mt-3 sm:mt-4 relative z-[1]">
            <Card className="rounded-lg sm:rounded-xl shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                  <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  Withdrawal History
                </CardTitle>
                <CardDescription className="text-white/90 text-xs sm:text-sm">
                  Read Only - New withdrawals blocked
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {dataLoading ? (
                  <div className="p-6 sm:p-8 text-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-green-200 border-t-green-500 rounded-full mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-500">Loading...</p>
                  </div>
                ) : dataError ? (
                  <div className="p-6 sm:p-8 text-center text-red-500">
                    <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3" />
                    <p className="text-sm">{dataError}</p>
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-gray-500">
                    <ArrowLeftRight className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No withdrawals found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {withdrawals.map((wd) => (
                      <div key={wd.id} className="p-3 sm:p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            {getStatusIcon(wd.status)}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm">₹{wd.amount}</p>
                              <p className="text-xs text-gray-500 capitalize">{wd.method}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(wd.status)}>
                            {wd.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(wd.createdAt)}</p>
                        {wd.status === 'rejected' && wd.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">Reason: {wd.rejectionReason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab - Mobile Optimized */}
          <TabsContent value="referrals" className="mt-3 sm:mt-4 relative z-[1]">
            <Card className="rounded-lg sm:rounded-xl shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Referral History
                </CardTitle>
                <CardDescription className="text-white/90 text-xs sm:text-sm">
                  Read Only - New referrals blocked
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {dataLoading ? (
                  <div className="p-6 sm:p-8 text-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-500">Loading...</p>
                  </div>
                ) : dataError ? (
                  <div className="p-6 sm:p-8 text-center text-red-500">
                    <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3" />
                    <p className="text-sm">{dataError}</p>
                  </div>
                ) : referrals.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-gray-500">
                    <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No referrals found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {referrals.map((ref) => (
                      <div key={ref.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{ref.referredName || ref.referredEmail}</p>
                            <p className="text-xs text-gray-500">{formatDate(ref.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-semibold text-green-600 text-sm">+₹{ref.reward}</p>
                          <Badge className={getStatusColor(ref.status)}>{ref.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab - Mobile Optimized */}
          <TabsContent value="support" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4 relative z-[1]">
            {/* Create Ticket */}
            <Card className="border-indigo-200 rounded-lg sm:rounded-xl shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-violet-500 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  Appeal Your Ban
                </CardTitle>
                <CardDescription className="text-white/90 text-xs sm:text-sm">
                  Create a support ticket to appeal your ban
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {!showTicketForm ? (
                  <div className="text-center py-4 sm:py-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                    </div>
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm px-2">
                      Believe this ban was a mistake? Submit an appeal ticket.
                    </p>
                    <Button 
                      onClick={() => setShowTicketForm(true)}
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white w-full sm:w-auto"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Create Appeal Ticket
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTicket} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <Input
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Ban Appeal - [Your Reason]"
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                      <Textarea
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Explain why you believe this ban was a mistake..."
                        rows={4}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowTicketForm(false)}
                        className="flex-1 text-sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submittingTicket}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm"
                      >
                        {submittingTicket ? 'Submitting...' : 'Submit Appeal'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Previous Tickets */}
            <Card className="mb-2 sm:mb-4 rounded-lg sm:rounded-xl shadow-md">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Your Support Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {tickets.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-gray-500">
                    <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No support tickets yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create a ticket to appeal your ban</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="p-3 sm:p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">{ticket.subject}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(ticket.createdAt)}</p>
                          </div>
                          <Badge className={`flex-shrink-0 text-xs ${
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                            ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{ticket.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6 relative z-[1]">
          <Card className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer rounded-lg sm:rounded-xl shadow-sm sm:shadow-md active:scale-[0.98]" onClick={handleSignOut}>
            <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Create New Account</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Start fresh</p>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            </CardContent>
          </Card>

          <Card className="border-gray-200 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5">Important Notice</h3>
                  <p className="text-xs text-gray-600">
                    Multi-accounting will result in permanent suspension.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Footer - Mobile Optimized */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 relative z-[1]">
          <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-3 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © 2026 DailyTaskPay. All rights reserved.
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-6 flex-1">
              <Link href="/legal/terms" className="text-xs sm:text-sm text-gray-500 hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="text-xs sm:text-sm text-gray-500 hover:text-primary transition-colors">
                Privacy
              </Link>
              <button 
                onClick={() => setActiveTab('support')}
                className="text-xs sm:text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
