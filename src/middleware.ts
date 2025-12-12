// Middleware for protecting routes
// Checks authentication and redirects to login if needed

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/register']

// Routes that should be accessible without auth (API routes for checking session)
const semiPublicRoutes = ['/api/auth/session']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Allow semi-public routes
    if (semiPublicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Check for auth cookie
    const userId = request.cookies.get('user_id')?.value

    // If not authenticated
    if (!userId) {
        // For API routes, return 401
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // For page routes, redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // User is authenticated, continue
    return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|manifest.json).*)',
    ],
}
