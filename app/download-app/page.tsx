'use client'

/**
 * Android App Download Page - Mobile Optimized
 * 
 * This page is served when users visit app.dailycashtask.com
 * Fully optimized for mobile devices with responsive design,
 * touch-friendly buttons, and mobile-specific UX improvements.
 * 
 * Subdomain: app.dailycashtask.com
 * Route: /download-app (rewritten from app.dailycashtask.com)
 */

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Smartphone, 
  Download, 
  Star, 
  Shield, 
  Zap, 
  Gift, 
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Play
} from 'lucide-react'
import Link from 'next/link'

export default function DownloadAppPage() {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      if (typeof window !== 'undefined') {
        window.open('https://play.google.com/store/apps/details?id=com.dailycashtask.app', '_blank')
      }
    }, 1500)
  }

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Complete tasks quickly with our optimized mobile interface'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: Gift,
      title: 'Daily Rewards',
      description: 'Get exclusive bonuses only available on the app'
    },
    {
      icon: Star,
      title: 'Easy Tasks',
      description: 'Simple tasks designed for mobile experience'
    },
    {
      icon: CheckCircle,
      title: 'Instant Withdraw',
      description: 'Withdraw your earnings instantly to UPI/Paytm'
    },
    {
      icon: Smartphone,
      title: 'Always On',
      description: 'Get notified about high-paying tasks instantly'
    }
  ]

  const steps = [
    { title: 'Download', desc: 'Get the app from Play Store' },
    { title: 'Login', desc: 'Use your existing account' },
    { title: 'Complete', desc: 'Finish tasks on the go' },
    { title: 'Withdraw', desc: 'Get paid instantly' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A]">
      <Navbar />

      {/* Hero Section - Mobile Optimized */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 pt-8 pb-12 sm:py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-white text-center lg:text-left">
              {/* Rating Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 fill-yellow-300" />
                <span className="text-xs sm:text-sm font-medium">4.8/5 on Play Store</span>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6 leading-tight">
                DailyCashTask
                <span className="block mt-1">Mobile App</span>
              </h1>
              
              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
                Earn money anytime, anywhere. Complete tasks on the go and withdraw your earnings instantly.
              </p>
              
              {/* CTA Buttons - Full width on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg touch-manipulation"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download APK
                    </>
                  )}
                </Button>
                
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10 w-full h-12 sm:h-14 text-base sm:text-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Google Play
                  </Button>
                </Link>
              </div>

              {/* Subtext */}
              <p className="text-xs sm:text-sm text-white/70 mt-4 sm:mt-6">
                100% Free • No hidden charges • 500K+ downloads
              </p>
            </div>

            {/* Right Content - App Mockup - Visible on all screens */}
            <div className="flex justify-center lg:justify-end mt-6 lg:mt-0">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-110" />
                
                {/* Phone Frame */}
                <div className="relative w-52 sm:w-56 md:w-64 lg:w-72 h-[340px] sm:h-[380px] md:h-[450px] lg:h-[520px] bg-gray-900 rounded-[2rem] sm:rounded-[2.5rem] border-[6px] sm:border-8 border-gray-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 h-4 sm:h-5 bg-gray-900 rounded-b-xl sm:rounded-b-2xl z-10" />
                  
                  {/* Screen Content */}
                  <div className="h-full bg-gradient-to-b from-primary via-blue-600 to-blue-700 p-3 sm:p-4 lg:p-6 flex flex-col">
                    <div className="flex-1 flex items-center justify-center pt-4 sm:pt-6">
                      <div className="text-center text-white">
                        {/* App Icon */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/25 backdrop-blur-sm rounded-2xl mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-lg">
                          <span className="text-lg sm:text-xl lg:text-2xl font-bold">DTP</span>
                        </div>
                        <p className="font-semibold text-sm sm:text-base">DailyCashTask</p>
                        <p className="text-xs text-white/80">Earn Daily Rewards</p>
                        
                        {/* Bonus Badge */}
                        <div className="mt-3 sm:mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 inline-block shadow-lg">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">₹10 Bonus!</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Task Preview Cards */}
                    <div className="space-y-2 sm:space-y-3 pb-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/30 rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="h-2 sm:h-2.5 bg-white/40 rounded w-3/4 mb-1" />
                            <div className="h-1.5 sm:h-2 bg-white/25 rounded w-1/2" />
                          </div>
                          <div className="text-xs text-white/80 font-medium">₹5</div>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/30 rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="h-2 sm:h-2.5 bg-white/40 rounded w-3/4 mb-1" />
                            <div className="h-1.5 sm:h-2 bg-white/25 rounded w-1/2" />
                          </div>
                          <div className="text-xs text-white/80 font-medium">₹10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badges */}
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 rounded-lg sm:rounded-xl px-2 sm:px-3 py-0.5 sm:py-1 shadow-lg animate-pulse">
                  <span className="font-bold text-[10px] sm:text-xs">FREE</span>
                </div>
                
                <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 bg-gray-800 dark:bg-gray-700 rounded-lg sm:rounded-xl px-2 sm:px-3 py-0.5 sm:py-1 shadow-lg border border-gray-700">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Download className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-primary" />
                    <span className="text-[10px] sm:text-xs font-medium text-white">500K+</span>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-1/2 -right-4 sm:-right-6 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse" />
                <div className="absolute top-1/4 -left-4 sm:-left-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/50 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Started - Compact on Mobile */}
      <section className="py-10 sm:py-16 bg-white dark:bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
              Get Started in 4 Steps
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Start earning in minutes
            </p>
          </div>

          {/* Steps - Horizontal on mobile, vertical on larger screens */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center bg-gray-50 dark:bg-[#1E293B] rounded-xl p-3 sm:p-4"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base mb-2 sm:mb-3">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Screenshots Preview - Mobile Optimized */}
      <section className="py-10 sm:py-16 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
              App Preview
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              See what awaits you inside
            </p>
          </div>

          {/* Screenshot Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto">
            {['Dashboard', 'Tasks', 'Wallet'].map((screen, index) => (
              <div key={index} className="relative">
                <div className="aspect-[9/16] bg-gradient-to-b from-primary/20 to-blue-600/20 rounded-lg sm:rounded-xl border-2 border-primary/20 overflow-hidden">
                  <div className="h-full p-2 sm:p-4 flex flex-col">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-t-lg sm:rounded-t-xl p-1.5 sm:p-2 mb-2">
                      <div className="h-1 sm:h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto" />
                    </div>
                    <div className="flex-1 space-y-1.5 sm:space-y-2 p-1.5 sm:p-2">
                      <div className="h-8 sm:h-12 bg-white/60 dark:bg-gray-700/60 rounded" />
                      <div className="h-8 sm:h-12 bg-white/60 dark:bg-gray-700/60 rounded" />
                      <div className="h-8 sm:h-12 bg-white/60 dark:bg-gray-700/60 rounded" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs sm:text-sm font-medium mt-1.5 sm:mt-2 text-gray-700 dark:text-gray-300">
                  {screen}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Sticky on Mobile */}
      <section className="py-10 sm:py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-white/90 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
            Download now and get ₹10 welcome bonus instantly!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5 mr-2" />
              Download APK
            </Button>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button 
                size="lg"
                variant="outline" 
                className="border-white text-white hover:bg-white/10 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full"
              >
                Web Version
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-white/70 mt-4 sm:mt-6 text-xs sm:text-sm">
            Trusted by 500,000+ users across India
          </p>
        </div>
      </section>

      {/* Sticky Mobile CTA - Only visible on small screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F172A] border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 md:hidden z-50 safe-area-bottom">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
          onClick={handleDownload}
        >
          <Download className="w-5 h-5 mr-2" />
          Download App - It's Free
        </Button>
      </div>

      {/* Spacer for sticky button */}
      <div className="h-16 md:hidden" />

      <Footer />
    </div>
  )
}
