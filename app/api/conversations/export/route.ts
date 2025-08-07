import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { executeQuery } from '@/lib/db/queries'
import type { Message } from '@/types/api'
import * as XLSX from 'xlsx'
import { RowDataPacket } from 'mysql2'

export const runtime = 'nodejs';

interface ConversationExportRow extends RowDataPacket {
  id: string;
  chatbot_id: string;
  source: string;
  whatsapp_number: string | null;
  customer: string | null;
  messages: any;
  min_score: number | null;
  form_submission: any;
  country: string | null;
  last_message_at: Date | null;
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

    // Parse URL and validate parameters
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get('chatbotId')
    const format = searchParams.get('format') || 'csv'

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'chatbotId is required' },
        { status: 400 }
      )
    }

    // Fetch conversations from MySQL
    const result = await executeQuery<ConversationExportRow[]>(
      'SELECT * FROM conversations WHERE chatbot_id = ? ORDER BY created_at DESC',
      [chatbotId]
    )

    if (result.error) {
      console.error('Failed to fetch conversations:', result.error)
      throw new Error('Failed to fetch conversations')
    }

    const conversations = result.data || []

    // Define headers for structured data
    const headers = [
      'Conversation ID',
      'Customer Name',
      'Source',
      'Country',
      'WhatsApp Number',
      'Total Messages',
      'Min Score',
      'First Message',
      'Last Message',
      'Created At',
      'Last Message At'
    ]

    // Transform conversations data for export
    const rows = conversations.map(conv => {
      const messages: Message[] = typeof conv.messages === 'string' 
        ? JSON.parse(conv.messages) 
        : conv.messages || []
      
      const firstMessage = messages[0]?.content || ''
      const lastMessage = messages[messages.length - 1]?.content || ''

      return [
        conv.id,
        conv.customer || 'Unknown',
        conv.source,
        conv.country || 'Unknown',
        conv.whatsapp_number || '',
        messages.length,
        conv.min_score || 0,
        firstMessage,
        lastMessage,
        new Date(conv.created_at).toISOString(),
        conv.last_message_at ? new Date(conv.last_message_at).toISOString() : ''
      ]
    })

    // Add headers as first row
    const data = [headers, ...rows]

    if (format === 'xlsx') {
      // Create Excel workbook
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Conversations')
      
      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="conversations_${chatbotId}_${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    } else {
      // Default to CSV
      const csvContent = data
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="conversations_${chatbotId}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to export conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}