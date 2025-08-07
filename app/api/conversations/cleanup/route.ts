import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { executeMutation, executeQuery } from '@/lib/db/queries'
import { RowDataPacket } from 'mysql2'

export const runtime = 'nodejs';

interface ConversationRow extends RowDataPacket {
  id: string;
  chatbot_id: string;
}

export async function DELETE(request: Request) {
  try {
    // Get Clerk session
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

    console.log('Cleaning up conversations for chatbot:', chatbotId)

    // First, get count of conversations to be deleted
    const countResult = await executeQuery<ConversationRow[]>(
      'SELECT COUNT(*) as count FROM conversations WHERE chatbot_id = ?',
      [chatbotId]
    )

    if (countResult.error) {
      throw countResult.error
    }

    const count = countResult.data?.[0] || 0

    // Delete conversations
    const deleteResult = await executeMutation(
      'DELETE FROM conversations WHERE chatbot_id = ?',
      [chatbotId]
    )

    if (deleteResult.error) {
      throw deleteResult.error
    }

    // Update sync status to reset
    await executeMutation(
      'UPDATE sync_status SET last_synced_at = NULL, status = \'reset\', updated_at = NOW() WHERE chatbot_id = ?',
      [chatbotId]
    )

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.data?.affectedRows || 0,
      message: `Successfully cleaned up ${deleteResult.data?.affectedRows || 0} conversations`
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to cleanup conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}