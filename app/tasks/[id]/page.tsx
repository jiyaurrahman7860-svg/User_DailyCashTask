'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/firebaseConfig'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { ArrowLeft, ClipboardList, Upload, Wallet, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description: string
  reward: number
  proofRequired: string
  timeEstimate: string
  status: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [proofData, setProofData] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Fetch task details
      const taskDoc = await getDoc(doc(db, 'tasks', taskId))
      if (taskDoc.exists()) {
        setTask({ id: taskDoc.id, ...taskDoc.data() } as Task)
      } else {
        toast.error('Task not found')
        router.push('/tasks')
        return
      }

      // Check if user already submitted
      const submissionsQuery = query(
        collection(db, 'taskSubmissions'),
        where('taskId', '==', taskId),
        where('userId', '==', currentUser.uid)
      )
      
      const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
        setHasSubmitted(!snapshot.empty)
        setLoading(false)
      })

      return () => unsubscribeSubmissions()
    })

    return () => unsubscribe()
  }, [taskId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !task) return

    if (!proofData.trim()) {
      toast.error('Please provide proof')
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'taskSubmissions'), {
        taskId: task.id,
        userId: user.uid,
        userEmail: user.email,
        proofData: proofData,
        proofType: task.proofRequired,
        status: 'pending',
        reward: task.reward,
        createdAt: serverTimestamp(),
        taskTitle: task.title
      })
      
      toast.success('Task submitted for review!')
      setHasSubmitted(true)
    } catch (error) {
      console.error('Error submitting task:', error)
      toast.error('Failed to submit task')
    } finally {
      setSubmitting(false)
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0 transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Task not found</p>
              <Link href="/tasks">
                <Button className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
                </Button>
              </Link>
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
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Link href="/tasks">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
              </Button>
            </Link>

            {/* Task Header */}
            <Card className="dark:bg-[#1E293B] dark:border-gray-700 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {task.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium capitalize">
                        {task.category || 'General'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        task.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {task.difficulty || 'Easy'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <Wallet className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">₹{task.reward}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reward</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{task.timeEstimate}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{task.proofRequired}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Proof Type</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="dark:bg-[#1E293B] dark:border-gray-700 mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Task Description
                </h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {task.description}
                </p>
              </CardContent>
            </Card>

            {/* Submission Form */}
            {hasSubmitted ? (
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Task Submitted!
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your submission is under review. You will receive the reward once approved.
                  </p>
                  <Link href="/tasks">
                    <Button className="mt-4">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Submit Proof
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {task.proofRequired === 'screenshot' ? 'Upload Screenshot URL or Description' :
                         task.proofRequired === 'username' ? 'Enter Your Username' :
                         'Enter Your Email'}
                      </label>
                      <Input
                        type="text"
                        placeholder={
                          task.proofRequired === 'screenshot' ? 'Paste screenshot link or describe...' :
                          task.proofRequired === 'username' ? 'Enter username...' :
                          'Enter email...'
                        }
                        value={proofData}
                        onChange={(e) => setProofData(e.target.value)}
                        required
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Proof required: <span className="font-medium capitalize">{task.proofRequired}</span>
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" /> Submit Task
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
