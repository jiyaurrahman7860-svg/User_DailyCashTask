/**
 * Blog Post Page - Server Component with Dynamic SEO Metadata
 * 
 * This server component handles:
 * 1. Dynamic metadata generation for SEO (generateMetadata function)
 * 2. Server-side rendering for better SEO performance
 * 3. Delegates UI rendering to the client component
 * 
 * SEO Benefits:
 * - Dynamic title and description based on blog post slug
 * - Open Graph tags for social sharing
 * - Twitter Card metadata
 * - Canonical URL to prevent duplicate content
 * - Keywords from the blog post
 * - Proper meta tags before JavaScript loads (SSR)
 * 
 * Note: The actual blog content is loaded client-side because it
 * comes from Firestore. This is a common pattern for CMS-driven content.
 */

import { Metadata } from 'next'
import { BlogPostContent } from './blog-post-content'

/**
 * Generate dynamic metadata for the blog post
 * 
 * Next.js will call this function during SSR and at build time
 * to generate the appropriate meta tags for each blog post.
 * 
 * @param params - Route parameters containing the blog post slug
 * @returns Metadata object with SEO-optimized values
 */
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  // SEO: Generate the canonical URL for this blog post
  const canonicalUrl = `https://dailytaskpay.com/blog/${params.slug}`
  
  // SEO: Generate Open Graph image URL
  const ogImageUrl = 'https://dailytaskpay.com/og-image.png'
  
  // SEO: Build metadata object with fallbacks for when blog data isn't loaded yet
  // The actual blog data will be loaded client-side, so we use the slug
  // to create meaningful metadata even before the data loads
  const formattedTitle = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return {
    // SEO: Dynamic title using template from layout.tsx
    // Falls back to formatted slug if actual title isn't available
    title: formattedTitle,
    
    // SEO: Description will be updated by the client component or
    // can be enhanced by fetching from a server-side API endpoint
    description: `Read this article on DailyTaskPay blog about ${formattedTitle}. Complete tasks and earn rewards online.`,
    
    // SEO: Keywords relevant to blog content
    keywords: [
      'blog',
      'article',
      params.slug,
      'earn money online',
      'DailyTaskPay',
      'online tasks',
      'rewards',
    ],
    
    // SEO: Canonical URL to prevent duplicate content penalties
    // This ensures search engines know the preferred version of this page
    alternates: {
      canonical: canonicalUrl,
    },
    
    // SEO: Open Graph metadata for Facebook, LinkedIn, WhatsApp sharing
    // Controls how the blog post appears when shared on social media
    openGraph: {
      title: formattedTitle,
      description: `Read this article on DailyTaskPay blog about ${formattedTitle}. Complete tasks and earn rewards online.`,
      url: canonicalUrl,
      siteName: 'DailyTaskPay',
      locale: 'en_IN',
      type: 'article',
      publishedTime: new Date().toISOString(), // This could be dynamic if data is available
      authors: ['DailyTaskPay'],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: formattedTitle,
        },
      ],
    },
    
    // SEO: Twitter Card metadata for Twitter/X sharing
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description: `Read this article on DailyTaskPay blog about ${formattedTitle}. Complete tasks and earn rewards online.`,
      images: [ogImageUrl],
      creator: '@dailytaskpay',
    },
    
    // SEO: Robots directives - allow indexing of blog posts
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // SEO: Article metadata
    authors: [{ name: 'DailyTaskPay' }],
    creator: 'DailyTaskPay',
    publisher: 'DailyTaskPay',
    category: 'Finance',
  }
}

/**
 * Blog Post Page Component
 * 
 * This is a server component that:
 * 1. Receives the generateMetadata for SEO
 * 2. Renders the BlogPostContent client component for interactivity
 * 
 * @param params - Route parameters from Next.js App Router
 */
export default function BlogPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // SEO: The client component will handle dynamic content loading
  // while this server component ensures proper meta tags are in place
  return <BlogPostContent />
}
