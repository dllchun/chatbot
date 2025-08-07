import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { executeMutation } from '@/lib/database/queries'

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { chatbotId } = await request.json()

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'chatbotId is required' },
        { status: 400 }
      )
    }

    console.log('Force syncing conversations for chatbot:', chatbotId)

    // Reset sync status to force a fresh sync
    const result = await executeMutation(
      `INSERT INTO sync_status (chatbot_id, last_synced_at, status, sync_count)
       VALUES (?, NULL, 'force_sync_requested', 0)
       ON DUPLICATE KEY UPDATE 
       last_synced_at = NULL,
       status = 'force_sync_requested',
       updated_at = NOW()`,
      [chatbotId]
    )

    if (result.error) {
      throw result.error
    }

    return NextResponse.json({
      success: true,
      message: 'Sync status reset. Next API call will force a fresh sync from Chatbase.',
      chatbotId
    })

  } catch (error) {
    console.error('Force sync error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to reset sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}