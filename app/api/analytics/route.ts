import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAnalytics } from '@/lib/api/chatbase'
import { config, validateServerConfig } from '@/lib/config'
import { executeQuery } from '@/lib/database/queries'
import { RowDataPacket } from 'mysql2'

export const runtime = 'nodejs';

interface ConversationCountRow extends RowDataPacket {
  count: number;
}

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

    // Check if we have cached conversations in MySQL
    const countResult = await executeQuery<ConversationCountRow[]>(
      `SELECT COUNT(*) as count FROM conversations 
       WHERE chatbot_id = ? AND created_at >= ? AND created_at <= ?`,
      [chatbotId, startDate, endDate]
    )

    console.log('Conversation count:', countResult.data?.[0]?.count || 0)

    // Get analytics (will use cache if available)
    const analytics = await getAnalytics({
      apiKey,
      chatbotId,
      startDate,
      endDate,
      useCache: true,
      authToken: undefined
    })

    console.log('Analytics response:', {
      totalConversations: analytics.totalConversations,
      totalMessages: analytics.totalMessages,
      sourceDistribution: analytics.sourceDistribution
    })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}