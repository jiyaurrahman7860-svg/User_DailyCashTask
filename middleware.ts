/**
 * Next.js Middleware for Subdomain Routing
 * 
 * This middleware handles subdomain-based routing for DailyTaskPay platform.
 * It intercepts incoming requests, checks the host header, and rewrites URLs
 * to route users to the correct page based on the subdomain.
 * 
 * Subdomain Routing Rules:
 * - blog.dailytaskpay.com → /blog (Blog page)
 * - app.dailytaskpay.com → /download-app (Android App download page)
 * - admin.dailytaskpay.com → /admin (Admin dashboard)
 * - dailytaskpay.com (no subdomain) → / (Main landing page)
 * 
 * Deployment Configuration (Vercel):
 * 1. Add domain aliases in Vercel project settings:
 *    - dailytaskpay.com
 *    - blog.dailytaskpay.com
 *    - app.dailytaskpay.com
 *    - admin.dailytaskpay.com
 * 
 * 2. All subdomains should point to the same Vercel deployment
 * 
 * 3. DNS Configuration:
 *    - Add A records for each subdomain pointing to Vercel's load balancer
 *    - Or use CNAME records if using a CDN/proxy
 * 
 * How it works:
 * 1. Middleware reads the 'host' header from the incoming request
 * 2. Extracts the subdomain by checking if host starts with specific prefixes
 * 3. Rewrites the URL internally without changing the browser address bar
 * 4. Next.js App Router serves the appropriate page component
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Main middleware function
 * Runs on every request to determine routing based on subdomain
 */
export function middleware(request: NextRequest) {
  // Get the host header from the request
  // This will be something like: "blog.dailytaskpay.com" or "dailytaskpay.com"
  const host = request.headers.get('host') || ''
  
  // Get the current URL pathname
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for static files, API routes, and Next.js internals
  // These should be served directly without subdomain routing
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next()
  }

  /**
   * Subdomain Detection Logic
   * 
   * We check if the host starts with specific subdomain prefixes.
   * The order matters - we check from most specific to least specific.
   */
  
  // Check for blog subdomain: blog.dailytaskpay.com
  if (host.startsWith('blog.')) {
    // Rewrite to /blog
    // The URL in browser stays as blog.dailytaskpay.com, but internally
    // Next.js will serve the /blog page
    const url = request.nextUrl.clone()
    url.pathname = '/blog'
    return NextResponse.rewrite(url)
  }
  
  // Check for app subdomain: app.dailytaskpay.com
  if (host.startsWith('app.')) {
    // Rewrite to /download-app
    const url = request.nextUrl.clone()
    url.pathname = '/download-app'
    return NextResponse.rewrite(url)
  }
  
  // Check for admin subdomain: admin.dailytaskpay.com
  if (host.startsWith('admin.')) {
    // Rewrite to /admin
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.rewrite(url)
  }
  
  // For main domain (dailytaskpay.com) or www.dailytaskpay.com
  // Let it proceed to normal routing - no rewrite needed
  // This preserves all existing routes like /dashboard, /tasks, /wallet, etc.
  return NextResponse.next()
}

/**
 * Middleware Matcher Configuration
 * 
 * This determines which routes the middleware runs on.
 * We're excluding static files and API routes to improve performance.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
