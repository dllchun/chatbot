import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Conversation } from '@/types/api'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

// Create a Supabase client with the anon key
const createSupabaseClient = (authToken?: string) => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    authToken ? {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    } : undefined
  )
}

export class CacheService {
  static async storeConversations(conversations: Conversation[], chatbotId: string, authToken?: string) {
    try {
      console.log('Storing conversations:', {
        count: conversations.length,
        chatbotId,
        firstConversation: conversations[0]
      })

      const supabase = createSupabaseClient(authToken)
      const { data, error } = await supabase
        .from('conversations')
        .upsert(
          conversations.map(conv => ({
            id: conv.id,
            chatbot_id: chatbotId,
            source: conv.source,
            whatsapp_number: conv.whatsapp_number,
            customer: conv.customer,
            messages: conv.messages,
            min_score: conv.min_score,
            form_submission: conv.form_submission,
            country: conv.country,
            last_message_at: conv.last_message_at,
            created_at: conv.created_at,
            updated_at: conv.updated_at
          })),
          { onConflict: 'id' }
        )

      if (error) {
        console.error('Error storing conversations:', error)
        throw error
      }

      console.log('Successfully stored conversations:', {
        count: conversations.length,
        data
      })

      return data
    } catch (error) {
      console.error('Failed to store conversations:', error)
      throw error
    }
  }

  static async getConversations({
    chatbotId,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
    authToken
  }: {
    chatbotId: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
    authToken?: string
  }) {
    try {
      console.log('Fetching conversations:', {
        chatbotId,
        startDate,
        endDate,
        page,
        pageSize
      })

      const supabase = createSupabaseClient(authToken)
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      const { data, error } = await query.range(start, end)

      if (error) {
        console.error('Error fetching conversations:', error)
        throw error
      }

      console.log('Successfully fetched conversations:', {
        count: data?.length || 0
      })

      return data || []
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      throw error
    }
  }

  static async getCachedAnalytics({
    chatbotId,
    startDate,
    endDate,
    authToken
  }: {
    chatbotId: string
    startDate?: string
    endDate?: string
    authToken?: string
  }) {
    try {
      console.log('Fetching analytics data from cache:', {
        chatbotId,
        startDate,
        endDate,
        hasAuthToken: !!authToken
      })

      const supabase = createSupabaseClient(authToken)
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('chatbot_id', chatbotId)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching analytics data from cache:', {
          error,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Successfully fetched analytics data from cache:', {
        count: data?.length || 0,
        firstRecord: data?.[0] ? { id: data[0].id, chatbot_id: data[0].chatbot_id } : null
      })

      return data || []
    } catch (error) {
      console.error('Failed to fetch analytics data from cache:', {
        error,
        type: typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }
} 