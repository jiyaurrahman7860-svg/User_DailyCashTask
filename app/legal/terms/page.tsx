import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | DailyCashTask',
  description: 'DailyCashTask Terms of Service - Read our terms and conditions for using the platform.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: March 9, 2026</p>

          <div className="prose prose-lg text-gray-600 dark:text-gray-300 space-y-6">
            <p>
              Welcome to DailyCashTask! These Terms of Service ("Terms") govern your use of our 
              website, mobile applications, and services (collectively, the "Platform"). By 
              accessing or using DailyCashTask, you agree to be bound by these Terms. Please read 
              these Terms carefully before using our Platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By creating an account, accessing, or using DailyCashTask, you acknowledge that you 
              have read, understood, and agree to be bound by these Terms and our Privacy Policy. 
              If you do not agree to these Terms, you may not access or use the Platform. 
              We reserve the right to modify these Terms at any time, and your continued use 
              constitutes acceptance of the updated Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Eligibility</h2>
            <p>To use DailyCashTask, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into a binding contract</li>
              <li>Be a resident of India (for payment processing purposes)</li>
              <li>Have a valid bank account, UPI ID, Paytm wallet, or PayPal account for receiving payments</li>
              <li>Provide accurate, complete, and truthful registration information</li>
              <li>Not have been previously banned from the Platform</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. Account Registration & Security</h2>
            <p>
              When you create an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Not create multiple accounts or share your account with others</li>
            </ul>
            <p className="mt-4">
              Upon registration, you will be assigned a unique User ID (format: DTP + 6 digits, 
              e.g., DTP482951). This ID is permanent and cannot be changed.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Tasks and Earnings</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Task Completion</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users must complete tasks honestly, accurately, and in good faith</li>
              <li>Providing false information, fake proofs, or manipulated screenshots is strictly prohibited</li>
              <li>Each task can only be completed once per user unless explicitly stated otherwise</li>
              <li>Tasks must be completed within the specified time frame</li>
              <li>Users must follow all instructions provided for each task</li>
              <li>We reserve the right to reject tasks that do not meet requirements or contain fraudulent submissions</li>
              <li>Affiliate links must be clicked through properly to receive credit</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Earnings and Payments</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Earnings are credited to your wallet after task approval by our admin team</li>
              <li>Minimum withdrawal amount is ₹100</li>
              <li>Withdrawals are available via UPI, Paytm, PayPal, or Bank Transfer</li>
              <li>Withdrawal requests are processed within 24-72 hours after admin review</li>
              <li>We may hold payments for security verification or suspected fraudulent activity</li>
              <li>Users are responsible for any applicable taxes on earnings</li>
              <li>All earnings are final and non-transferable between accounts</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Withdrawal Approval & Transaction Reference ID</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All withdrawal requests require manual admin approval</li>
              <li>Upon approval, admin will enter a unique Transaction Reference ID</li>
              <li>This Transaction ID serves as proof of payment and can be viewed in your withdrawal history</li>
              <li>Transaction Reference ID will only be visible after withdrawal status becomes "Approved"</li>
              <li>If a withdrawal is rejected, the amount will be refunded to your wallet balance</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Prohibited Activities & Fraud Prevention</h2>
            <p>You agree NOT to engage in any of the following prohibited activities:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Multiple Accounts:</strong> Creating more than one account per person</li>
              <li><strong>Fake Identity:</strong> Using false information or impersonating others</li>
              <li><strong>Automated Tools:</strong> Using bots, scripts, macros, or automated tools to complete tasks</li>
              <li><strong>Account Sharing:</strong> Sharing your account credentials with others</li>
              <li><strong>Fraudulent Submissions:</strong> Submitting fake screenshots, manipulated proofs, or false information</li>
              <li><strong>VPN/Proxy Abuse:</strong> Using VPNs, proxies, or other methods to circumvent security measures</li>
              <li><strong>Self-Referral:</strong> Creating fake accounts to earn referral bonuses</li>
              <li><strong>Referral Manipulation:</strong> Abusing the referral system through fraudulent means</li>
              <li><strong>Hacking:</strong> Attempting to hack, disrupt, or interfere with the Platform</li>
              <li><strong>Illegal Activities:</strong> Using the Platform for any illegal purposes</li>
              <li><strong>Harassment:</strong> Harassing, abusing, or harming other users</li>
              <li><strong>Harmful Content:</strong> Posting offensive, inappropriate, or harmful content</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Fraud Detection & Security Measures</h2>
            <p>
              To maintain platform integrity, we employ various security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Device Tracking:</strong> We collect device information to detect and prevent multiple account abuse</li>
              <li><strong>Rate Limiting:</strong> API requests are rate-limited to prevent abuse</li>
              <li><strong>IP Monitoring:</strong> We monitor IP addresses to detect suspicious activity</li>
              <li><strong>VPN/Proxy Detection:</strong> We detect and flag VPN and proxy usage</li>
              <li><strong>Duplicate Account Detection:</strong> We use various methods to identify and prevent duplicate accounts</li>
              <li><strong>Behavioral Analysis:</strong> We analyze user behavior patterns to detect bot activity</li>
            </ul>
            <p className="mt-4">
              By using our Platform, you consent to these security measures. Attempting to 
              circumvent these measures is a violation of these Terms and will result in 
              immediate account suspension.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Account Suspension & Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time, with or 
              without notice, for any reason, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these Terms of Service</li>
              <li>Engaging in fraudulent activity or attempting to manipulate the system</li>
              <li>Creating multiple accounts</li>
              <li>Submitting false information or fake task proofs</li>
              <li>Using VPNs, bots, or automated scripts</li>
              <li>Self-referral abuse or referral system manipulation</li>
              <li>Any activity that harms other users or the Platform</li>
              <li>Suspicious withdrawal patterns or fraudulent withdrawal attempts</li>
            </ul>
            <p className="mt-4 font-semibold text-red-600 dark:text-red-400">
              Consequences of Account Ban:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All pending and available earnings will be forfeited</li>
              <li>All referral bonuses will be cancelled</li>
              <li>Pending withdrawal requests will be rejected</li>
              <li>The banned user ID will be blacklisted from future registration</li>
              <li>Device information may be retained to prevent future account creation</li>
              <li>Banned users are not eligible for any future withdrawals or rewards</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">8. Referral Program</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users can earn referral bonuses by inviting genuine new users to the Platform</li>
              <li>Current referral reward: ₹20 per successful referral</li>
              <li>Referred users must be genuine new users who have not previously registered</li>
              <li>Self-referrals or creating fake accounts to earn referral bonuses is strictly prohibited</li>
              <li>Referral bonuses are credited after the referred user completes their first approved task</li>
              <li>We reserve the right to modify referral reward amounts or terminate the referral program at any time</li>
              <li>Abuse of the referral system will result in account suspension and forfeiture of all earnings</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">9. Bonuses & Rewards</h2>
            <p>
              DailyCashTask offers various bonus programs:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Signup Bonus:</strong> New users receive ₹10 upon successful registration</li>
              <li><strong>Daily Login Bonus:</strong> ₹2-₹10 reward for daily login (amount varies)</li>
              <li><strong>Spin Wheel:</strong> Daily spin opportunity with possible rewards of ₹2, ₹5, ₹10, or better luck</li>
              <li><strong>Scratch Cards:</strong> Available after task completion with random rewards</li>
              <li><strong>Leaderboard Rewards:</strong> Top earners receive bonus rewards</li>
              <li><strong>Contest Prizes:</strong> Weekly contests with prizes for top 10 winners</li>
            </ul>
            <p className="mt-4">
              All bonus programs are subject to change, and we reserve the right to modify or 
              discontinue any bonus program at any time. Abuse of bonus programs will result in 
              account suspension.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">10. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, and intellectual property on DailyCashTask are 
              owned by us or our licensors. You may not copy, modify, distribute, or create 
              derivative works without our written consent. This includes our logo, website 
              design, task descriptions, and all other materials on the Platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">11. Limitation of Liability</h2>
            <p>
              DailyCashTask is provided "as is" without warranties of any kind. We are not 
              liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of profits or revenue</li>
              <li>Data loss or corruption</li>
              <li>Service interruptions or downtime</li>
              <li>Third-party links or content</li>
              <li>Actions taken based on information provided on the Platform</li>
            </ul>
            <p className="mt-4">
              Our total liability to you for any claim arising from or relating to these Terms 
              or the Platform shall not exceed the amount you have earned on the Platform in 
              the 30 days preceding the event giving rise to the liability.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">12. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms shall be resolved through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Informal negotiation between parties</li>
              <li>Mediation if negotiation fails</li>
              <li>Arbitration in accordance with Indian law</li>
              <li>Courts in India shall have exclusive jurisdiction</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">13. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Changes will be effective immediately 
              upon posting to the Platform. Your continued use after changes constitutes 
              acceptance of the updated Terms. We will notify users of significant changes 
              via email or platform notification. It is your responsibility to review these 
              Terms periodically.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">14. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> legal@dailycashtask.com<br />
              <strong>Support:</strong> support@dailycashtask.com<br />
              <strong>Website:</strong> DailyCashTask.com
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">15. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws 
              of India, without regard to its conflict of law provisions. Any legal action 
              or proceeding arising under these Terms will be brought exclusively in the 
              courts located in India.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">16. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that 
              provision will be limited or eliminated to the minimum extent necessary, and 
              the remaining provisions will remain in full force and effect.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Related: <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link> | <Link href="/about" className="text-primary hover:underline">About Us</Link> | <Link href="/blog" className="text-primary hover:underline">Blog</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
