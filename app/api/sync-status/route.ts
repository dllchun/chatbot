import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('Sync status API called')
    const { userId } = await auth()
    
    if (!userId) {
      console.log('No user ID found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', userId)

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

    // First check if the table exists
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('sync_status')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('Error checking sync_status table:', tableError)
      return NextResponse.json(
        { error: 'Failed to access sync_status table' },
        { status: 500 }
      )
    }

    console.log('Table check successful')

    // Get all sync status records
    const { data, error } = await supabaseAdmin
      .from('sync_status')
      .select('*')
      .order('last_synced_at', { ascending: false })

    if (error) {
      console.error('Error fetching sync status:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sync status' },
        { status: 500 }
      )
    }

    console.log('Sync status data:', data)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 