import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import ClientWrapper from '@/components/ClientWrapper'

const inter = Inter({ subsets: ['latin'] })

/**
 * Global SEO Metadata Configuration
 * 
 * This metadata object provides site-wide SEO defaults that can be
 * overridden by individual pages using the Next.js Metadata API.
 * 
 * SEO Features implemented:
 * - Title template for consistent branding
 * - Meta description for search engine snippets
 * - Keywords for search relevance
 * - Open Graph tags for social sharing (Facebook, LinkedIn)
 * - Twitter Card tags for Twitter sharing
 * - Canonical URL to prevent duplicate content issues
 * - Robots directives for search engine crawling
 */
export const metadata: Metadata = {
  // Primary SEO metadata
  title: {
    default: 'DailyCashTask – Earn Rewards by Completing Tasks',
    template: '%s | DailyCashTask',
  },
  description: 'Complete simple online tasks and earn rewards with DailyCashTask. Withdraw via UPI, Paytm, PayPal, or Bank Transfer. Join thousands earning daily!',
  keywords: [
    'earn money online',
    'online tasks',
    'work from home',
    'daily rewards',
    'task completion',
    'UPI withdrawal',
    'Paytm earnings',
    'online income',
    'DailyCashTask',
    'reward app',
    'earn rewards',
    'online jobs',
    'micro tasks',
    'referral earnings',
  ],
  
  // Canonical URL configuration - prevents duplicate content penalties
  // This tells search engines the preferred version of the URL
  metadataBase: new URL('https://dailycashtask.com'),
  alternates: {
    canonical: '/',
  },
  
  // Robots meta tag - controls search engine crawling and indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Open Graph metadata for social sharing (Facebook, LinkedIn, WhatsApp)
  // These tags control how the site appears when shared on social platforms
  openGraph: {
    title: 'DailyCashTask – Earn Rewards by Completing Tasks',
    description: 'Complete simple online tasks and earn rewards with DailyCashTask. Join thousands earning daily!',
    url: 'https://dailycashtask.com',
    siteName: 'DailyCashTask',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DailyCashTask - Earn Money Online by Completing Tasks',
      },
    ],
  },
  
  // Twitter Card metadata for Twitter/X sharing
  // Controls how tweets with the site link appear
  twitter: {
    card: 'summary_large_image',
    title: 'DailyCashTask – Earn Rewards by Completing Tasks',
    description: 'Complete simple online tasks and earn rewards with DailyCashTask. Join thousands earning daily!',
    images: ['/og-image.png'],
    creator: '@dailycashtask',
  },
  
  // Icons configuration
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  
  // Verification tags for search engine webmaster tools
  // Add your verification codes here when setting up Google Search Console, etc.
  verification: {
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
  },
  
  // Additional metadata
  authors: [{ name: 'DailyCashTask' }],
  creator: 'DailyCashTask',
  publisher: 'DailyCashTask',
  category: 'Finance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // SEO: lang="en" helps search engines understand content language
    // SEO: suppressHydrationWarning prevents warnings from dark mode theme switching
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Providers>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </Providers>
      </body>
    </html>
  )
}
