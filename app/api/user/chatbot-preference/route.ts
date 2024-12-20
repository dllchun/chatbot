import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Types
interface ChatbotPreferenceResponse {
  chatbotId: string | null;
  error?: string;
}

interface SavePreferenceResponse {
  success: boolean;
  error?: string;
}

// Create a Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// OPTIONS: Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// GET: Fetch user's preferred chatbot ID
export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    // Always return with these headers
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }

    if (!userId) {
      return new Response(
        JSON.stringify({
          chatbotId: null,
          needsConfiguration: true,
          message: 'Please sign in to access this feature'
        }),
        { 
          status: 200,
          headers
        }
      )
    }

    // Fetch preference
    const { data, error } = await supabase
      .from('users')
      .select('preferred_chatbot_id')
      .eq('id', userId)
      .single()

    if (error || !data?.preferred_chatbot_id) {
      return new Response(
        JSON.stringify({
          chatbotId: null,
          needsConfiguration: true,
          message: 'Please configure your Chatbot ID in settings'
        }),
        { 
          status: 200,
          headers
        }
      )
    }

    return new Response(
      JSON.stringify({
        chatbotId: data.preferred_chatbot_id,
        needsConfiguration: false
      }),
      { 
        status: 200,
        headers
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        chatbotId: null,
        needsConfiguration: true,
        message: 'An error occurred while fetching your configuration'
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    )
  }
}

// POST: Save user's preferred chatbot ID
export async function POST(request: Request) {
  console.log('POST request received');
  try {
    const { userId } = await auth();
    console.log('Auth check result:', { userId });

    if (!userId) {
      console.log('No user ID found');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    // Validate request body
    let body: any;
    try {
      const text = await request.text();
      console.log('Request body text:', text);
      body = JSON.parse(text);
      console.log('Parsed request body:', body);
    } catch (err) {
      console.error('Body parsing error:', err);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    const chatbotId = body?.chatbotId;
    console.log('Extracted chatbotId:', chatbotId);

    if (typeof chatbotId !== 'string' || !chatbotId.trim()) {
      console.log('Invalid chatbot ID format');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid chatbot ID' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    // Update preference
    console.log('Updating preference for user:', userId);
    const { error } = await supabase
      .from('users')
      .update({ preferred_chatbot_id: chatbotId.trim() })
      .eq('id', userId);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save preference' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    console.log('Preference updated successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  }
}