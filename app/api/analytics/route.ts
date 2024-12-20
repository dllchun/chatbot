import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAnalytics } from '@/lib/api/chatbase'
import { config, validateServerConfig } from '@/lib/config'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    // Get Clerk session
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate server config
    validateServerConfig()

    // Parse request URL
    const requestUrl = new URL(request.url)
    const chatbotId = requestUrl.searchParams.get('chatbotId')
    const startDate = requestUrl.searchParams.get('startDate') || '2024-01-01T00:00:00.000Z'
    const endDate = requestUrl.searchParams.get('endDate') || new Date().toISOString()

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'chatbotId is required' },
        { status: 400 }
      )
    }

    // Get API key from config
    const apiKey = config.chatbase.apiKey
    if (!apiKey) {
      throw new Error('Missing CHATBASE_API_KEY environment variable')
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get conversations from Supabase for the date range
    const { data: conversations, error: fetchError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (fetchError) {
      console.error('Error fetching conversations:', fetchError)
      throw new Error('Failed to fetch conversations')
    }

    // Process analytics from conversations
    const analytics = await getAnalytics({
      apiKey,
      chatbotId,
      startDate,
      endDate,
      useCache: true,
      authToken: undefined
    })

    return NextResponse.json(analytics)

  } catch (error: any) {
    console.error('Analytics API Error:', {
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
} 