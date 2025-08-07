import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/sign-in', '/sign-up'];

export default clerkMiddleware(async (auth, request) => {
  try {
    const path = request.nextUrl.pathname;
    console.log('Incoming request:', path);

    // Allow access to public routes
    if (publicRoutes.some(route => path.startsWith(route))) {
      console.log('Public route accessed:', path);
      return NextResponse.next();
    }

    // Check if user is authenticated
    const { userId, sessionId, getToken } = await auth();
    console.log('Auth object:', { userId, sessionId });
    
    // For API routes, check Authorization header
    if (path.startsWith('/api/')) {
      const authHeader = request.headers.get('authorization');
      console.log('API request auth header:', authHeader ? 'present' : 'missing');
      
      if (!authHeader || !userId) {
        console.log('API request not authenticated');
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } else if (!userId) {
      console.log('User not authenticated, redirecting to sign-in');
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.url);  
      return NextResponse.redirect(signInUrl);
    }

    // If authenticated but accessing the root path "/", redirect to /conversations
    if (path === '/') {
      console.log('Authenticated user accessing root path, redirecting to /conversations');
      return NextResponse.redirect(new URL('/conversations', request.url));
    }

    // Add auth token to the response headers for API routes
    if (path.startsWith('/api/')) {
      const response = NextResponse.next();
      const token = await getToken();
      if (token) {
        response.headers.set('x-clerk-auth-token', token);
      }
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
}); 

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * But DO include API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};