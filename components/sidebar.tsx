'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePageVisibility } from '@/hooks/usePageVisibility'
import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  ArrowLeftRight,
  Users,
  Gift,
  Trophy,
  Award,
  UserCircle,
  HelpCircle,
  Star,
  UserPlus,
  Smartphone,
  Tv,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'My Tasks', href: '/my-tasks', icon: Star },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Withdraw', href: '/withdraw', icon: ArrowLeftRight },
  { name: 'Referral', href: '/referral', icon: Users },
  { name: 'Friend Leaderboard', href: '/friend-leaderboard', icon: UserPlus },
  { name: 'Rewards', href: '/rewards', icon: Gift },
  { name: 'Reward Ads', href: '/reward-ads', icon: Tv },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Contest', href: '/contest', icon: Award },
  { name: 'Download App', href: '/download-app', icon: Smartphone },
  { name: 'Support', href: '/support', icon: HelpCircle },
  { name: 'Profile', href: '/profile', icon: UserCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isPageVisible, isLoading } = usePageVisibility()

  // Filter navigation items based on page visibility
  const visibleNavigation = navigation.filter((item) => isPageVisible(item.href))

  // Show loading state while checking visibility
  if (isLoading) {
    return (
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800 min-h-screen">
        <nav className="flex-1 p-4 space-y-1">
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </nav>
      </aside>
    )
  }

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800 min-h-screen transition-colors duration-300">
      <nav className="flex-1 p-4 space-y-1">
        {visibleNavigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500')} />
                </motion.div>
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>
    </aside>
  )
}
