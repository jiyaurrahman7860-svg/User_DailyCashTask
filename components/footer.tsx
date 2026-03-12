import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">DailyCashTask</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Earn money by completing simple tasks. The trusted platform for 
              online earning opportunities. Join millions of users earning daily.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Telegram</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/tasks" className="text-gray-400 hover:text-white transition-colors">Tasks</Link></li>
              <li><Link href="/wallet" className="text-gray-400 hover:text-white transition-colors">Wallet</Link></li>
              <li><Link href="/referral" className="text-gray-400 hover:text-white transition-colors">Refer & Earn</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard/support" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:support@dailycashtask.com" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DailyCashTask. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made with care in India
          </p>
        </div>
      </div>
    </footer>
  )
}
