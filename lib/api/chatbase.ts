import { z } from 'zod'
import { type Database } from '@/types/supabase'
import { processAnalytics } from '@/lib/utils/analytics'
import type { AnalyticsResponse } from '@/lib/utils/analytics'
import { CacheService } from '@/lib/services/cache'

// Schema Definitions
export const MessageSchema = z.object({
  id: z.string().optional(),
  role: z.string(),
  content: z.string(),
  timestamp: z.string().optional(),
  score: z.string().optional(),
})

export const ConversationSchema = z.object({
  id: z.string(),
  chatbot_id: z.string(),
  source: z.string(),
  whatsapp_number: z.string().nullable(),
  customer: z.string().nullable(),
  messages: z.array(MessageSchema),
  min_score: z.number().nullable(),
  form_submission: z.any().nullable().optional(),
  country: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  last_message_at: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Raw API Response Schema
const RawConversationSchema = z.object({
  id: z.string(),
  chatbot_id: z.string(),
  source: z.string(),
  customer: z.string().nullable(),
  messages: z.array(MessageSchema),
  min_score: z.number().nullable(),
  form_submission: z.any().nullable().optional(),
  country: z.string().nullable(),
  created_at: z.string(),
  last_message_at: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type Message = z.infer<typeof MessageSchema>
export type Conversation = z.infer<typeof ConversationSchema>
export type RawConversation = z.infer<typeof RawConversationSchema>
type DbConversation = Database['public']['Tables']['conversations']['Row']

// API Response Types
export interface ChatbaseResponse<T> {
  data: T
  total?: number
  page?: number
  size?: number
}

interface RequestOptions {
  method: string
  headers: Record<string, string>
  body?: string
}

// API Functions
export async function fetchChatbaseAPI<T>({
  apiKey,
  endpoint,
  params = {},
  method = 'GET',
  body,
}: {
  apiKey: string
  endpoint: string
  params?: Record<string, string>
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}): Promise<T> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value.toString())
  })
  
  const url = `${endpoint}?${searchParams.toString()}`
  
  console.log('Chatbase request:', {
    method,
    endpoint: url.split('?')[0], // Log base URL without params
    params
  })

  try {
    const options: RequestOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }

    if (body !== undefined) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Chatbase error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(`Chatbase API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error('Chatbase request failed:', error)
    throw error
  }
}

// Helper function to transform raw conversation to our format
function transformConversation(conv: RawConversation, chatbotId: string): Conversation {
  return {
    id: conv.id,
    chatbot_id: chatbotId,
    source: conv.source,
    whatsapp_number: null,
    customer: conv.customer,
    messages: conv.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      score: msg.score,
      timestamp: msg.timestamp
    })),
    min_score: conv.min_score,
    form_submission: conv.form_submission,
    country: conv.country,
    created_at: conv.created_at,
    updated_at: conv.created_at, // Use created_at as fallback
    last_message_at: conv.last_message_at || conv.created_at,
    metadata: conv.metadata
  }
}

// Conversations API
export async function getConversations({
  apiKey,
  apiUrl = 'https://www.chatbase.co/api/v1',
  chatbotId,
  page = 1,
  size = 20,
  startDate = '2024-01-01T00:00:00.000Z',
  endDate = new Date().toISOString(),
  useCache = true,
  authToken
}: {
  apiKey: string
  apiUrl?: string
  chatbotId: string
  page?: number
  size?: number
  startDate?: string
  endDate?: string
  useCache?: boolean
  authToken?: string
}): Promise<ChatbaseResponse<Conversation[]>> {
  console.log('Fetching conversations:', {
    chatbotId,
    page,
    size,
    dateRange: { startDate, endDate },
    useCache
  })

  // Try to get from cache first if useCache is true
  if (useCache) {
    const cachedData = await CacheService.getConversations({
      chatbotId,
      startDate,
      endDate,
      page,
      pageSize: size,
      authToken
    })

    if (cachedData.length > 0) {
      console.log('Using cache:', {
        count: cachedData.length,
        firstId: cachedData[0]?.id
      })
      return {
        data: cachedData as Conversation[],
        page,
        size,
        total: cachedData.length
      }
    }
  }

  // If not in cache or cache disabled, fetch from API
  const response = await fetchChatbaseAPI<ChatbaseResponse<RawConversation[]>>({
    apiKey,
    endpoint: `${apiUrl}/get-conversations`,
    params: {
      chatbotId,
      page: page.toString(),
      size: size.toString(),
      startDate: new Date(startDate).toISOString().split('T')[0], // Chatbase API expects YYYY-MM-DD
      endDate: new Date(endDate).toISOString().split('T')[0], // Chatbase API expects YYYY-MM-DD
    },
  })

  // Transform the raw data to our format
  const enrichedData = {
    ...response,
    data: response.data.map(conv => transformConversation(conv, chatbotId))
  }

  // Store in cache if useCache is true
  if (useCache && enrichedData.data.length > 0) {
    await CacheService.storeConversations(enrichedData.data, chatbotId, authToken)
  }

  return enrichedData
}

// Analytics Functions
export async function getAnalytics({
  apiKey,
  chatbotId,
  startDate = '2024-01-01',
  endDate = '2024-12-12',
  useCache = true,
  authToken
}: {
  apiKey: string
  chatbotId: string
  startDate?: string
  endDate?: string
  useCache?: boolean
  authToken?: string
}): Promise<AnalyticsResponse> {
  // Try to get from cache first if useCache is true
  if (useCache) {
    const cachedData = await CacheService.getCachedAnalytics({
      chatbotId,
      startDate,
      endDate,
      authToken
    })

    if (cachedData.length > 0) {
      console.log('Using cached analytics data')
      return processAnalytics(cachedData as Conversation[])
    }
  }

  // If not in cache or cache disabled, fetch from API
  const chatbaseData = await getConversations({
    apiKey,
    chatbotId,
    startDate,
    endDate,
    size: 100, // Fetch more at once for analytics
    useCache: false, // Don't use cache since we're already checking
    authToken
  })

  // Store in cache if useCache is true
  if (useCache && chatbaseData.data.length > 0) {
    await CacheService.storeConversations(chatbaseData.data, chatbotId, authToken)
  }

  return processAnalytics(chatbaseData.data)
} 