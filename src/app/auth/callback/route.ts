import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { APP_ROUTES } from '@/lib/constants/routes';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        // Redirect to login on error
        return NextResponse.redirect(new URL(APP_ROUTES.LOGIN, request.url))
      }
    }
    
    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(APP_ROUTES.HOME, request.url))
  } catch (error) {
    console.error('Error in auth callback:', error)
    // Redirect to login on error
    return NextResponse.redirect(new URL(APP_ROUTES.LOGIN, request.url))
  }
} 