'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Wallet, Bell, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Navbar() {
  const router = useRouter()

  return (
    <nav className="bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <motion.div
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-primary">DailyCashTask</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <motion.button
              className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => router.push('/notifications')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-6 h-6" />
            </motion.button>
            <motion.button
              className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => router.push('/profile')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  )
}
