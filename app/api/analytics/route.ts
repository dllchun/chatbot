import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAnalytics, getConversations } from '@/lib/api/chatbase'
import type { AnalyticsResponse } from '@/lib/utils/analytics'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  console.log('Analytics API route hit:', request.url)
  
  try {
    // Get Clerk session
    const { userId } = await auth()
    
    if (!userId) {
      console.log('No user ID found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request URL and validate parameters
    const requestUrl = new URL(request.url)
    const chatbotId = requestUrl.searchParams.get('chatbotId')
    
    console.log('Request parameters:', {
      chatbotId,
      url: request.url,
      userId
    })

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'chatbotId is required' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get analytics data from Chatbase
    const data = await getAnalytics({
      apiKey: process.env.CHATBASE_API_KEY!,
      chatbotId,
      startDate: requestUrl.searchParams.get('startDate') || '2024-01-01',
      endDate: requestUrl.searchParams.get('endDate') || new Date().toISOString().split('T')[0],
      useCache: false
    })

    console.log('Analytics data fetched from Chatbase')

    // Always fetch and store conversations for the new chatbot ID
    console.log('Fetching conversations for new chatbot ID...')
    
    const conversationsResponse = await getConversations({
      apiKey: process.env.CHATBASE_API_KEY!,
      chatbotId,
      startDate: '2024-01-01',
      endDate: new Date().toISOString().split('T')[0],
      useCache: false,
      size: 100
    })

    if (conversationsResponse.data.length > 0) {
      console.log(`Storing ${conversationsResponse.data.length} conversations in Supabase...`)
      
      const { error: conversationsError } = await supabase
        .from('conversations')
        .upsert(
          conversationsResponse.data.map(conv => ({
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
          }))
        )

      if (conversationsError) {
        console.error('Error storing conversations:', conversationsError)
      } else {
        console.log('Successfully stored conversations')
      }
    }

    // Store daily analytics in Supabase
    const today = new Date().toISOString().split('T')[0]
    const analyticsData = {
      chatbot_id: chatbotId,
      date: today,
      total_conversations: data.totalConversations || 0,
      total_messages: data.totalMessages || 0,
      source_distribution: data.sourceDistribution || {},
      avg_response_time_ms: data.averageResponseTime || 0,
      engagement_rate: data.engagementRate || 0,
      response_time_distribution: data.responseTimeDistribution || {
        fast: 0,
        medium: 0,
        slow: 0
      },
      conversation_length_distribution: data.conversationLengthDistribution || {
        short: 0,
        medium: 0,
        long: 0
      }
    }

    console.log('Storing analytics data in Supabase:', analyticsData)

    const { error: storeError } = await supabase
      .from('daily_analytics')
      .upsert(analyticsData, {
        onConflict: 'chatbot_id,date'
      })

    if (storeError) {
      console.error('Error storing analytics:', storeError)
      return NextResponse.json(
        { error: 'Failed to store analytics data' },
        { status: 500 }
      )
    }

    // Format and return the response
    const response: AnalyticsResponse = {
      totalConversations: data.totalConversations || 0,
      totalMessages: data.totalMessages || 0,
      totalUsers: data.totalUsers || 0,
      engagementRate: data.engagementRate || 0,
      averageResponseTime: data.averageResponseTime || 0,
      responseTimeDistribution: data.responseTimeDistribution || { 
        fast: 0, 
        medium: 0, 
        slow: 0 
      },
      conversationLengthDistribution: data.conversationLengthDistribution || { 
        short: 0, 
        medium: 0, 
        long: 0 
      },
      timeOfDayDistribution: data.timeOfDayDistribution || { 
        morning: 0, 
        afternoon: 0, 
        evening: 0, 
        night: 0 
      },
      sourceDistribution: data.sourceDistribution || {},
      userEngagement: data.userEngagement || {
        averageMessagesPerUser: 0,
        averageConversationsPerUser: 0,
        repeatUserRate: 0,
        averageSessionDuration: 0,
        bounceRate: 0
      },
      content: data.content || {
        averageMessageLength: 0,
        messageContentDistribution: {},
        topUserQueries: [],
        commonKeywords: []
      },
      performance: data.performance || {
        firstResponseTime: 0,
        resolutionTime: 0,
        handoffRate: 0,
        successRate: 0,
        averageResponseTime: 0
      },
      messagesByDate: data.messagesByDate || [],
      userRetention: data.userRetention || {
        daily: 0,
        weekly: 0,
        monthly: 0
      },
      conversationGrowth: data.conversationGrowth || {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Analytics Error:', {
      message: error.message,
      stack: error.stack,
      details: error
    })
    
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
} 