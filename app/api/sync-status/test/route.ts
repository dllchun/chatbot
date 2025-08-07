import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { executeQuery, executeMutation } from '@/lib/db/queries'
import { RowDataPacket } from 'mysql2'

export const runtime = 'nodejs';

interface SyncStatusRow extends RowDataPacket {
  id: number;
  chatbot_id: string;
  last_synced_at: Date;
  status: string;
}

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Testing sync status with MySQL...')

    // Insert test data
    const testChatbotId = 'PTnQaHCF4UkuO5mxwItxv'
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const result = await executeMutation(
      `INSERT INTO sync_status (chatbot_id, last_synced_at, status, sync_count)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       last_synced_at = VALUES(last_synced_at),
       status = VALUES(status),
       sync_count = sync_count + 1,
       updated_at = NOW()`,
      [testChatbotId, now, 'test', 1]
    )

    if (result.error) {
      throw result.error
    }

    // Retrieve the data
    const selectResult = await executeQuery<SyncStatusRow[]>(
      'SELECT * FROM sync_status WHERE chatbot_id = ?',
      [testChatbotId]
    )

    if (selectResult.error) {
      throw selectResult.error
    }

    return NextResponse.json({
      success: true,
      data: selectResult.data || [],
      message: 'Test data inserted/updated successfully'
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}