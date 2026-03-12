'use client'

/**
 * Landing Page - DailyCashTask
 *
 * This is the main landing page with SEO-optimized semantic HTML structure.
 *
 * SEO Features:
 * - Semantic HTML elements: <nav>, <section>, <footer>, <article>
 * - Proper heading hierarchy: H1 (single) → H2 → H3 → H4
 * - Section tags with IDs for anchor linking (#how-it-works)
 * - Footer with navigation and contact information
 * - Dark mode support with semantic color classes
 * - ARIA-friendly motion animations
 *
 * Accessibility:
 * - ARIA labels included in UI components
 * - Semantic landmarks for screen readers
 * - Proper heading structure for content outline
 * - Focus visible states for keyboard navigation
 *
 * Structure:
 * 1. Navigation bar (sticky)
 * 2. Hero section with H1 and stats
 * 3. How It Works section (H2)
 * 4. Detailed Guide section
 * 5. Features section (H2)
 * 6. Rewards section (H2)
 * 7. FAQ section (H2)
 * 8. CTA section
 * 9. Contact section
 * 10. Footer with links
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ContactSection } from '@/components/contact-section'
import { 
  Wallet, 
  CheckCircle, 
  TrendingUp, 
  Shield, 
  Smartphone,
  Gift,
  Trophy,
  ArrowRight,
  Star,
  Users,
  ChevronDown,
  Globe,
  Clock,
  Flame,
  Ticket,
  Megaphone,
  Download
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [siteStats, setSiteStats] = useState({
    totalUsers: 0,
    totalPaid: 0,
    availableTasks: 0,
    totalTasksCompleted: 0
  })
  const [announcement, setAnnouncement] = useState<{text: string; enabled: boolean; speed?: number} | null>(null)

  useEffect(() => {
    // Fetch site stats from Firestore
    const statsRef = doc(db, 'site_stats', 'main')
    console.log('Fetching site stats from Firestore...')
    
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        console.log('Site stats fetched:', data)
        setSiteStats({
          totalUsers: data.totalUsers || 0,
          totalPaid: data.totalPaid || 0,
          availableTasks: data.availableTasks || 0,
          totalTasksCompleted: data.totalTasksCompleted || 0
        })
      } else {
        console.log('Site stats document does not exist!')
      }
    }, (error) => {
      console.error('Error fetching site stats:', error)
    })

    // Fetch announcement
    const fetchAnnouncement = async () => {
      try {
        const q = query(
          collection(db, 'site_announcements'),
          where('enabled', '==', true),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          setAnnouncement({
            text: data.text || '',
            enabled: data.enabled || false,
            speed: data.speed || 40
          })
        }
      } catch (error) {
        console.error('Error fetching announcement:', error)
      }
    }
    fetchAnnouncement()

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    })

    return () => {
      unsubscribe()
      unsubscribeStats()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">DailyCashTask</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">DailyCashTask</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-800">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Announcement Marquee - Below Navigation */}
      {announcement?.enabled && announcement.text && (
        <div className="bg-gradient-to-r from-primary via-blue-600 to-primary text-white py-2 overflow-hidden">
          <motion.div 
            className="flex whitespace-nowrap"
            animate={{
              x: ["100%", "-100%"]
            }}
            transition={{
              x: {
                duration: announcement.speed || 40,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          >
            <span className="text-sm font-medium px-8">{announcement.text}</span>
            <span className="text-sm font-medium px-8">{announcement.text}</span>
            <span className="text-sm font-medium px-8">{announcement.text}</span>
            <span className="text-sm font-medium px-8">{announcement.text}</span>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Signup Bonus Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Gift className="w-4 h-4" />
              🎁 Signup Bonus ₹10 - Start earning instantly after signup!
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Earn Money Online by <span className="text-primary dark:text-white">Completing Simple Tasks</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8"
            >
              Join millions of users who earn daily rewards. Complete tasks, spin the wheel, 
              refer friends, and withdraw your earnings instantly.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 h-14 px-8 text-lg w-full sm:w-auto">
                  Start Earning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto dark:text-white dark:border-gray-600 dark:hover:bg-gray-800">
                  Learn More
                </Button>
              </Link>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-12 pt-12 border-t dark:border-gray-700"
            >
              <div>
                <p className="text-2xl md:text-4xl font-bold text-primary">₹{siteStats.totalPaid.toLocaleString()}</p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Total Paid</p>
              </div>
              <div>
                <p className="text-2xl md:text-4xl font-bold text-primary">{siteStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Active Users</p>
              </div>
              <div>
                <p className="text-2xl md:text-4xl font-bold text-primary">{siteStats.availableTasks.toLocaleString()}</p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Available Tasks</p>
              </div>
              <div>
                <p className="text-2xl md:text-4xl font-bold text-primary">{siteStats.totalTasksCompleted.toLocaleString()}</p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Tasks Completed</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start earning in just 3 simple steps. No complicated processes, just real rewards.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <Card className="text-center dark:bg-[#1E293B] dark:border-gray-700 h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Create Account</h3>
                  <p className="text-gray-600 dark:text-gray-300">Sign up for free and get your unique referral code instantly.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="text-center dark:bg-[#1E293B] dark:border-gray-700 h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Complete Tasks</h3>
                  <p className="text-gray-600 dark:text-gray-300">Choose from various tasks, complete them, and submit proof.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="text-center dark:bg-[#1E293B] dark:border-gray-700 h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Withdraw Earnings</h3>
                  <p className="text-gray-600 dark:text-gray-300">Cash out via UPI, Paytm, PayPal, or Bank Transfer instantly.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Start Earning - Detailed Guide */}
      <section className="py-16 bg-white dark:bg-[#0F172A] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How to Start Earning</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Follow these simple steps to start earning money today. No investment required!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="relative"
            >
              <Card className="text-center dark:bg-[#1E293B] dark:border-gray-700 h-full border-primary/20">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Sign Up Free</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Create your free account in 30 seconds. Get ₹10 bonus instantly!
                  </p>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <Card className="text-center dark:bg-[#1E293B] dark:border-gray-700 h-full border-primary/20">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Choose Tasks</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Browse 100+ daily tasks. Install apps, watch videos, take surveys & more.
                  </p>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <Card className="text-center dark:bg-[#1E293B] dark:border-gray-700 h-full border-primary/20">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Complete & Submit</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Follow instructions, complete the task, and submit screenshot proof.
                  </p>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="text-center dark:bg-[#1E293B] dark:border-gray-700 h-full border-primary/20">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">4</div>
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Get Paid</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Rewards added instantly! Withdraw via UPI, Paytm, or Bank at ₹100 min.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Daily Login Bonus</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get ₹2-₹10 every day just for logging in</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Spin & Win</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Spin wheel daily to win extra rewards</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Refer Friends</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Earn ₹20 for each friend you refer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-[#0F172A] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose DailyCashTask?</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We offer the best earning experience with multiple ways to earn and instant withdrawals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0 }}
              className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Daily Tasks</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">New tasks added daily with rewards from ₹5 to ₹50</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Daily Bonus</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Claim ₹2-₹10 daily just for logging in</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Spin & Win</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Spin the wheel daily to win up to ₹10</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Refer & Earn</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Earn ₹20 for every friend you refer</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Leaderboard</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Compete with others and win bonus rewards</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Secure Platform</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">100% secure with anti-fraud protection</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Earn More with Rewards</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Daily bonuses, spin wheel, and scratch cards - multiple ways to earn extra rewards every day!
            </p>
          </motion.div>

          {/* Daily Bonus Streak */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Daily Bonus Streak</h3>
                  <p className="text-white/90 mb-4">Claim daily to build your streak and earn more!</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-4xl font-bold">7</span>
                    <span className="text-white/80">day streak</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="bg-white/20 rounded-lg aspect-square flex items-center justify-center">
                        <div className="h-2 bg-white/30 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-white/20 rounded w-1/2" />
                      </div>
                    ))}
                  </div>

                  <p className="text-yellow-200 font-medium">Next reward: ₹1</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Spin Wheel & Scratch Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spin Wheel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Spin Wheel</h3>
                  <p className="text-white/90 mb-4">Spin to win rewards!</p>
                  
                  <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">?</span>
                  </div>

                  <Link href="/signup">
                    <Button className="bg-white text-purple-600 hover:bg-gray-100">
                      Spin Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Scratch Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-[#1E293B] border-gray-700 text-white h-full">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-2">Scratch Card</h3>
                  <p className="text-gray-400 mb-6">Complete tasks to unlock scratch cards and win instant rewards!</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg aspect-square flex items-center justify-center">
                        <Ticket className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Got questions? We've got answers. Here are some common questions about DailyCashTask.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">How do I earn money on DailyCashTask?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can earn money by completing simple tasks like installing apps, signing up for websites, 
                  taking surveys, and referring friends. Each task has a different reward amount.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">How much can I earn daily?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Earnings depend on the tasks you complete. Most users earn ₹50-₹200 per day by completing 
                  tasks, claiming daily bonuses, and spinning the wheel. Top referrers earn even more!
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">How long does withdrawal take?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Withdrawals are processed within 24-48 hours. Once approved, the money is instantly 
                  transferred to your UPI, Paytm, or bank account.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Is DailyCashTask free?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! DailyCashTask is 100% free to use. We never ask for any payment or investment. 
                  You get ₹10 signup bonus just for creating an account.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">What is the minimum withdrawal?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  The minimum withdrawal amount is ₹100. Once you reach this amount, you can request 
                  a withdrawal anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-6">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Now Available</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6 leading-tight">
                DailyCashTask
                <span className="block mt-1">Mobile App</span>
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Earn money on the go! Complete tasks anytime, anywhere with our Android app. 
                Get exclusive mobile-only rewards and faster withdrawals.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Complete tasks faster with mobile-optimized interface
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Get exclusive daily bonuses only on the app
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Instant notifications for new high-paying tasks
                </li>
              </ul>
              <Link href="/download-app">
                <Button className="bg-white text-purple-600 hover:bg-gray-100">
                  <Download className="w-5 h-5 mr-2" />
                  Download App Now
                </Button>
              </Link>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-64 h-[500px] bg-gray-800 rounded-[2.5rem] border-8 border-gray-700 shadow-2xl overflow-hidden">
                  <div className="h-full bg-gradient-to-b from-primary to-blue-600 p-6 flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          <Smartphone className="w-8 h-8" />
                        </div>
                        <p className="font-semibold text-sm sm:text-base">DailyCashTask</p>
                        <p className="text-sm text-white/70">Mobile App</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="h-2 bg-white/30 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-white/20 rounded w-1/2" />
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="h-2 bg-white/30 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-white/20 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm shadow-lg animate-pulse">
                  FREE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join 500,000+ users who are earning daily. Get ₹10 signup bonus instantly!
          </p>
          <Link href="/signup">
            <Button className="bg-white text-primary hover:bg-gray-100">
              Start Earning Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DailyCashTask</span>
              </div>
              <p className="text-gray-400 text-sm">
                The most trusted platform for earning money online. Complete tasks, refer friends, and earn daily rewards.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/download-app" className="hover:text-white transition-colors">Download App</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@dailycashtask.com</li>
                <li>DailyCashTask.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 DailyCashTask. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
