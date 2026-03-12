import { Metadata } from 'next'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { 
  Shield, 
  Wallet, 
  CheckCircle, 
  Users, 
  AlertTriangle, 
  Mail,
  Banknote,
  Clock,
  FileCheck,
  Ban
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | DailyTaskPay',
  description: 'Learn about DailyTaskPay - Earn rewards by completing simple tasks. Trusted platform for online earning opportunities.',
  keywords: 'DailyTaskPay, earn money, complete tasks, online earning, withdrawal system',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About DailyTaskPay
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Your trusted platform for earning rewards by completing simple tasks. 
                Join millions of users who are earning daily through our secure and transparent system.
              </p>
            </div>
          </div>
        </section>

        {/* What is DailyTaskPay */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
                What is DailyTaskPay?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                DailyTaskPay is a trusted online earning platform that allows users to earn real money 
                by completing simple tasks. Whether you are a student, homemaker, or anyone looking to 
                earn extra income, our platform provides legitimate opportunities to make money from your 
                smartphone or computer.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Our mission is to create a transparent and secure ecosystem where users can earn rewards 
                fairly by completing genuine tasks from our verified partners. With millions of successful 
                withdrawals processed, we have established ourselves as a reliable platform in the online 
                earning space.
              </p>
            </div>
          </div>
        </section>

        {/* How Withdrawal System Works */}
        <section className="py-16 md:py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How Our Withdrawal System Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                We have designed a secure and transparent withdrawal process to ensure your earnings reach you safely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  1. Complete Tasks
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Browse and complete available tasks from our task board. Each task has a clearly defined reward amount.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Banknote className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  2. Earn Rewards
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Once your task submission is approved by our admin team, the reward is instantly credited to your wallet.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  3. Request Withdrawal
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  When your wallet balance reaches the minimum withdrawal amount (₹100), you can request a withdrawal.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  4. Admin Review
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our admin team manually reviews each withdrawal request to verify account details and ensure security.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Banknote className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  5. Payment Sent
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  After verification, we send the payment to your chosen method (UPI, Paytm, Bank Transfer, or PayPal).
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  6. Transaction ID
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Once approved, a unique Transaction Reference ID is assigned to your withdrawal for tracking and verification.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Processing Time
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Withdrawal requests are typically processed within 24-72 hours. You will receive a 
                    Transaction Reference ID once your withdrawal is approved, which you can use to track 
                    your payment in your withdrawal history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fraud Prevention Policy */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Fraud Prevention Policy
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                We take platform integrity seriously. Fake activity is strictly prohibited and will result in account action.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Ban className="w-6 h-6 text-red-500 mr-3" />
                    Prohibited Activities
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Users may be permanently banned if they engage in any of the following activities:
                  </p>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="p-6 flex items-start">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Multiple Account Creation
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Creating multiple accounts to abuse referral bonuses or complete tasks multiple times is strictly forbidden.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex items-start">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <FileCheck className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Fake Task Submissions
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Submitting false screenshots, fake usernames, or fabricated proof to claim task rewards.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex items-start">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        VPN or Bot Traffic
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Using VPNs, proxies, bots, automated scripts, or any artificial means to complete tasks.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex items-start">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Referral System Abuse
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Creating fake referrals, self-referring with multiple accounts, or using fraudulent methods to earn referral bonuses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Ban Warning */}
        <section className="py-16 md:py-20 bg-red-50 dark:bg-red-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-red-500 p-8">
                <div className="flex items-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-500 mr-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Account Suspension Warning
                  </h2>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  If suspicious or fraudulent activity is detected, DailyTaskPay reserves the right to 
                  <span className="font-semibold text-red-600"> suspend or permanently ban </span>
                  the user account without prior notice.
                </p>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Possible reasons for account ban include:
                </h3>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Ban className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Multiple account abuse and self-referral schemes</span>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Fake task completion and fraudulent submissions</span>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Use of automated scripts, bots, or click farms</span>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Fraudulent withdrawal attempts with false payment details</span>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Any other activity that violates our Terms of Service</span>
                  </li>
                </ul>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Once an account is banned, all earnings and referrals associated with 
                    the account will be forfeited. Banned users are not eligible for any future withdrawals or rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Us
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Have questions or need support? Our team is here to help you.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Email Support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    For general inquiries and support
                  </p>
                  <a 
                    href="mailto:support@dailytaskpay.com" 
                    className="text-primary hover:text-blue-700 font-medium"
                  >
                    support@dailytaskpay.com
                  </a>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Help Center
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Browse FAQs and helpful articles
                  </p>
                  <a 
                    href="/dashboard/support" 
                    className="text-primary hover:text-blue-700 font-medium"
                  >
                    Visit Help Center
                  </a>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  Our support team typically responds within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
