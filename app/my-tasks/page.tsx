'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { ClipboardList, CheckCircle, Clock, XCircle, Star } from 'lucide-react'

interface TaskSubmission {
  id: string
  taskId: string
  taskTitle: string
  proofData: string
  proofType: string
  status: 'pending' | 'approved' | 'rejected'
  reward: number
  createdAt: any
  reviewedAt?: any
  rejectionReason?: string
}

export default function MyTasksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Fetch user's task submissions
      const q = query(
        collection(db, 'taskSubmissions'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )

      const unsubscribeSubmissions = onSnapshot(q, (snapshot) => {
        const submissionList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TaskSubmission[]
        setSubmissions(submissionList)
        setLoading(false)
      })

      return () => unsubscribeSubmissions()
    })

    return () => unsubscribe()
  }, [router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString()
    }
    return new Date(timestamp).toLocaleDateString()
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const approvedCount = submissions.filter(s => s.status === 'approved').length
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length
  const totalEarned = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + s.reward, 0)

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
              className="mb-6"
            >
              <div className="flex items-center gap-3">
                <MobileMenu />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <ClipboardList className="w-6 h-6 mr-2" />
                    My Tasks
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    View all your task submissions and earnings
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{submissions.length}</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Earned</p>
                  <p className="text-2xl font-bold text-primary">₹{totalEarned}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submissions List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Task Submissions
                  </h3>

                  {submissions.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No task submissions yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Complete tasks to earn rewards!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions.map((submission, index) => (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              {getStatusIcon(submission.status)}
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {submission.taskTitle}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Proof: {submission.proofData}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Submitted: {formatDate(submission.createdAt)}
                                </p>
                                {submission.status === 'rejected' && submission.rejectionReason && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Reason: {submission.rejectionReason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {submission.status}
                              </span>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                ₹{submission.reward}
                              </p>
                            </div>
                          </div>
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
      <MobileBottomNav />
    </div>
  )
}
