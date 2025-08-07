import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { executeQuery } from '@/lib/db/queries'
import { RowDataPacket } from 'mysql2'

export const runtime = 'nodejs';

interface SyncStatusRow extends RowDataPacket {
  id: number;
  chatbot_id: string;
  last_synced_at: Date | null;
  status: string;
  sync_count: number;
  created_at: Date;
  updated_at: Date;
}

interface ConversationCountRow extends RowDataPacket {
  count: number;
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const chatbotId = url.searchParams.get('chatbotId')

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'chatbotId is required' },
        { status: 400 }
      )
    }

    // Get sync status
    const syncResult = await executeQuery<SyncStatusRow[]>(
      'SELECT * FROM sync_status WHERE chatbot_id = ?',
      [chatbotId]
    )

    // Get conversation count
    const countResult = await executeQuery<ConversationCountRow[]>(
      'SELECT COUNT(*) as count FROM conversations WHERE chatbot_id = ?',
      [chatbotId]
    )

    if (syncResult.error || countResult.error) {
      throw syncResult.error || countResult.error
    }

    const syncStatus = syncResult.data?.[0] || null
    const conversationCount = countResult.data?.[0]?.count || 0

    return NextResponse.json({
      chatbotId,
      conversationCount,
      syncStatus: syncStatus ? {
        lastSyncedAt: syncStatus.last_synced_at,
        status: syncStatus.status,
        syncCount: syncStatus.sync_count,
        updatedAt: syncStatus.updated_at
      } : null,
      shouldSync: !syncStatus?.last_synced_at || 
        (new Date().getTime() - new Date(syncStatus.last_synced_at).getTime()) > 5 * 60 * 1000
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}