import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getConversations } from '@/lib/api/chatbase'
import { config, validateServerConfig } from '@/lib/config'
import { executeQuery, executeMutation } from '@/lib/database/queries'
import { RowDataPacket } from 'mysql2'

export const runtime = 'nodejs';

interface SyncStatusRow extends RowDataPacket {
  last_synced_at: Date | null;
}

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

    // Check last sync time from MySQL
    const syncResult = await executeQuery<SyncStatusRow[]>(
      'SELECT last_synced_at FROM sync_status WHERE chatbot_id = ?',
      [chatbotId]
    )

    const lastSyncedAt = syncResult.data?.[0]?.last_synced_at
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
        useCache: false, // Always get fresh data when syncing
        authToken: undefined
      })

      console.log('Chatbase Response:', {
        dataLength: chatbaseResponse.data.length,
        total: chatbaseResponse.total,
        page: chatbaseResponse.page,
        size: chatbaseResponse.size
      })

      // Store in cache (MySQL)
      if (chatbaseResponse.data.length > 0) {
        const { CacheService } = await import('@/lib/services/cache')
        await CacheService.storeConversations(chatbaseResponse.data, chatbotId)
      }

      // Update sync status
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      await executeMutation(
        `INSERT INTO sync_status (chatbot_id, last_synced_at, status, sync_count)
         VALUES (?, ?, 'success', 1)
         ON DUPLICATE KEY UPDATE 
         last_synced_at = VALUES(last_synced_at),
         status = VALUES(status),
         sync_count = sync_count + 1,
         updated_at = NOW()`,
        [chatbotId, now]
      )

      return NextResponse.json({
        data: chatbaseResponse.data,
        page: parseInt(page),
        size: parseInt(size),
        total: chatbaseResponse.total || chatbaseResponse.data.length,
        cached: false
      })
    }

    // Get from cache
    const { CacheService } = await import('@/lib/services/cache')
    const cachedData = await CacheService.getConversations({
      chatbotId,
      startDate,
      endDate,
      page: parseInt(page),
      pageSize: parseInt(size)
    })

    console.log('Using cache:', {
      count: cachedData.length,
      cached: true
    })

    return NextResponse.json({
      data: cachedData,
      page: parseInt(page),
      size: parseInt(size),
      total: cachedData.length,
      cached: true
    })

  } catch (error) {
    console.error('Conversations error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: requestUrl.toString()
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch conversations', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// POST: Store conversations manually
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { conversations, chatbotId } = body

    if (!chatbotId || !conversations) {
      return NextResponse.json(
        { error: 'chatbotId and conversations are required' },
        { status: 400 }
      )
    }

    const { CacheService } = await import('@/lib/services/cache')
    await CacheService.storeConversations(conversations, chatbotId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/conversations error:', error)
    return NextResponse.json(
      { error: 'Failed to store conversations' },
      { status: 500 }
    )
  }
}