'use client'

/**
 * Blog Listing Page
 * 
 * Displays a grid of all published blog posts from Firestore.
 * Uses semantic HTML with <section> tags for better SEO.
 * 
 * SEO Features:
 * - Semantic section tags with proper headings
 * - H1 for page title
 * - Article previews with links to individual posts
 * - Loading state for better UX
 */

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Calendar, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'

/**
 * Blog Post Interface
 * Matches Firestore blog_posts collection schema:
 * - title: Post title
 * - slug: URL-friendly identifier
 * - excerpt: Short description for previews
 * - featuredImage: URL to hero image
 * - author: Author name
 * - status: published | draft
 * - publishedDate: Date string
 * - seoDescription: Meta description for SEO
 */
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: string
  author: string
  status: 'published' | 'draft'
  publishedDate: string
  seoDescription?: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Query blog_posts collection for published posts
        const q = query(
          collection(db, 'blog_posts'),
          where('status', '==', 'published')
        )
        const snapshot = await getDocs(q)
        
        const blogPosts = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title || '',
            slug: data.slug || '',
            excerpt: data.excerpt || data.seoDescription || '',
            featuredImage: data.featuredImage || '',
            author: data.author || 'DailyTaskPay',
            status: data.status || 'draft',
            publishedDate: data.publishedDate || data.createdAt || new Date().toISOString(),
            seoDescription: data.seoDescription || '',
          } as BlogPost
        })
        
        // Sort by published date (newest first)
        blogPosts.sort((a, b) => 
          new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        )
        
        setPosts(blogPosts)
      } catch (err) {
        console.error('Error loading blog posts:', err)
        setError('Failed to load blog posts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading articles...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] transition-colors duration-300">
      <Navbar />

      {/* Hero Section - SEO: H1 for main page title */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            DailyTaskPay Blog
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Learn how to earn money online, discover tips and tricks, and stay updated with the latest news.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid - SEO: Semantic section with article previews */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article key={post.id}>
                  <Card className="hover:shadow-lg transition-shadow dark:bg-[#1E293B] dark:border-gray-700 h-full flex flex-col">
                    <CardContent className="p-0 flex flex-col flex-grow">
                      {/* Featured Image */}
                      {post.featuredImage ? (
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary to-blue-600 rounded-t-lg flex items-center justify-center">
                          <span className="text-white text-4xl font-bold">Blog</span>
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-grow">
                        {/* Metadata: Date and Author */}
                        <header className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <time dateTime={post.publishedDate}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {new Date(post.publishedDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                          <span>
                            <User className="w-4 h-4 inline mr-1" />
                            {post.author}
                          </span>
                        </header>
                        {/* Title - H2 for section hierarchy */}
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {post.title}
                        </h2>
                        {/* Excerpt */}
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
                          {post.excerpt}
                        </p>
                        {/* Read More Link */}
                        <Link href={`/blog/${post.slug}`} className="mt-auto">
                          <Button variant="outline" className="w-full">
                            Read More
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white dark:bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of users who are earning daily rewards on DailyTaskPay.
          </p>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90">
              Get Started - ₹10 Bonus
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
