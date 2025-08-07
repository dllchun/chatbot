import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { executeQuery, executeMutation } from '@/lib/db/queries';
import { RowDataPacket } from 'mysql2';

// Types
interface ChatbotPreferenceResponse {
  chatbotId: string | null;
  needsConfiguration: boolean;
  message?: string;
  error?: string;
}

interface SavePreferenceResponse {
  success: boolean;
  error?: string;
}

interface UserPreferenceRow extends RowDataPacket {
  preferred_chatbot_id: string | null;
}

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

// Helper function for consistent response format
function createResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  })
}

// GET: Fetch user's preferred chatbot ID
export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createResponse({
        chatbotId: null,
        needsConfiguration: true,
        message: 'Please sign in to access this feature'
      })
    }

    // Fetch preference from MySQL
    const result = await executeQuery<UserPreferenceRow[]>(
      'SELECT preferred_chatbot_id FROM users WHERE id = ?',
      [userId]
    )

    if (result.error) {
      console.error('Database error:', result.error)
      return createResponse({
        chatbotId: null,
        needsConfiguration: true,
        error: 'Failed to fetch preference'
      }, 500)
    }

    if (!result.data || result.data.length === 0) {
      return createResponse({
        chatbotId: null,
        needsConfiguration: true,
        message: 'User not found'
      })
    }

    const chatbotId = result.data[0].preferred_chatbot_id

    if (!chatbotId) {
      return createResponse({
        chatbotId: null,
        needsConfiguration: true,
        message: 'Please configure your Chatbot ID in settings'
      })
    }

    return createResponse({
      chatbotId: chatbotId,
      needsConfiguration: false
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return createResponse({
      chatbotId: null,
      needsConfiguration: true,
      error: 'An error occurred while fetching your configuration'
    }, 500)
  }
}

// POST: Save user's preferred chatbot ID
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createResponse({ 
        success: false, 
        error: 'Unauthorized' 
      }, 401)
    }

    // Validate request body
    let body: { chatbotId?: string }
    try {
      const text = await request.text()
      console.log('Request body text:', text)
      body = JSON.parse(text)
    } catch (err) {
      console.error('Body parsing error:', err)
      return createResponse({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }, 400)
    }

    const chatbotId = body?.chatbotId
    if (typeof chatbotId !== 'string' || !chatbotId.trim()) {
      return createResponse({ 
        success: false, 
        error: 'Invalid chatbot ID' 
      }, 400)
    }

    // Update preference in MySQL
    const result = await executeMutation(
      'UPDATE users SET preferred_chatbot_id = ?, updated_at = NOW() WHERE id = ?',
      [chatbotId.trim(), userId]
    )

    if (result.error) {
      console.error('Database error:', result.error)
      return createResponse({ 
        success: false, 
        error: 'Failed to save preference' 
      }, 500)
    }

    return createResponse({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return createResponse({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
}