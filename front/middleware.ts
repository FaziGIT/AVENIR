import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDashboardRouteByRole } from './lib/dashboard-routes';
import type { UserRole } from '@/types/enums';

const ROUTES_WHITELIST: Record<UserRole, string[]> = {
  CLIENT: [
    '/dashboard',
    '/dashboard/investment',
    '/dashboard/loans',
    '/dashboard/contact',
  ],
  ADVISOR: [
    '/dashboard/clients',
    '/dashboard/news',
    '/dashboard/contact',
  ],
  DIRECTOR: [
    '/dashboard/investment',
    '/dashboard/clients',
    '/dashboard/contact',
  ],
};

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/not-found',
  '/error',
  '/banned',
];

async function getUserInfo(accessToken: string): Promise<{ role: UserRole | null; state: string | null }> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Cookie': `accessToken=${accessToken}`,
      },
    });

    if (!response.ok) {
      return { role: null, state: null };
    }

    const data = await response.json();
    return {
      role: data?.user?.role || null,
      state: data?.user?.state || null,
    };
  } catch {
    return { role: null, state: null };
  }
}

function isRouteAllowed(pathname: string, role: UserRole | null): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  if (!role) {
    return false;
  }

  const allowedRoutes = ROUTES_WHITELIST[role] || [];
  return allowedRoutes.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isBannedPage = pathname === '/banned';

  if (isAuthenticated) {
    const { role, state } = await getUserInfo(accessToken);

    if (!role && !state) {
      // Le compte a été supprimé, permettre l'accès aux pages publiques
      if (isPublicRoute) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (state === 'BANNED') {
      if (!isBannedPage && pathname !== '/login') {
        return NextResponse.redirect(new URL('/banned', request.url));
      }
      return NextResponse.next();
    }

    if (isBannedPage) {
      const dashboardRoute = role ? getDashboardRouteByRole(role) : '/dashboard';
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }

    if (isAuthPage) {
      const dashboardRoute = role ? getDashboardRouteByRole(role) : '/dashboard';
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }

    if (pathname === '/dashboard') {
      if (role && role !== 'CLIENT') {
        const dashboardRoute = getDashboardRouteByRole(role);
        return NextResponse.redirect(new URL(dashboardRoute, request.url));
      }
    }

    if (!isRouteAllowed(pathname, role)) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
