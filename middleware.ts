import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define public routes that don't require authentication
const publicRoutes = ['/sign-in', '/sign-up'];

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

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

    // If authenticated, sync user data with Supabase
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      console.log('Clerk user data:', user);

      if (user) {
        const primaryEmail = user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId
        );
        const now = new Date().toISOString();

        const userData = {
          id: userId,
          email: primaryEmail?.emailAddress,
          first_name: user.firstName,
          last_name: user.lastName,
          image_url: user.imageUrl,
          created_at: user.createdAt,
          updated_at: now,
          last_sign_in_at: now,
        };

        const { data: existingUser, error: existingUserError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        console.log('Existing user data:', existingUser);
        console.log('Existing user error:', existingUserError);

        if (!existingUser) {
          const { error: upsertError } = await supabaseAdmin
            .from('users')
            .upsert(userData)
            .select();

          if (upsertError) {
            console.error('Supabase upsert error:', upsertError);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing user with Supabase:', error);
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
    '/api/:path*',
  ],
};