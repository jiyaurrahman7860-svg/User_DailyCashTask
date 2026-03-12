import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | DailyCashTask',
  description: 'DailyCashTask Privacy Policy - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: March 9, 2026</p>

          <div className="prose prose-lg text-gray-600 dark:text-gray-300 space-y-6">
            <p>
              At DailyCashTask, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our platform. By using DailyCashTask, 
              you consent to the data practices described in this policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username, password) - securely hashed</li>
              <li>Unique User ID (e.g., DTP482951) assigned at registration</li>
              <li>Payment information (UPI ID, bank account details, Paytm number, PayPal email for withdrawals)</li>
              <li>Profile information (profile picture, bio)</li>
              <li>Device information (device type, operating system, browser type)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Usage Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tasks completed and earnings history</li>
              <li>Login activity, session data, and IP addresses</li>
              <li>Referral activity and invited users</li>
              <li>Withdrawal requests and transaction history</li>
              <li>Transaction Reference IDs for approved withdrawals</li>
              <li>Spin wheel and scratch card usage</li>
              <li>Daily bonus claims and streak data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Security & Fraud Prevention Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device fingerprinting data for fraud detection</li>
              <li>Rate limiting logs to prevent abuse</li>
              <li>Account activity patterns for suspicious behavior detection</li>
              <li>VPN/proxy detection data</li>
              <li>Duplicate account prevention identifiers</li>
              <li>Geolocation data (approximate location based on IP)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To process your earnings and withdrawals</li>
              <li>To verify task completions and prevent fraud</li>
              <li>To detect and prevent multiple account abuse</li>
              <li>To enforce our Terms of Service and prevent violations</li>
              <li>To communicate with you about your account and updates</li>
              <li>To improve our platform and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment processors to facilitate withdrawals (UPI, Paytm, Bank Transfer, PayPal)</li>
              <li>Service providers who assist in platform operations (Firebase, hosting providers)</li>
              <li>Law enforcement when required by law or to prevent fraud</li>
              <li>Affiliate partners (only anonymized task completion data, no personal information)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of sensitive data in transit (SSL/TLS) and at rest</li>
              <li>Secure Firebase Authentication with industry-standard security</li>
              <li>Firestore Security Rules to protect database access</li>
              <li>Regular security audits and monitoring</li>
              <li>Limited access to personal information by authorized personnel only</li>
              <li>Rate limiting to prevent abuse and attacks</li>
              <li>Device tracking to detect and prevent fraudulent activity</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Fraud Prevention & Account Security</h2>
            <p>
              To maintain platform integrity, we actively monitor for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Multiple account creation from the same device or IP address</li>
              <li>VPN or proxy usage to circumvent security measures</li>
              <li>Bot or automated script activity</li>
              <li>Fake task submissions and fraudulent proofs</li>
              <li>Self-referral abuse and referral system manipulation</li>
              <li>Suspicious withdrawal patterns</li>
            </ul>
            <p className="mt-4">
              Users detected engaging in fraudulent activities will have their accounts suspended 
              and earnings forfeited. We reserve the right to share fraud-related data with law 
              enforcement if necessary.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your account and data (subject to legal retention requirements)</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
              <li>Request information about how your data is used</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at privacy@dailycashtask.com. Note that deleted 
              accounts cannot be restored, and any associated earnings will be forfeited.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage and performance</li>
              <li>Prevent fraudulent activity and detect abuse</li>
              <li>Track device information for security purposes</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">8. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed 
              to provide you services. Even after account deletion, we may retain certain information 
              for legal compliance, fraud prevention, and dispute resolution purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Transaction records: retained for 7 years as required by law</li>
              <li>Fraud-related data: retained indefinitely to prevent future abuse</li>
              <li>IP addresses and device data: retained for 1 year after account deletion</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              Our platform is not intended for users under 18 years of age. We do not knowingly 
              collect information from children under 18. If you become aware that a child has 
              provided us with personal information, please contact us immediately at 
              privacy@dailycashtask.com. We will take steps to delete such information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date. 
              Your continued use of the platform after any changes constitutes acceptance of the 
              updated policy. Significant changes will be communicated via email or platform notification.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> privacy@dailycashtask.com<br />
              <strong>Support:</strong> support@dailycashtask.com<br />
              <strong>Website:</strong> DailyCashTask.com
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Related: <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link> | <Link href="/about" className="text-primary hover:underline">About Us</Link> | <Link href="/blog" className="text-primary hover:underline">Blog</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
