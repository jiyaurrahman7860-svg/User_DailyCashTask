'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { getUserNotifications, markNotificationAsRead, Notification } from '@/lib/firebase/notifications'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle, Gift, Wallet, Trophy, Info, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      
      const userNotifications = await getUserNotifications()
      setNotifications(userNotifications)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead(notificationId)
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id!)
    }
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <Gift className="w-5 h-5 text-green-600" />
      case 'wallet':
        return <Wallet className="w-5 h-5 text-blue-600" />
      case 'contest':
        return <Trophy className="w-5 h-5 text-orange-600" />
      case 'system':
        return <Info className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'reward':
        return 'bg-green-100'
      case 'wallet':
        return 'bg-blue-100'
      case 'contest':
        return 'bg-orange-100'
      case 'system':
        return 'bg-purple-100'
      default:
        return 'bg-gray-100'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Header */}
            <div className="md:hidden mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-black">Notifications</h1>
                  <p className="text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-black">Notifications</h1>
                <p className="text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'You are all caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No notifications yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      We will notify you when something important happens
                    </p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`overflow-hidden transition-all ${
                      !notification.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-gray-600 text-sm mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.createdAt?.toDate && 
                                  format(notification.createdAt.toDate(), 'MMM d, yyyy h:mm a')
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.read && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                  New
                                </Badge>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id!)}
                                  className="text-gray-400 hover:text-primary"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
