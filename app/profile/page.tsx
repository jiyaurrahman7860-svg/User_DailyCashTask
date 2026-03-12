'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, updatePassword, updateProfile } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileMenu } from '@/components/mobile-menu'
import { User, Mail, Shield, Crown, LogOut, Edit2, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserData(data)
        setNewName(data.name || '')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const handleUpdateProfile = async () => {
    if (!user || !newName.trim()) return

    try {
      await updateProfile(user, { displayName: newName })
      await updateDoc(doc(db, 'users', user.uid), { name: newName })
      setUserData({ ...userData, name: newName })
      setEditing(false)
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (!user || newPassword.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }

    try {
      await updatePassword(user, newPassword)
      setNewPassword('')
      setMessage('Password changed successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to change password. Please re-login and try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MobileMenu />
              <h1 className="text-2xl font-bold text-black dark:text-white">My Profile</h1>
            </div>

            {message && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {message}
              </div>
            )}

            <Card className="mb-6 dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mr-4">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-48"
                        />
                        <Button size="sm" onClick={handleUpdateProfile}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                          {userData?.name}
                          <button
                            onClick={() => setEditing(true)}
                            className="ml-2 text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </h2>
                      </>
                    )}
                    <p className="text-gray-500 dark:text-gray-400">{userData?.userId}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{userData?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Crown className="w-5 h-5 text-gray-400 mr-3 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
                      <p className="font-medium text-gray-900 dark:text-white">Level {userData?.level || 1}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400 mr-3 dark:text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Referral Code</p>
                      <p className="font-medium text-gray-900 dark:text-white">{userData?.referralCode}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Change Password</h3>
                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button onClick={handleChangePassword} className="w-full bg-primary">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
