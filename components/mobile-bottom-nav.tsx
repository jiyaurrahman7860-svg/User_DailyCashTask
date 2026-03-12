'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { usePageVisibility } from '@/hooks/usePageVisibility'
import { Home, ClipboardList, Wallet, Users, Smartphone, Play } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/reward-ads', label: 'Ads', icon: Play },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/referral', label: 'Referral', icon: Users },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { isPageVisible, isLoading } = usePageVisibility()

  // Hide on non-authenticated pages
  if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
    return null
  }

  // Filter nav items based on page visibility
  const visibleNavItems = navItems.filter((item) => isPageVisible(item.href))

  // Show minimal loading state or hide while loading
  if (isLoading) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F172A] border-t border-gray-200 dark:border-gray-800 z-50 md:hidden">
        <div className="flex justify-around items-center h-16">
          <div className="animate-pulse w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="animate-pulse w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="animate-pulse w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F172A] border-t border-gray-200 dark:border-gray-800 z-50 md:hidden transition-colors duration-300">
      <div className="flex justify-around items-center h-16 safe-area-bottom">
        {visibleNavItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors px-4 ${
                  isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
