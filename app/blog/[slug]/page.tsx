/**
 * Blog Post Page - Server Component with Dynamic SEO Metadata
 * 
 * This server component handles:
 * 1. Dynamic metadata generation for SEO (generateMetadata function)
 * 2. Server-side rendering for better SEO performance
 * 3. Delegates UI rendering to the client component
 * 
 * SEO Benefits:
 * - Dynamic title and description based on actual blog post data from Firestore
 * - Open Graph tags for social sharing
 * - Twitter Card metadata
 * - Canonical URL to prevent duplicate content
 * - Proper meta tags before JavaScript loads (SSR)
 */

import { Metadata } from 'next'
import { BlogPostContent } from './blog-post-content'

// Firebase Admin SDK imports for server-side data fetching
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Initialize Firebase Admin SDK
 * This runs on the server and has full access to Firestore
 */
const getFirebaseAdmin = () => {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    if (!privateKey) {
      console.warn('Firebase Admin not initialized - missing credentials')
      return null
    }
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    })
  }
  return getFirestore()
}

/**
 * Blog Post type interface
 */
interface BlogPost {
  id: string;
  title?: string;
  seoDescription?: string;
  excerpt?: string;
  author?: string;
  publishedDate?: string;
  featuredImage?: string;
  [key: string]: any;
}

/**
 * Fetch blog post from Firestore for metadata generation
 */
async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const db = getFirebaseAdmin()
  if (!db) {
    console.warn('Firebase Admin not available, using fallback metadata')
    return null
  }

  try {
    const postsRef = db.collection('blog_posts')
    const snapshot = await postsRef
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as BlogPost
  } catch (error) {
    console.error('Error fetching blog post for metadata:', error)
    return null
  }
}

/**
 * Generate dynamic metadata for the blog post
 * 
 * Fetches actual blog data from Firestore for accurate SEO metadata
 */
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const slug = params.slug
  const canonicalUrl = `https://dailytaskpay.com/blog/${slug}`
  const ogImageUrl = 'https://dailytaskpay.com/og-image.png'
  
  // Fetch actual blog post data from Firestore
  const post = await fetchBlogPost(slug)
  
  // Use actual post data if available, otherwise fall back to formatted slug
  const title = post?.title || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  const description = post?.seoDescription || post?.excerpt || 
    `Read this article on DailyTaskPay blog about ${title}. Complete tasks and earn rewards online.`
  
  const author = post?.author || 'DailyTaskPay'
  const publishedDate = post?.publishedDate || new Date().toISOString()
  const featuredImage = post?.featuredImage || ogImageUrl
  
  return {
    title: title,
    description: description,
    keywords: [
      'blog',
      'article',
      slug,
      'earn money online',
      'DailyTaskPay',
      'online tasks',
      'rewards',
    ],
    
    alternates: {
      canonical: canonicalUrl,
    },
    
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      siteName: 'DailyTaskPay',
      locale: 'en_IN',
      type: 'article',
      publishedTime: publishedDate,
      authors: [author],
      images: [
        {
          url: featuredImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [featuredImage],
      creator: '@dailytaskpay',
    },
    
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
    
    authors: [{ name: author }],
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
