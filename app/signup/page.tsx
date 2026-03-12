'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDocs, query, collection, where, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Wallet, User, Mail, Lock, Eye, EyeOff, Gift, Chrome } from 'lucide-react'
import { storeUserSecurity, checkFraudOnSignup, generateDeviceFingerprint, getIPAddress } from '@/lib/firebase/fraud'
import { giveSignupBonus, processSignupReferral } from '@/lib/firebase/functions'
import toast from 'react-hot-toast'

function generateUserId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `DTP${randomNum}`
}

function generateReferralCode(name: string) {
  const cleanName = name.replace(/\s+/g, '').toUpperCase().substring(0, 6)
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${cleanName}${randomNum}`
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user already exists in database
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        // New user - create user document
        const userId = generateUserId()
        const name = user.displayName || 'User'
        const newReferralCode = generateReferralCode(name)
        const email = user.email || ''

        let referredBy = null
        if (referralCode) {
          const q = query(collection(db, 'users'), where('referralCode', '==', referralCode.toUpperCase()))
          const querySnapshot = await getDocs(q)
          if (!querySnapshot.empty) {
            referredBy = querySnapshot.docs[0].id
          }
        }

        await setDoc(doc(db, 'users', user.uid), {
          userId,
          name,
          email,
          walletBalance: 0,
          referralCode: newReferralCode,
          referredBy,
          level: 1,
          createdAt: new Date().toISOString(),
          tasksCompleted: 0,
          totalEarned: 0,
        })

        // Call Cloud Function to process referral after user document is created
        if (referredBy) {
          try {
            await processSignupReferral({
              referralCode: referralCode.toUpperCase().trim(),
              userId: user.uid,
              userName: name,
              userEmail: email
            })
            console.log('Referral processed successfully via Cloud Function')
          } catch (referralError: any) {
            console.error('Error processing referral:', referralError)
            // Continue even if referral processing fails
            // The user account is already created
          }
        }

        // Store user security info for anti-fraud
        await storeUserSecurity(user.uid)

        // Give signup bonus
        try {
          const deviceFingerprint = generateDeviceFingerprint()
          const ipAddress = await getIPAddress()
          const bonusResult = await giveSignupBonus({ ipAddress, deviceFingerprint }) as { data: { success: boolean; message: string; amount?: number } }
          
          if (bonusResult.data.success) {
            console.log('Signup bonus granted:', bonusResult.data.message)
          }
        } catch (bonusError) {
          console.error('Error giving signup bonus:', bonusError)
        }
      }

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName: name })

      const userId = generateUserId()
      const newReferralCode = generateReferralCode(name)

      let referredBy = null
      if (referralCode) {
        const q = query(collection(db, 'users'), where('referralCode', '==', referralCode.toUpperCase()))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          referredBy = querySnapshot.docs[0].id
        }
      }

      await setDoc(doc(db, 'users', user.uid), {
        userId,
        name,
        email,
        walletBalance: 0,
        referralCode: newReferralCode,
        referredBy,
        level: 1,
        createdAt: new Date().toISOString(),
        tasksCompleted: 0,
        totalEarned: 0,
      })

      if (referredBy) {
        try {
          await processSignupReferral({
            referralCode: referralCode.toUpperCase().trim(),
            userId: user.uid,
            userName: name,
            userEmail: email
          })
          console.log('Referral processed successfully via Cloud Function')
        } catch (referralError: any) {
          console.error('Error processing referral:', referralError)
          // Continue even if referral processing fails
        }
      }

      // Store user security info for anti-fraud
      await storeUserSecurity(user.uid)

      // Give signup bonus
      try {
        const deviceFingerprint = generateDeviceFingerprint()
        const ipAddress = await getIPAddress()
        const bonusResult = await giveSignupBonus({ ipAddress, deviceFingerprint }) as { data: { success: boolean; message: string; amount?: number } }
        
        if (bonusResult.data.success) {
          console.log('Signup bonus granted:', bonusResult.data.message)
        } else {
          console.log('Signup bonus not granted:', bonusResult.data.message)
        }
      } catch (bonusError) {
        console.error('Error giving signup bonus:', bonusError)
        // Continue to dashboard even if bonus fails
      }

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Signup error:', err)
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.')
      } else if (err.code === 'auth/invalid-api-key') {
        setError('Authentication service error. Please contact support.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.')
      } else {
        setError(err.message || 'Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md p-8">
        {/* Signup Bonus Banner */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-4 mb-6 text-white">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5" />
            <span className="font-semibold">🎁 Welcome Bonus ₹10</span>
          </div>
          <p className="text-center text-sm text-white/90 mt-1">
            Sign up today and get ₹10 added to your wallet instantly!
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-black">Create Account</h1>
          <p className="text-gray-500 mt-2">Join DailyTaskPay and start earning</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Code (Optional)
            </label>
            <Input
              type="text"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 h-12 text-base font-medium"
            disabled={loading}
          >
            <Chrome className="w-5 h-5 mr-2 text-red-500" />
            Sign up with Google
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
