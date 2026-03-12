'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions } from '@/lib/firebase/firebaseConfig'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
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
  AlertCircle,
  ClipboardList,
  Star,
  Upload,
  CheckCircle,
  X,
  FileText,
  Ban,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'

interface GeneratedTask {
  id: string
  taskId: string
  title: string
  description: string
  reward: number
  providerName: string
  providerId: string
  providerType: 'iframe' | 'sdk' | 'postback'
  iframeUrl?: string
  sdkKey?: string
  providerTaskUrl?: string
  taskUrl?: string
  taskType: string
  status: 'active' | 'inactive'
  createdAt: Date
  proofRequired?: 'screenshot' | 'username' | 'email'
  taskLimit?: number
  completedCount?: number
}

interface TaskHistory {
  id: string
  provider: string
  reward: number
  status: string
  timestamp: Date
}

interface ManualTask {
  id: string
  title: string
  description: string
  reward: number
  proofRequired: string
  timeEstimate: string
  status: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  taskUrl?: string
  taskLimit?: number
  completedCount?: number
}

interface AffiliateLink {
  id: string
  name: string
  url: string
  description: string
  category: string
  status: 'active' | 'inactive'
  clickCount: number
}

const TYPE_ICONS = {
  iframe: Globe,
  sdk: Smartphone,
  postback: Code,
}

const TYPE_LABELS = {
  iframe: 'iFrame',
  sdk: 'SDK',
  postback: 'Postback API',
}

