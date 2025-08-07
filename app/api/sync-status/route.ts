import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { executeQuery } from '@/lib/db/queries'
import { RowDataPacket } from 'mysql2'

export const runtime = 'nodejs';

interface SyncStatusRow extends RowDataPacket {
  id: number;
  chatbot_id: string;
  last_synced_at: Date;
  status: string;
  sync_count: number;
  created_at: Date;
  updated_at: Date;
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

    const url = new URL(request.url)
    const chatbotId = url.searchParams.get('chatbotId')

    let query = 'SELECT * FROM sync_status'
    const params: string[] = []

    if (chatbotId) {
      query += ' WHERE chatbot_id = ?'
      params.push(chatbotId)
    }

    query += ' ORDER BY last_synced_at DESC'

    const result = await executeQuery<SyncStatusRow[]>(query, params)

    if (result.error) {
      console.error('Failed to fetch sync status:', result.error)
      return NextResponse.json(
        { error: 'Failed to fetch sync status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: result.data || []
    })

  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}