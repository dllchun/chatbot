import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getConversations } from '@/lib/api/chatbase'
import { config, validateServerConfig } from '@/lib/config'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Initialize with empty URL to handle errors before assignment
  let requestUrl = new URL('http://localhost')
  
  try {
    requestUrl = new URL(request.url)

    // Get Clerk session
    const { userId } = await auth()
    
    if (!userId) {
      console.log('No user ID found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate server config
    validateServerConfig()

    // Log the incoming request URL and params
    console.log('Incoming request:', {
      url: request.url,
      searchParams: Object.fromEntries(requestUrl.searchParams.entries()),
      userId
    })

    // Get API key from config
    const apiKey = config.chatbase.apiKey
    if (!apiKey) {
      throw new Error('Missing CHATBASE_API_KEY environment variable')
    }

    // Extract parameters from request
    const chatbotId = requestUrl.searchParams.get('chatbotId')
    if (!chatbotId) {
      return NextResponse.json(
        { error: 'chatbotId is required' },
        { status: 400 }
      )
    }

    const page = requestUrl.searchParams.get('page') || '1'
    const size = requestUrl.searchParams.get('size') || '20'
    const startDate = requestUrl.searchParams.get('startDate') || '2024-01-01T00:00:00.000Z'
    const endDate = requestUrl.searchParams.get('endDate') || new Date().toISOString()
    const useCache = requestUrl.searchParams.get('useCache') !== 'false'
    const forceSync = requestUrl.searchParams.get('forceSync') === 'true'

    console.log('Request:', {
      chatbotId,
      page,
      size,
      dateRange: { startDate, endDate },
      useCache,
      forceSync
    })

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

    // Check last sync time
    const { data: syncData, error: syncError } = await supabaseAdmin
      .from('sync_status')
      .select('last_synced_at')
      .eq('chatbot_id', chatbotId)
      .maybeSingle()

    const lastSyncedAt = syncData?.last_synced_at
    const shouldSync = forceSync || !lastSyncedAt || 
      (new Date().getTime() - new Date(lastSyncedAt).getTime()) > 5 * 60 * 1000 // 5 minutes

    if (shouldSync) {
      console.log('Syncing:', {
        reason: !lastSyncedAt ? 'first sync' : forceSync ? 'force sync' : 'time elapsed',
        lastSyncedAt
      })

      // Get conversations from Chatbase
      const chatbaseResponse = await getConversations({
        apiKey,
        chatbotId,
        page: parseInt(page),
        size: parseInt(size),
        startDate,
        endDate,
        useCache: false,
        authToken: undefined
      })

      if (chatbaseResponse.data.length > 0) {
        // Get existing conversation IDs
        const { data: existingConvs, error: existingConvsError } = await supabaseAdmin
          .from('conversations')
          .select('id, updated_at')
          .eq('chatbot_id', chatbotId)

        if (existingConvsError) {
          console.error('Error fetching existing conversations:', existingConvsError)
        }

        const existingConvsMap = new Map(
          existingConvs?.map(conv => [conv.id, conv.updated_at]) || []
        )

        // Filter conversations that need updating
        const conversationsToUpsert = chatbaseResponse.data.filter(conv => {
          const existingUpdatedAt = existingConvsMap.get(conv.id)
          return !existingUpdatedAt || new Date(conv.updated_at) > new Date(existingUpdatedAt)
        })

        if (conversationsToUpsert.length > 0) {
          console.log('Upserting conversations:', {
            count: conversationsToUpsert.length,
            firstId: conversationsToUpsert[0]?.id
          })
          
          const { error: storeError } = await supabaseAdmin
            .from('conversations')
            .upsert(
              conversationsToUpsert.map(conv => ({
                id: conv.id,
                chatbot_id: chatbotId,
                source: conv.source,
                whatsapp_number: conv.whatsapp_number,
                customer: conv.customer,
                messages: conv.messages,
                min_score: conv.min_score,
                form_submission: conv.form_submission,
                country: conv.country,
                last_message_at: conv.last_message_at,
                created_at: conv.created_at,
                updated_at: conv.updated_at
              }))
            )

          if (storeError) {
            console.error('Error storing conversations:', storeError)
          } else {
            // Update sync status
            const { error: syncUpdateError } = await supabaseAdmin
              .from('sync_status')
              .upsert({
                chatbot_id: chatbotId,
                last_synced_at: new Date().toISOString(),
                last_sync_count: conversationsToUpsert.length
              })

            if (syncUpdateError) {
              console.error('Error updating sync status:', syncUpdateError)
            }
          }
        }
      }
    }

    // Get conversations from Supabase
    const { data: conversations, error: fetchError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .range((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size) - 1)

    if (fetchError) {
      console.error('Error fetching conversations:', fetchError)
      throw new Error('Failed to fetch conversations')
    }

    // Get total count with date filters
    const { count } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('chatbot_id', chatbotId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    console.log('Fetched:', {
      count,
      firstId: conversations[0]?.id,
      dateRange: { startDate, endDate }
    })

    return NextResponse.json({
      data: conversations,
      total: count || 0,
      page: parseInt(page),
      size: parseInt(size),
      lastSyncedAt: syncData?.last_synced_at
    })

  } catch (error: any) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      requestParams: {
        chatbotId: requestUrl.searchParams.get('chatbotId'),
        page: requestUrl.searchParams.get('page'),
        size: requestUrl.searchParams.get('size'),
        startDate: requestUrl.searchParams.get('startDate'),
        endDate: requestUrl.searchParams.get('endDate')
      }
    }
    console.error('API Error:', errorInfo)
    
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
} 