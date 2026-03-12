'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Menu,
  X,
  Wallet,
  LayoutDashboard,
  ClipboardList,
  CheckCircle,
  CreditCard,
  Banknote,
  Users2,
  Users,
  Gift,
  Medal,
  Gamepad2,
  Download,
  Headphones,
  UserCircle,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import toast from 'react-hot-toast'

interface MobileMenuProps {
  userName?: string
}

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { href: '/my-tasks', icon: CheckCircle, label: 'My Tasks' },
  { href: '/wallet', icon: CreditCard, label: 'Wallet' },
  { href: '/withdraw', icon: Banknote, label: 'Withdraw' },
  { href: '/referral', icon: Users2, label: 'Referral' },
  { href: '/friend-leaderboard', icon: Users, label: 'Friend Leaderboard' },
  { href: '/rewards', icon: Gift, label: 'Rewards' },
  { href: '/leaderboard', icon: Medal, label: 'Leaderboard' },
  { href: '/contest', icon: Gamepad2, label: 'Contest' },
  { href: '/download-app', icon: Download, label: 'Download App' },
  { href: '/support', icon: Headphones, label: 'Support' },
]

export function MobileMenu({ userName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden dark:border-gray-700 dark:text-white"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#1E293B] z-50 md:hidden shadow-xl"
            >
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-lg dark:text-white block leading-tight">DailyTaskPay</span>
                      {userName && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{userName}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="dark:text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">Menu</p>
                
                {menuItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}

                <div className="border-t dark:border-gray-700 my-2" />

                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                    <UserCircle className="w-5 h-5" />
                    <span>Profile</span>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="md:hidden dark:border-gray-700 dark:text-white"
      onClick={onClick}
    >
      <Menu className="w-5 h-5" />
    </Button>
  )
}
