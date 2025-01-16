import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Message } from '@/types/api'
import * as XLSX from 'xlsx'

export async function GET(request: Request) {
  try {
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

    // Fetch conversations from Supabase
    const { data: conversations, error: fetchError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw new Error('Failed to fetch conversations')
    }

    // Define headers for structured data
    const headers = [
      'Conversation ID',
      'Customer Name',
      'Source',
      'Country',
      'WhatsApp Number',
      'Total Messages',
      'Start Time',
      'End Time',
      'Message #',
      'Sender',
      'Message Content',
      'Message Time',
      'Message Score'
    ]

    // Helper function to safely convert any value to a string
    const toCsvString = (value: any): string => {
      if (value === null || value === undefined) {
        return ''
      }
      const str = String(value)
      return str.replace(/[\n\r]/g, ' ').replace(/,/g, ';')
    }

    // Format conversations with expanded messages
    const rows: any[][] = []
    
    conversations.forEach(conv => {
      const messages = Array.isArray(conv.messages) ? conv.messages : []
      const startTime = new Date(conv.created_at).toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })
      const endTime = new Date(conv.updated_at).toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })
      
      // Add each message as a separate row with conversation context
      messages.forEach((msg: Message, index: number) => {
        const sender = msg.role === 'assistant' ? 'Bot' : 'User'
        const messageTime = msg.timestamp 
          ? new Date(msg.timestamp).toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })
          : startTime // fallback to conversation start time if no message timestamp
        
        rows.push([
          conv.id,
          conv.customer || 'Anonymous',
          conv.source,
          conv.country || 'Unknown',
          conv.whatsapp_number || 'N/A',
          messages.length,
          startTime,
          endTime,
          index + 1,
          sender,
          msg.content || '',
          messageTime,
          msg.score || 'N/A'
        ])
      })

      // If conversation has no messages, add a single row
      if (messages.length === 0) {
        rows.push([
          conv.id,
          conv.customer || 'Anonymous',
          conv.source,
          conv.country || 'Unknown',
          conv.whatsapp_number || 'N/A',
          0,
          startTime,
          endTime,
          0,
          'N/A',
          'No messages',
          startTime,
          'N/A'
        ])
      }
    })

    // Handle different export formats
    switch (format) {
      case 'json': {
        // Return raw JSON data
        return NextResponse.json(conversations, {
          headers: {
            'Content-Disposition': `attachment; filename="conversations-${chatbotId}-${new Date().toISOString().split('T')[0]}.json"`,
          },
        })
      }

      case 'xlsx': {
        // Create workbook and add worksheet
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

        // Set column widths
        const colWidths = [
          { wch: 15 }, // ID
          { wch: 20 }, // Customer
          { wch: 10 }, // Source
          { wch: 10 }, // Country
          { wch: 15 }, // WhatsApp
          { wch: 8 },  // Total Messages
          { wch: 20 }, // Start Time
          { wch: 20 }, // End Time
          { wch: 8 },  // Message #
          { wch: 10 }, // Sender
          { wch: 50 }, // Content
          { wch: 20 }, // Message Time
          { wch: 10 }, // Score
        ]
        ws['!cols'] = colWidths

        XLSX.utils.book_append_sheet(wb, ws, 'Conversations')
        
        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
        
        return new NextResponse(excelBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="conversations-${chatbotId}-${new Date().toISOString().split('T')[0]}.xlsx"`,
          },
        })
      }

      case 'csv':
      default: {
        // Create CSV content with proper escaping
        const csvContent = [
          headers.join(','),
          ...rows.map(row => 
            row.map(cell => {
              const cellStr = toCsvString(cell)
              // Double up quotes and wrap in quotes
              return `"${cellStr.replace(/"/g, '""')}"`
            }).join(',')
          )
        ].join('\n')

        // Add UTF-8 BOM and create response
        const BOM = '\uFEFF'
        const csvWithBOM = BOM + csvContent

        return new NextResponse(csvWithBOM, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="conversations-${chatbotId}-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        })
      }
    }
  } catch (error: any) {
    console.error('Export API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
} 