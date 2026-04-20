import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const onboardingProtected = ['/dashboard', '/applications', '/pipeline', '/evaluate', '/reports', '/settings']

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!token) return NextResponse.redirect(new URL('/', req.url))

    const isOnboarded = token.onboarded as boolean | undefined

    if (onboardingProtected.some(r => path.startsWith(r)) && !isOnboarded) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    if (path === '/onboarding' && isOnboarded) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/applications/:path*',
    '/pipeline/:path*',
    '/evaluate/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/onboarding',
  ],
}
