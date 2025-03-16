import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we'll modify and return
    const response = NextResponse.next()
    
    // Create a Supabase client for the middleware
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    // Refresh the session if it exists
    const { data: { session } } = await supabase.auth.getSession()
    
    // Define public routes that don't require authentication
    const isPublicRoute = 
      request.nextUrl.pathname.startsWith('/auth') || 
      request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/' // Allow the root path to handle redirection
    
    // If the user is not signed in and trying to access a protected route, redirect to login
    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // If the user is signed in and trying to access an auth page, redirect to dashboard
    // Exception: don't redirect from /auth/callback as it's part of the auth flow
    if (session && 
        request.nextUrl.pathname.startsWith('/auth') && 
        !request.nextUrl.pathname.startsWith('/auth/callback')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return the original response on error
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 