import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Helper function to extract tenant from subdomain or path
function getTenantFromRequest(request: NextRequest): string | null {
  const hostname = request.headers.get('host') || '';
  
  // Check for subdomain (e.g., client1.assettracker.com)
  const subdomain = hostname.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'assettracker') {
    return subdomain;
  }
  
  // Check for path-based tenant (e.g., /tenant/client1/dashboard)
  const pathMatch = request.nextUrl.pathname.match(/^\/tenant\/([^\/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  return null;
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  const tenant = getTenantFromRequest(request);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth', '/', '/nfc'];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    if (tenant) {
      loginUrl.searchParams.set('tenant', tenant);
    }
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string;
  const userClientId = token.clientId as string;
  const isSuperAdmin = token.isSuperAdmin as boolean;

  // Tenant isolation - ensure users can only access their tenant's data
  if (tenant && !isSuperAdmin) {
    // Verify user belongs to this tenant
    if (userClientId !== tenant) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Super Admin routes - only accessible by SUPER_ADMIN role
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    if (!isSuperAdmin || userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Owner routes - legacy support, redirect to super admin
  if (pathname.startsWith('/owner')) {
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    // Redirect to new super admin routes
    const newPath = pathname.replace('/owner', '/admin');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Client routes - only accessible by CLIENT_ADMIN role
  if (pathname.startsWith('/client')) {
    if (userRole !== 'CLIENT_ADMIN' && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Worker routes - accessible by WORKER role and CLIENT_ADMIN
  if (pathname.startsWith('/worker')) {
    if (userRole !== 'WORKER' && userRole !== 'CLIENT_ADMIN' && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // API route protection
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/super-admin')) {
    if (!isSuperAdmin || userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith('/api/owner')) {
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith('/api/client')) {
    if (userRole !== 'CLIENT_ADMIN' && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Client admin access required' },
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith('/api/worker')) {
    if (userRole !== 'WORKER' && userRole !== 'CLIENT_ADMIN' && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Worker access required' },
        { status: 403 }
      );
    }
  }

  // Add tenant context to headers for API routes
  const response = NextResponse.next();
  if (tenant) {
    response.headers.set('x-tenant-id', tenant);
  }
  if (userClientId) {
    response.headers.set('x-client-id', userClientId);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};