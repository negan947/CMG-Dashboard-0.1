import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { APP_ROUTES } from '@/lib/constants/routes';

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we'll modify and return
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    // Content Security Policy (adjust as needed)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://supabase.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
    
    response.headers.set('Content-Security-Policy', csp)
    
    // Create a Supabase client for the middleware
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    // Refresh the session if it exists
    const { data: { session } } = await supabase.auth.getSession()
    
    // Define public routes that don't require authentication
    const isPublicRoute = 
      request.nextUrl.pathname.startsWith('/auth') || 
      request.nextUrl.pathname === APP_ROUTES.LOGIN || // Though /auth/* covers this, explicit can be kept or removed
      request.nextUrl.pathname === APP_ROUTES.HOME
    
    // Check if it's an API route
    const isApiRoute = request.nextUrl.pathname.startsWith('/api')
    
    // API routes should also be protected unless specifically public
    if (!session && !isPublicRoute && !isApiRoute) {
      return NextResponse.redirect(new URL(APP_ROUTES.LOGIN, request.url))
    }
    
    // Protect API routes (except specific public ones)
    if (isApiRoute && !session) {
      const publicApiRoutes = ['/api/health', '/api/auth'] // Add your public API routes
      const isPublicApi = publicApiRoutes.some(route => 
        request.nextUrl.pathname.startsWith(route)
      )
      
      if (!isPublicApi) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    // If the user is signed in and trying to access an auth page, redirect to dashboard
    // Exception: don't redirect from /auth/callback as it's part of the auth flow
    if (session && 
        request.nextUrl.pathname.startsWith('/auth') && 
        request.nextUrl.pathname !== APP_ROUTES.AUTH_CALLBACK) { // Check against the specific callback route
      return NextResponse.redirect(new URL(APP_ROUTES.DASHBOARD, request.url))
    }
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return the original response on error
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 