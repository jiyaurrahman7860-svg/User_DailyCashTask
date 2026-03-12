/**
 * Sitemap Generator
 * 
 * This file automatically generates an XML sitemap for search engines.
 * Next.js automatically converts this to sitemap.xml at build time.
 * 
 * SEO Benefits:
 * - Helps search engines discover all important pages
 * - Indicates page priority and update frequency
 * - Improves crawling efficiency
 * - Required for Google Search Console
 * 
 * Features:
 * - Static pages (home, blog listing, legal pages, etc.)
 * - Dynamic blog posts from Firestore blog_posts collection
 * - Automatic lastmod dates
 * - Priority and changefreq settings
 * 
 * Note: To include dynamic blog posts, you need to:
 * 1. Create an API route at /api/blog-posts that returns published posts
 * 2. Or use Firebase Admin SDK in this file (requires server environment setup)
 * 3. The blog posts are stored in Firestore under 'blog_posts' collection
 */

import { MetadataRoute } from 'next'

/**
 * Static pages configuration
 * These are the main pages of the website
 * SEO: Priorities help search engines understand page importance
 * SEO: Change frequency suggests how often content updates
 */
const staticPages: MetadataRoute.Sitemap = [
  {
    url: 'https://dailycashtask.com',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  },
  {
    url: 'https://dailycashtask.com/blog',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: 'https://dailycashtask.com/how-it-works',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: 'https://dailycashtask.com/contact',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: 'https://dailycashtask.com/legal/privacy',
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.5,
  },
  {
    url: 'https://dailycashtask.com/legal/terms',
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.5,
  },
  {
    url: 'https://dailycashtask.com/download-app',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: 'https://dailycashtask.com/support',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: 'https://dailycashtask.com/login',
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.5,
  },
  {
    url: 'https://dailycashtask.com/signup',
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.6,
  },
]

/**
 * Generate sitemap
 * 
 * Next.js automatically converts this function's return value to sitemap.xml
 * when placed in the app directory as sitemap.ts
 * 
 * SEO Note: To add dynamic blog posts to sitemap:
 * 1. Create a server-side API route that fetches published blogs from Firestore
 * 2. Or use Firebase Admin SDK in a server environment (not in client)
 * 3. Call that API from here during build time
 * 
 * @returns MetadataRoute.Sitemap - Array of sitemap entries
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // SEO: Static pages are included by default
  // Blog posts can be added dynamically via server-side fetch
  return staticPages
}