export default function TasksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([])
  const [manualTasks, setManualTasks] = useState<ManualTask[]>([])
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([])
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [startingTask, setStartingTask] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<GeneratedTask | null>(null)
  const [showIframe, setShowIframe] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submittingTask, setSubmittingTask] = useState<GeneratedTask | ManualTask | null>(null)
  const [proofData, setProofData] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Check if user is banned
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        if (userData.isBanned) {
          router.push('/banned')
          return
        }
      }

      // Fetch generated tasks from offerwall providers (auto-generated) - Sorted by reward DESC
      const generatedTasksQuery = query(
        collection(db, 'tasks'), 
        where('status', '==', 'active'),
        orderBy('reward', 'desc')
      )
      
      const unsubscribeGeneratedTasks = onSnapshot(generatedTasksQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GeneratedTask[]
        setGeneratedTasks(data)
      })

      // Fetch active manual tasks from admin - Sorted by reward DESC
      const manualTasksQuery = query(
        collection(db, 'manualTasks'),
        where('status', '==', 'active'),
        orderBy('reward', 'desc')
      )
      
      const unsubscribeManualTasks = onSnapshot(manualTasksQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ManualTask[]
        setManualTasks(data)
        setLoading(false)
      })

      // Fetch active affiliate links
      const affiliateQuery = query(
        collection(db, 'affiliateLinks'),
        where('status', '==', 'active')
      )
      
      const unsubscribeAffiliate = onSnapshot(affiliateQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AffiliateLink[]
        setAffiliateLinks(data)
      })

      // Fetch user's task history
      const historyQuery = query(
        collection(db, 'tasks_history'),
        where('userId', '==', currentUser.uid)
      )
      
      const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data()
          return {
            id: doc.id,
            ...docData,
            timestamp: docData.timestamp?.toDate ? docData.timestamp.toDate() : new Date()
          }
        }) as TaskHistory[]
        setTaskHistory(data)
      })

      // Fetch user's task submissions
      const submissionsQuery = query(
        collection(db, 'taskSubmissions'),
        where('userId', '==', currentUser.uid)
      )
      
      const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setSubmissions(data)
      })

      return () => {
        unsubscribeGeneratedTasks()
        unsubscribeManualTasks()
        unsubscribeAffiliate()
        unsubscribeHistory()
        unsubscribeSubmissions()
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleStartTask = async (task: GeneratedTask) => {
    if (!user) return
    
    setStartingTask(task.id)
    
    console.log('Starting task:', {
      id: task.id,
      title: task.title,
      providerType: task.providerType,
      iframeUrl: task.iframeUrl,
      providerTaskUrl: task.providerTaskUrl,
      sdkKey: task.sdkKey
    })
    
    try {
      if (task.providerType === 'iframe') {
        // Show iframe modal
        const url = task.iframeUrl?.replace('{userId}', user.uid)
        if (!url) {
          toast.error('iframe URL not configured for this task')
          return
        }
        setSelectedTask({ ...task, iframeUrl: url })
        setShowIframe(true)
      } else if (task.providerType === 'postback') {
        // Get offerwall URL with user ID from Cloud Function
        try {
          const getOfferwallUrl = httpsCallable(functions, 'getOfferwallUrl')
          const result = await getOfferwallUrl({ providerId: task.providerId })
          const data = result.data as { success: boolean; url: string }
          
          if (data.success && data.url) {
            window.open(data.url, '_blank')
            toast.success('Opening offerwall...')
          } else {
            // Fallback: redirect with user ID directly
            const url = `${task.providerTaskUrl}?uid=${user.uid}`
            window.open(url, '_blank')
            toast.success('Opening offerwall...')
          }
        } catch (error) {
          // Fallback: redirect with user ID directly
          const url = `${task.providerTaskUrl}?uid=${user.uid}`
          window.open(url, '_blank')
          toast.success('Opening offerwall...')
        }
      } else if (task.providerType === 'sdk') {
        // For SDK type, show info and redirect
        toast.success('Loading SDK...')
        // SDK would be loaded dynamically in a real implementation
        // For now, open in new tab
        if (task.sdkKey) {
          window.open(task.sdkKey, '_blank')
        }
      } else {
        // Fallback for unknown/empty providerType - try to open iframeUrl, providerTaskUrl, or taskUrl
        console.log('Unknown provider type, trying fallback URLs:', {
          iframeUrl: task.iframeUrl,
          providerTaskUrl: task.providerTaskUrl,
          taskUrl: task.taskUrl
        })
        
        const anyUrl = task.iframeUrl || task.providerTaskUrl || task.taskUrl
        
        if (task.iframeUrl) {
          const url = task.iframeUrl.replace('{userId}', user.uid)
          setSelectedTask({ ...task, iframeUrl: url })
          setShowIframe(true)
        } else if (task.providerTaskUrl) {
          const url = `${task.providerTaskUrl}?uid=${user.uid}`
          window.open(url, '_blank')
          toast.success('Opening task...')
        } else if (task.taskUrl) {
          let url = task.taskUrl
          // Replace {userId} placeholder if exists
          if (url.includes('{userId}')) {
            url = url.replace('{userId}', user?.uid || 'unknown')
          }
          // Always append uid as query param if user exists
          if (user?.uid) {
            const separator = url.includes('?') ? '&' : '?'
            url = url + separator + 'uid=' + user.uid
          }
          console.log('Opening generated task URL:', url)
          if (url.includes('iframe') || task.taskUrl.includes('wall')) {
            setSelectedTask({ ...task, iframeUrl: url })
            setShowIframe(true)
          } else {
            window.open(url, '_blank')
            toast.success('Opening task...')
          }
        } else {
          toast.error('Task URL not configured. Please contact support.')
        }
      }
    } catch (error) {
      console.error('Error starting task:', error)
      toast.error('Failed to start task')
    } finally {
      setStartingTask(null)
    }
  }

  const getCompletedCount = (providerId: string) => {
    return taskHistory.filter(t => t.provider === providerId && t.status === 'completed').length
  }

  const getTotalEarned = (providerId: string) => {
    return taskHistory
      .filter(t => t.provider === providerId && t.status === 'completed')
      .reduce((sum, t) => sum + (t.reward || 0), 0)
  }

  const getSubmissionStatus = (taskId: string) => {
    const submission = submissions.find(s => s.taskId === taskId)
    return submission ? submission.status : null
  }

  const handleAffiliateClick = async (link: AffiliateLink) => {
    if (!user) return
    
    try {
      // Track the click via Cloud Function
      const trackClick = httpsCallable(functions, 'trackAffiliateClick')
      await trackClick({ linkId: link.id })
      
      // Open the link in new tab
      window.open(link.url, '_blank')
      
      toast.success('Opening affiliate link...')
    } catch (error) {
      console.error('Error tracking affiliate click:', error)
      // Still open the link even if tracking fails
      window.open(link.url, '_blank')
    }
  }

  const openSubmitModal = (task: GeneratedTask | ManualTask) => {
    setSubmittingTask(task)
    setProofData('')
    setShowSubmitModal(true)
  }

  const handleSubmitTask = async () => {
    if (!user || !submittingTask || !proofData.trim()) return
    
    setIsSubmitting(true)
    try {
      const { addDoc, collection, serverTimestamp, doc, getDoc } = await import('firebase/firestore')
      
      // Check task limit before submitting
      const taskDoc = await getDoc(doc(db, 'tasks', submittingTask.id))
      if (taskDoc.exists()) {
        const taskData = taskDoc.data()
        const completedCount = taskData.completedCount || 0
        const taskLimit = taskData.taskLimit || 50
        
        if (completedCount >= taskLimit) {
          toast.error('This task has reached its completion limit.')
          setIsSubmitting(false)
          return
        }
      }
      
      await addDoc(collection(db, 'taskSubmissions'), {
        taskId: submittingTask.id,
        userId: user.uid,
        userEmail: user.email,
        proofData: proofData.trim(),
        proofType: (submittingTask as any).proofRequired || 'screenshot',
        status: 'pending',
        reward: submittingTask.reward,
        taskTitle: submittingTask.title,
        createdAt: serverTimestamp()
      })
      
      toast.success('Task submitted successfully! Waiting for admin approval.')
      setShowSubmitModal(false)
      setSubmittingTask(null)
      setProofData('')
    } catch (error) {
      console.error('Error submitting task:', error)
      toast.error('Failed to submit task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MobileMenu />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Tasks</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Complete tasks and earn rewards
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] px-4 py-2 rounded-xl shadow-sm dark:border dark:border-gray-700">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {generatedTasks.length + manualTasks.length + affiliateLinks.length} tasks available
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
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
                        {generatedTasks.length + manualTasks.length + affiliateLinks.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Generated Tasks from Offerwalls */}
            {generatedTasks.length === 0 ? (
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
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">No tasks available</h3>
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
                {generatedTasks.map((task: GeneratedTask, index: number) => {
                  const TypeIcon = TYPE_ICONS[task.providerType] || Globe
                  const completedCount = getCompletedCount(task.providerId)
                  const totalEarned = getTotalEarned(task.providerId)
                  const isStarting = startingTask === task.id
                  const submissionStatus = getSubmissionStatus(task.id)

                  return (
                    <motion.div
                      key={task.id}
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
                                  {task.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{task.providerName}</p>
                                <Badge variant="secondary" className="text-xs mt-1 dark:bg-gray-700 dark:text-gray-300">
                                  {TYPE_LABELS[task.providerType]}
                                </Badge>
                              </div>
                            </div>
                            {submissionStatus && (
                              <Badge className={`${
                                submissionStatus === 'pending' ? 'bg-yellow-500' :
                                submissionStatus === 'approved' ? 'bg-green-500' :
                                'bg-red-500'
                              }`}>
                                {submissionStatus === 'pending' ? 'Pending' :
                                 submissionStatus === 'approved' ? 'Approved' :
                                 'Rejected'}
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                            {task.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Reward:</span>
                              <span className="font-medium text-green-600">₹{task.reward || 'Dynamic'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Limit:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{task.taskLimit || 50} users</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                              <span className={`font-medium ${
                                (task.completedCount || 0) >= (task.taskLimit || 50)
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}>
                                {task.completedCount || 0} / {task.taskLimit || 50}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Your Completed:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{completedCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Earned:</span>
                              <span className="font-medium text-green-600">₹{totalEarned.toFixed(2)}</span>
                            </div>
                          </div>

                          {(task.completedCount || 0) >= (task.taskLimit || 50) ? (
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" disabled>
                              <Ban className="w-4 h-4 mr-2" /> Task Limit Reached
                            </Button>
                          ) : submissionStatus === 'approved' ? (
                            <Button className="w-full" disabled>
                              <CheckCircle className="w-4 h-4 mr-2" /> Completed
                            </Button>
                          ) : submissionStatus === 'pending' ? (
                            <Button className="w-full" disabled variant="outline">
                              <Clock className="w-4 h-4 mr-2" /> Pending Review
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <Button
                                className="w-full"
                                onClick={() => handleStartTask(task)}
                                disabled={isStarting}
                              >
                                {isStarting ? (
                                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                                ) : (
                                  <><Play className="w-4 h-4 mr-2" /> Start Task</>
                                )}
                              </Button>
                              <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => openSubmitModal(task)}
                              >
                                <Upload className="w-4 h-4 mr-2" /> 
                                {submissionStatus === 'rejected' ? 'Resubmit' : 'Submit Task'}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* Manual Tasks Section */}
            {manualTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="mt-8"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Manual Tasks ({manualTasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {manualTasks.map((task, index) => {
                    const submissionStatus = getSubmissionStatus(task.id)
                    
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      >
                        <Card className="h-full dark:bg-[#1E293B] dark:border-gray-700 hover:shadow-lg transition-shadow">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mr-3">
                                  <ClipboardList className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {task.title}
                                  </h3>
                                  <Badge variant="secondary" className="text-xs mt-1 dark:bg-gray-700 dark:text-gray-300 capitalize">
                                    {task.category || 'General'}
                                  </Badge>
                                </div>
                              </div>
                              {submissionStatus && (
                                <Badge className={`${
                                  submissionStatus === 'pending' ? 'bg-yellow-500' :
                                  submissionStatus === 'approved' ? 'bg-green-500' :
                                  'bg-red-500'
                                }`}>
                                  {submissionStatus === 'pending' ? 'Pending' :
                                   submissionStatus === 'approved' ? 'Approved' :
                                   'Rejected'}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                              {task.description}
                            </p>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Reward:</span>
                                <span className="font-medium text-green-600">₹{task.reward}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Limit:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{task.taskLimit || 50} users</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                                <span className={`font-medium ${
                                  (task.completedCount || 0) >= (task.taskLimit || 50)
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}>
                                  {task.completedCount || 0} / {task.taskLimit || 50}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Time:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{task.timeEstimate}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                                <span className={`font-medium capitalize ${
                                  task.difficulty === 'easy' ? 'text-green-600' :
                                  task.difficulty === 'medium' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {task.difficulty || 'Easy'}
                                </span>
                              </div>
                            </div>

                            {(task.completedCount || 0) >= (task.taskLimit || 50) ? (
                              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" disabled>
                                <Ban className="w-4 h-4 mr-2" /> Task Limit Reached
                              </Button>
                            ) : submissionStatus === 'approved' ? (
                              <Button className="w-full" disabled>
                                <CheckCircle className="w-4 h-4 mr-2" /> Completed
                              </Button>
                            ) : submissionStatus === 'pending' ? (
                              <Button className="w-full" disabled variant="outline">
                                <Clock className="w-4 h-4 mr-2" /> Pending Review
                              </Button>
                            ) : (
                              <div className="space-y-2">
                                {task.taskUrl && (
                                  <Button
                                    className="w-full"
                                    onClick={() => {
                                      let url = task.taskUrl!
                                      if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                        url = 'https://' + url
                                      }
                                      if (url.includes('{userId}')) {
                                        url = url.replace('{userId}', user?.uid || 'unknown')
                                      }
                                      if (user?.uid) {
                                        const separator = url.includes('?') ? '&' : '?'
                                        url = url + separator + 'uid=' + user.uid
                                      }
                                      window.open(url, '_blank')
                                      toast.success('Opening task...')
                                    }}
                                  >
                                    <Play className="w-4 h-4 mr-2" /> Start Task
                                  </Button>
                                )}
                                <Button
                                  className="w-full"
                                  variant={task.taskUrl ? "outline" : "default"}
                                  onClick={() => openSubmitModal(task)}
                                >
                                  <Upload className="w-4 h-4 mr-2" /> 
                                  {submissionStatus === 'rejected' ? 'Resubmit' : 'Submit Task'}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Affiliate Links Section */}
            {affiliateLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.26 }}
                className="mt-8"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Affiliate Links ({affiliateLinks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {affiliateLinks.map((link, index) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    >
                      <Card className="h-full dark:bg-[#1E293B] dark:border-gray-700 hover:shadow-lg transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-3">
                                <ExternalLink className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {link.name}
                                </h3>
                                <Badge variant="secondary" className="text-xs mt-1 dark:bg-gray-700 dark:text-gray-300 capitalize">
                                  {link.category || 'General'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                            {link.description}
                          </p>

                          <div className="flex justify-between text-sm mb-4">
                            <span className="text-gray-500 dark:text-gray-400">Clicks:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{link.clickCount || 0}</span>
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => handleAffiliateClick(link)}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" /> Visit Link
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
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
                                  {generatedTasks.find(o => o.id === task.provider)?.title || task.provider || 'Task'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {task.timestamp?.toLocaleDateString() || 'Recently'}
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

      {/* Iframe Modal */}
      {showIframe && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl h-[80vh] flex flex-col dark:bg-[#1E293B] dark:border-gray-700">
            <CardContent className="p-4 flex items-center justify-between border-b dark:border-gray-700">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-primary mr-2" />
                <span className="font-semibold text-gray-900 dark:text-white">{selectedTask.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedTask.iframeUrl, '_blank')}
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
              {selectedTask.iframeUrl ? (
                <iframe
                  src={selectedTask.iframeUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  title={selectedTask.title}
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

      {/* Task Submission Modal */}
      {showSubmitModal && submittingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Submit Task Proof
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSubmitModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Task: <span className="font-medium text-gray-900 dark:text-white">{submittingTask.title}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reward: <span className="font-medium text-green-600">₹{submittingTask.reward}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Proof Required: <span className="font-medium capitalize">{(submittingTask as any).proofRequired || 'screenshot'}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Submit Your Proof
                    </label>
                    <textarea
                      value={proofData}
                      onChange={(e) => setProofData(e.target.value)}
                      placeholder={`Enter your ${(submittingTask as any).proofRequired || 'screenshot'} proof here...`}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(submittingTask as any).proofRequired === 'screenshot' 
                        ? 'Paste screenshot link or upload details' 
                        : (submittingTask as any).proofRequired === 'username' 
                          ? 'Enter your username from the completed task'
                          : 'Enter your email or required proof'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowSubmitModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={handleSubmitTask}
                      disabled={isSubmitting || !proofData.trim()}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                      ) : (
                        <><Upload className="w-4 h-4 mr-2" /> Submit</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
