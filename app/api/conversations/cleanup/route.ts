import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

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

    // Get chatbotId from URL params
    const requestUrl = new URL(request.url)
    const chatbotId = requestUrl.searchParams.get('chatbotId')
    if (!chatbotId) {
      return NextResponse.json(
        { error: 'chatbotId is required' },
        { status: 400 }
      )
    }

    console.log('Cleaning up data for chatbot:', chatbotId)

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

    // Delete from sync_status
    const { error: syncDeleteError } = await supabaseAdmin
      .from('sync_status')
      .delete()
      .eq('chatbot_id', chatbotId)

    if (syncDeleteError) {
      console.error('Error deleting sync status:', syncDeleteError)
    }

    // Delete from conversations
    const { error: convsDeleteError } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('chatbot_id', chatbotId)

    if (convsDeleteError) {
      console.error('Error deleting conversations:', convsDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete conversations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully cleaned up chatbot data'
    })

  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
} 