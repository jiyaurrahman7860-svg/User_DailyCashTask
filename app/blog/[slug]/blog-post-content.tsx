'use client'

/**
 * Blog Post Client Component
 * 
 * This is the client-side component that handles the dynamic loading
 * of blog post content from Firestore. It's separated from the page
 * component to allow server-side metadata generation.
 * 
 * SEO Note: The parent page component handles all metadata generation
 * for better search engine indexing. This component only handles
 * the interactive UI elements.
 */

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { query, collection, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage?: string
  author: string
  status: 'published' | 'draft'
  seoDescription?: string
  publishedDate: string
  createdAt: string
  updatedAt?: string
}

export function BlogPostContent() {
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const slug = params.slug as string

        // Find post by slug from blog_posts collection
        const q = query(
          collection(db, 'blog_posts'),
          where('slug', '==', slug),
          where('status', '==', 'published'),
          limit(1)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) {
          router.push('/blog')
          return
        }

        const postData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as BlogPost
        setPost(postData)

        // Load related posts from blog_posts collection
        const relatedQuery = query(
          collection(db, 'blog_posts'),
          where('status', '==', 'published'),
          limit(4)
        )
        const relatedSnapshot = await getDocs(relatedQuery)
        const related = relatedSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
          .filter(p => p.id !== postData.id)
          .slice(0, 3)
        setRelatedPosts(related)
      } catch (error) {
        console.error('Error loading blog post:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [params.slug, router])

  // Loading state with better UX
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error/Not found state
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Article Header - SEO: Using semantic <article> tag for blog content */}
      <article className="bg-white">
        {post.featuredImage ? (
          <div className="w-full h-64 md:h-96 bg-gray-200">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4 pl-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* SEO: Main article heading with H1 tag */}
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
            {post.title}
          </h1>

          {/* SEO: Author and date metadata for structured data */}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedDate || post.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Content - SEO: Article body content */}
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA Section */}
          <div className="mt-12 p-6 bg-gradient-to-r from-primary to-blue-600 rounded-xl text-white">
            <h3 className="text-xl font-bold mb-2">Start Earning Today!</h3>
            <p className="mb-4">
              Join DailyTaskPay and get ₹10 signup bonus instantly. Complete tasks, refer friends, and earn daily rewards.
            </p>
            <Link href="/signup">
              <Button className="bg-white text-primary hover:bg-gray-100">
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </article>

      {/* SEO: Related posts section with semantic <section> tag */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-black mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(relatedPost.publishedDate || relatedPost.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <h3 className="font-bold text-black mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Read More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
