import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getConversations } from '@/lib/api/chatbase'
import { config, validateServerConfig } from '@/lib/config'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
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
    const requestUrl = new URL(request.url)
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
    const startDate = requestUrl.searchParams.get('startDate') || '2024-01-01'
    const endDate = requestUrl.searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const useCache = requestUrl.searchParams.get('useCache') !== 'false'
    const forceSync = requestUrl.searchParams.get('forceSync') === 'true'

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
    const { data: syncData } = await supabaseAdmin
      .from('sync_status')
      .select('last_synced_at')
      .eq('chatbot_id', chatbotId)
      .single()

    const lastSyncedAt = syncData?.last_synced_at
    const shouldSync = forceSync || !lastSyncedAt || 
      (new Date().getTime() - new Date(lastSyncedAt).getTime()) > 5 * 60 * 1000 // 5 minutes

    let chatbaseResponse
    
    if (shouldSync) {
      // Get conversations from Chatbase
      chatbaseResponse = await getConversations({
        apiKey,
        chatbotId,
        page: parseInt(page),
        size: parseInt(size),
        startDate,
        endDate,
        useCache
      })

      if (chatbaseResponse.data.length > 0) {
        console.log('Syncing conversations:', {
          count: chatbaseResponse.data.length,
          chatbotId
        })

        // Get existing conversation IDs
        const { data: existingConvs } = await supabaseAdmin
          .from('conversations')
          .select('id, updated_at')
          .eq('chatbot_id', chatbotId)

        const existingConvsMap = new Map(
          existingConvs?.map(conv => [conv.id, conv.updated_at]) || []
        )

        // Filter conversations that need updating
        const conversationsToUpsert = chatbaseResponse.data.filter(conv => {
          const existingUpdatedAt = existingConvsMap.get(conv.id)
          return !existingUpdatedAt || new Date(conv.updated_at) > new Date(existingUpdatedAt)
        })

        if (conversationsToUpsert.length > 0) {
          console.log(`Upserting ${conversationsToUpsert.length} conversations`)
          
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
            await supabaseAdmin
              .from('sync_status')
              .upsert({
                chatbot_id: chatbotId,
                last_synced_at: new Date().toISOString(),
                last_sync_count: conversationsToUpsert.length
              })
          }
        } else {
          console.log('No conversations need updating')
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
      .order('last_message_at', { ascending: false })
      .range((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size) - 1)

    if (fetchError) {
      console.error('Error fetching conversations from Supabase:', fetchError)
      // If Supabase fetch fails, return Chatbase data if we have it
      if (chatbaseResponse) {
        return NextResponse.json(chatbaseResponse)
      }
      throw new Error('Failed to fetch conversations')
    }

    // Get total count with date filters
    const { count } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('chatbot_id', chatbotId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    return NextResponse.json({
      data: conversations,
      total: count || 0,
      page: parseInt(page),
      size: parseInt(size),
      lastSyncedAt: syncData?.last_synced_at
    })

  } catch (error: any) {
    console.error('Error details:', error)
    
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
} 