'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions } from '@/lib/firebase/firebaseConfig'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { ArrowLeftRight, Wallet, AlertCircle, Clock, CheckCircle, XCircle, Building2, Hash } from 'lucide-react'
import toast from 'react-hot-toast'

const MINIMUM_WITHDRAWAL = 100

interface WithdrawalRequest {
  id: string
  amount: number
  method: string
  status: 'pending' | 'successful' | 'rejected'
  createdAt: any
  accountDetails?: {
    accountNumber?: string
    ifscCode?: string
    accountHolderName?: string
    upiId?: string
    paytmNumber?: string
    paypalEmail?: string
  }
  reviewedAt?: any
  rejectionReason?: string
  transactionReferenceId?: string
}

interface BankFormData {
  accountNumber: string
  ifscCode: string
  accountHolderName: string
}

export default function WithdrawPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('bank')
  const [bankForm, setBankForm] = useState<BankFormData>({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  })
  const [otherDetails, setOtherDetails] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        
        // Check if user is banned
        if (userData.isBanned) {
          router.push('/banned')
          return
        }
        
        setUserData(userData)
      }

      // Fetch withdrawal history
      const q = query(
        collection(db, 'withdrawals'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )

      const unsubscribeWithdrawals = onSnapshot(q, (snapshot) => {
        const withdrawalList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as WithdrawalRequest[]
        setWithdrawals(withdrawalList)
        setLoading(false)
      })

      return () => unsubscribeWithdrawals()
    })

    return () => unsubscribe()
  }, [router])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const withdrawAmount = parseFloat(amount)

    if (withdrawAmount < MINIMUM_WITHDRAWAL) {
      setError(`Minimum withdrawal amount is ₹${MINIMUM_WITHDRAWAL}`)
      return
    }

    if (withdrawAmount > (userData?.walletBalance || 0)) {
      setError('Insufficient balance')
      return
    }

    // Validate bank form
    if (method === 'bank') {
      if (!bankForm.accountNumber.trim() || !bankForm.ifscCode.trim() || !bankForm.accountHolderName.trim()) {
        setError('Please fill all bank details')
        return
      }
    } else if (!otherDetails.trim()) {
      setError('Please enter account details')
      return
    }

    setSubmitting(true)

    try {
      // Prepare account details as string for Cloud Function
      const accountDetailsStr = method === 'bank' 
        ? `Bank: ${bankForm.accountNumber}, IFSC: ${bankForm.ifscCode}, Holder: ${bankForm.accountHolderName}`
        : otherDetails

      // Call Cloud Function instead of direct Firestore operation
      const submitWithdrawal = httpsCallable(functions, 'submitWithdrawal')
      const result = await submitWithdrawal({
        amount: withdrawAmount,
        method: method,
        accountDetails: accountDetailsStr
      })

      const data = result.data as { success: boolean; message: string; withdrawalId: string }
      
      if (data.success) {
        setAmount('')
        setBankForm({ accountNumber: '', ifscCode: '', accountHolderName: '' })
        setOtherDetails('')
        toast.success(data.message || 'Withdrawal request submitted successfully! Amount deducted from wallet.')
      } else {
        setError(data.message || 'Failed to submit withdrawal')
      }
    } catch (err: any) {
      console.error('Withdrawal error:', err)
      // Handle Firebase callable errors
      if (err.code === 'functions/unauthenticated') {
        setError('Please login again')
      } else if (err.code === 'functions/failed-precondition') {
        setError(err.message || 'Insufficient balance or pending withdrawal exists')
      } else if (err.code === 'functions/invalid-argument') {
        setError(err.message || 'Invalid withdrawal details')
      } else {
        setError(err.message || 'Failed to submit withdrawal request')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'successful':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Withdrawal request is under review.'
      case 'successful':
        return 'Withdrawal completed successfully.'
      case 'rejected':
        return 'Withdrawal rejected. Amount refunded.'
      default:
        return ''
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString()
    }
    return new Date(timestamp).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0 transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 mb-6"
            >
              <MobileMenu />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-primary text-white mb-6 dark:bg-blue-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 mb-1">Available Balance</p>
                      <h2 className="text-3xl font-bold">₹{userData?.walletBalance?.toFixed(2) || '0.00'}</h2>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                      <Wallet className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-blue-100 mt-4">Minimum withdrawal: ₹{MINIMUM_WITHDRAWAL}</p>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Withdrawal Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Building2 className="w-5 h-5 mr-2 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Withdrawal</h3>
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleWithdraw} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Withdrawal Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'bank', name: 'Bank Transfer' },
                            { id: 'upi', name: 'UPI' },
                            { id: 'paytm', name: 'Paytm' },
                            { id: 'paypal', name: 'PayPal' }
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setMethod(m.id)}
                              className={`p-2 border rounded-lg text-sm font-medium transition-colors ${
                                method === m.id
                                  ? 'border-primary bg-primary/5 text-primary dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400'
                                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Amount (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder={`Min: ₹${MINIMUM_WITHDRAWAL}`}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min={MINIMUM_WITHDRAWAL}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {method === 'bank' ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Account Number
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter account number"
                              value={bankForm.accountNumber}
                              onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              IFSC Code
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter IFSC code (e.g., SBIN0001234)"
                              value={bankForm.ifscCode}
                              onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value.toUpperCase()})}
                              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Account Holder Name
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter account holder name"
                              value={bankForm.accountHolderName}
                              onChange={(e) => setBankForm({...bankForm, accountHolderName: e.target.value})}
                              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {method === 'upi' ? 'UPI ID' : method === 'paytm' ? 'Paytm Number' : 'PayPal Email'}
                          </label>
                          <Input
                            type="text"
                            placeholder={
                              method === 'upi' ? 'name@upi' : 
                              method === 'paytm' ? '10-digit number' : 
                              'email@example.com'
                            }
                            value={otherDetails}
                            onChange={(e) => setOtherDetails(e.target.value)}
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            required
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-primary dark:bg-blue-600 dark:hover:bg-blue-700"
                        disabled={submitting}
                      >
                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                        {submitting ? 'Processing...' : 'Request Withdrawal'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Withdrawal History */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="dark:bg-[#1E293B] dark:border-gray-700 h-full">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Withdrawal History
                    </h3>

                    {withdrawals.length === 0 ? (
                      <div className="text-center py-6">
                        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No withdrawal requests yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {withdrawals.map((withdrawal, index) => (
                          <motion.div
                            key={withdrawal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* Header: Status Badge */}
                            <div className={`px-3 py-1.5 flex items-center justify-between ${
                              withdrawal.status === 'pending' ? 'bg-yellow-50/50 dark:bg-yellow-900/20' :
                              withdrawal.status === 'successful' ? 'bg-green-50/50 dark:bg-green-900/20' :
                              'bg-red-50/50 dark:bg-red-900/20'
                            }`}>
                              <div className="flex items-center gap-1.5">
                                {getStatusIcon(withdrawal.status)}
                                <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                                  withdrawal.status === 'pending' ? 'text-yellow-700 dark:text-yellow-400' :
                                  withdrawal.status === 'successful' ? 'text-green-700 dark:text-green-400' :
                                  'text-red-700 dark:text-red-400'
                                }`}>
                                  {withdrawal.status === 'successful' ? 'Successful' : withdrawal.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {formatDate(withdrawal.createdAt)}
                              </span>
                            </div>

                            {/* Body */}
                            <div className="p-2.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <div>
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    ₹{withdrawal.amount}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1">
                                    {withdrawal.method === 'upi' && <Building2 className="w-3 h-3" />}
                                    {withdrawal.method === 'paytm' && <Wallet className="w-3 h-3" />}
                                    {withdrawal.method === 'paypal' && <ArrowLeftRight className="w-3 h-3" />}
                                    {withdrawal.method === 'bank' && <Building2 className="w-3 h-3" />}
                                    {withdrawal.method}
                                  </p>
                                </div>
                              </div>

                              {/* Status Message */}
                              <p className={`text-xs ${
                                withdrawal.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                                withdrawal.status === 'successful' ? 'text-green-600 dark:text-green-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {getStatusMessage(withdrawal.status)}
                              </p>

                              {/* Rejection Reason */}
                              {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                                <div className="mt-1.5 p-1.5 bg-red-50 dark:bg-red-900/30 rounded border border-red-100 dark:border-red-800">
                                  <p className="text-[10px] text-red-600 dark:text-red-400">
                                    <span className="font-medium">Reason:</span> {withdrawal.rejectionReason}
                                  </p>
                                </div>
                              )}

                              {/* Transaction ID */}
                              {withdrawal.status === 'successful' && withdrawal.transactionReferenceId && (
                                <div className="mt-1.5 p-1.5 bg-green-50 dark:bg-green-900/30 rounded border border-green-100 dark:border-green-800">
                                  <p className="text-[10px] text-green-700 dark:text-green-400 flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    <span className="font-medium">Ref ID:</span>
                                    <span className="font-mono">{withdrawal.transactionReferenceId}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
