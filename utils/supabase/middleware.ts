import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { decodeSession, SESSION_COOKIE_NAME } from '@/utils/session';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // why user-sessions are being dropped.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = decodeSession(sessionToken)
  const isAuthenticated = !!session

  if (
    !isAuthenticated &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    request.nextUrl.pathname !== '/'
  ) {
    // This route requires authentication, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Role-based access control for dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session || session.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/welcome'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
