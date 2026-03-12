'use client'

/**
 * Admin Dashboard Page
 * 
 * This page is served when users visit admin.dailytaskpay.com
 * It provides a centralized admin interface for managing the platform.
 * 
 * Subdomain: admin.dailytaskpay.com
 * Route: /admin (rewritten from admin.dailytaskpay.com)
 * 
 * Note: This is a simplified admin page. For full admin functionality,
 * consider integrating with the separate Admin_DailyTaskPay project.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  CheckSquare, 
  TrendingUp,
  LogOut,
  Shield,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

// Admin stats interface
interface AdminStats {
  totalUsers: number
  totalTasks: number
  pendingWithdrawals: number
  totalEarnings: number
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTasks: 0,
    pendingWithdrawals: 0,
    totalEarnings: 0
  })

  // Check admin authorization
  useEffect(() => {
    const checkAuth = async () => {
      // In production, this should check Firebase Auth and verify admin claims
      // For now, we'll simulate a check
      const isAdmin = localStorage.getItem('isAdmin') === 'true'
      
      if (!isAdmin) {
        // Redirect to admin login or main site
        // router.push('/admin-login')
        // For demo purposes, we'll show the page with a warning
        setIsAuthorized(false)
      } else {
        setIsAuthorized(true)
      }
      
      setLoading(false)
    }
    
    checkAuth()
  }, [router])

  // Fetch admin stats (placeholder)
  useEffect(() => {
    if (isAuthorized) {
      // In production, fetch from Firebase
      setStats({
        totalUsers: 1250,
        totalTasks: 45,
        pendingWithdrawals: 23,
        totalEarnings: 45600
      })
    }
  }, [isAuthorized])

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    router.push('/')
  }

  const quickLinks = [
    {
      title: 'User Management',
      icon: Users,
      href: '/admin/users',
      description: 'View and manage user accounts'
    },
    {
      title: 'Task Management',
      icon: CheckSquare,
      href: '/admin/tasks',
      description: 'Create and manage tasks'
    },
    {
      title: 'Withdrawals',
      icon: Wallet,
      href: '/admin/withdrawals',
      description: 'Approve or reject withdrawals'
    },
    {
      title: 'Analytics',
      icon: TrendingUp,
      href: '/admin/analytics',
      description: 'View platform statistics'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Demo mode warning - remove in production
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-500">dailytaskpay.com</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Back to Site
              </Button>
            </div>
          </div>
        </header>

        {/* Demo Mode Banner */}
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a preview of the admin panel. 
              For full admin functionality, please use the dedicated admin project.
            </p>
          </div>
        </div>

        {/* Admin Content - Show even in demo mode */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalTasks}
                </div>
                <p className="text-xs text-gray-500 mt-1">Available for users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pending Withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.pendingWithdrawals}
                </div>
                <p className="text-xs text-orange-600 mt-1">Requires review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  ₹{stats.totalEarnings.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 mt-1">Paid to users</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Link href={link.href} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <link.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {link.title}
                        <ArrowRight className="w-4 h-4" />
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Note about full admin */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Looking for full admin features?
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              The complete admin panel with all features (user management, task creation, 
              withdrawal approval, etc.) is available in the separate Admin_DailyTaskPay project.
            </p>
            <Button variant="outline" className="border-blue-300 text-blue-700">
              Open Full Admin Panel
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Same content as above, but for authorized users */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">dailytaskpay.com</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalTasks}
              </div>
              <p className="text-xs text-gray-500 mt-1">Available for users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.pendingWithdrawals}
              </div>
              <p className="text-xs text-orange-600 mt-1">Requires review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ₹{stats.totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">Paid to users</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href={link.href} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {link.title}
                      <ArrowRight className="w-4 h-4" />
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {link.description}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
