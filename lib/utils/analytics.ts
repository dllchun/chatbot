import { type Message } from '@/lib/api/chatbase'

// Analytics Types
export interface ResponseTimeDistribution {
  fast: number    // < 1 minute
  medium: number  // 1-5 minutes
  slow: number    // > 5 minutes
}

export interface ConversationLengthDistribution {
  short: number   // 1-5 messages
  medium: number  // 6-15 messages
  long: number    // > 15 messages
}

export interface TimeOfDayDistribution {
  morning: number    // 6-12
  afternoon: number  // 12-18
  evening: number    // 18-24
  night: number      // 0-6
}

export interface UserEngagementMetrics {
  averageMessagesPerUser: number
  averageConversationsPerUser: number
  repeatUserRate: number          // Percentage of users with multiple conversations
  averageSessionDuration: number  // Average time between first and last message
  bounceRate: number             // Percentage of conversations with only 1 user message
}

export interface ContentMetrics {
  averageMessageLength: number
  messageContentDistribution: Record<string, number>  // Distribution of message types/intents
  topUserQueries: Array<{
    query: string
    count: number
  }>
  commonKeywords: Array<{
    keyword: string
    count: number
  }>
}

export interface PerformanceMetrics {
  firstResponseTime: number      // Average time to first bot response
  resolutionTime: number        // Average time to conversation completion
  handoffRate: number           // Rate of conversations requiring human handoff
  successRate: number           // Rate of successfully resolved conversations
  averageResponseTime: number   // Already existing
}

export interface AnalyticsResponse {
  // Existing metrics
  totalConversations: number
  totalMessages: number
  totalUsers: number
  engagementRate: number
  averageResponseTime: number
  responseTimeDistribution: ResponseTimeDistribution
  sourceDistribution: Record<string, number>
  messagesByDate: Array<{
    date: string
    count: number
  }>

  // New metrics
  conversationLengthDistribution: ConversationLengthDistribution
  timeOfDayDistribution: TimeOfDayDistribution
  userEngagement: UserEngagementMetrics
  content: ContentMetrics
  performance: PerformanceMetrics
  
  // Growth metrics
  userRetention: {
    daily: number
    weekly: number
    monthly: number
  }
  conversationGrowth: {
    daily: number
    weekly: number
    monthly: number
  }
}

// Helper Functions
export function calculateResponseTime(messages: Message[]): number {
  let totalResponseTime = 0
  let responseCount = 0

  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === 'assistant' && messages[i-1].role === 'user') {
      const currentTimestamp = messages[i].timestamp
      const previousTimestamp = messages[i-1].timestamp
      
      if (typeof currentTimestamp === 'string' && typeof previousTimestamp === 'string') {
        const currentTime = new Date(currentTimestamp).getTime()
        const previousTime = new Date(previousTimestamp).getTime()
        
        if (!isNaN(currentTime) && !isNaN(previousTime)) {
          const responseTime = currentTime - previousTime
          totalResponseTime += responseTime
          responseCount++
        }
      }
    }
  }

  return responseCount > 0 ? totalResponseTime / responseCount : 0
}

export function calculateEngagementRate(messages: Message[]): number {
  const userMessages = messages.filter(m => m.role === 'user').length
  const totalMessages = messages.length
  return totalMessages > 0 ? (userMessages / totalMessages) * 100 : 0
}

export function getResponseTimeCategory(responseTime: number): keyof ResponseTimeDistribution {
  if (responseTime < 60000) return 'fast'
  if (responseTime < 300000) return 'medium'
  return 'slow'
}

export function getConversationLengthCategory(messageCount: number): keyof ConversationLengthDistribution {
  if (messageCount <= 5) return 'short'
  if (messageCount <= 15) return 'medium'
  return 'long'
}

export function getTimeOfDay(timestamp: string): keyof TimeOfDayDistribution {
  const hour = new Date(timestamp).getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 24) return 'evening'
  return 'night'
}

export function extractKeywords(text: string): string[] {
  // Simple keyword extraction - could be improved with NLP libraries
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'])
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
}

export function calculateSessionDuration(messages: Message[]): number {
  if (messages.length < 2) return 0
  
  const timestamps = messages
    .map(m => m.timestamp)
    .filter((t): t is string => typeof t === 'string')
    .map(t => new Date(t).getTime())
    .filter(t => !isNaN(t))
    
  if (timestamps.length < 2) return 0
  
  return Math.max(...timestamps) - Math.min(...timestamps)
}

export function processAnalytics(conversations: Array<{
  id: string
  created_at: string
  messages: Message[]
  source: string
  customer: string | null
}>): AnalyticsResponse {
  // Basic metrics
  const totalConversations = conversations.length
  const totalMessages = conversations.reduce((sum, conv) => 
    sum + (Array.isArray(conv.messages) ? conv.messages.length : 0), 0)
  const uniqueUsers = new Set(conversations.map(c => c.customer).filter(Boolean)).size

  // Initialize distributions
  const responseTimeDistribution: ResponseTimeDistribution = { fast: 0, medium: 0, slow: 0 }
  const conversationLengthDistribution: ConversationLengthDistribution = { short: 0, medium: 0, long: 0 }
  const timeOfDayDistribution: TimeOfDayDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  const sourceDistribution: Record<string, number> = {}
  const keywordCounts: Record<string, number> = {}
  
  // Calculate metrics
  let totalResponseTime = 0
  let totalEngagementRate = 0
  let totalSessionDuration = 0
  let totalMessageLength = 0
  let bounceCount = 0
  let firstResponseTimes: number[] = []
  let userConversationCounts: Record<string, number> = {}

  conversations.forEach(conv => {
    const messages = conv.messages
    const messageCount = messages.length
    
    // Update distributions
    const responseTime = calculateResponseTime(messages)
    const lengthCategory = getConversationLengthCategory(messageCount)
    const timeCategory = getTimeOfDay(conv.created_at)
    
    responseTimeDistribution[getResponseTimeCategory(responseTime)]++
    conversationLengthDistribution[lengthCategory]++
    timeOfDayDistribution[timeCategory]++
    sourceDistribution[conv.source] = (sourceDistribution[conv.source] || 0) + 1

    // Calculate engagement metrics
    totalResponseTime += responseTime
    totalEngagementRate += calculateEngagementRate(messages)
    totalSessionDuration += calculateSessionDuration(messages)
    
    // Track user metrics
    if (conv.customer) {
      userConversationCounts[conv.customer] = (userConversationCounts[conv.customer] || 0) + 1
    }

    // Calculate bounce rate
    const userMessages = messages.filter(m => m.role === 'user')
    if (userMessages.length === 1) bounceCount++

    // Calculate first response time
    const firstUserMessage = messages.find(m => m.role === 'user')
    const firstBotResponse = messages.find(m => m.role === 'assistant')
    if (firstUserMessage?.timestamp && firstBotResponse?.timestamp) {
      const firstResponseTime = new Date(firstBotResponse.timestamp).getTime() - 
                               new Date(firstUserMessage.timestamp).getTime()
      if (!isNaN(firstResponseTime)) {
        firstResponseTimes.push(firstResponseTime)
      }
    }

    // Extract keywords and message lengths
    messages.forEach(msg => {
      totalMessageLength += msg.content.length
      extractKeywords(msg.content).forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
      })
    })
  })

  // Calculate user engagement metrics
  const repeatUsers = Object.values(userConversationCounts).filter(count => count > 1).length
  const userEngagement: UserEngagementMetrics = {
    averageMessagesPerUser: uniqueUsers > 0 ? totalMessages / uniqueUsers : 0,
    averageConversationsPerUser: uniqueUsers > 0 ? totalConversations / uniqueUsers : 0,
    repeatUserRate: uniqueUsers > 0 ? (repeatUsers / uniqueUsers) * 100 : 0,
    averageSessionDuration: totalConversations > 0 ? totalSessionDuration / totalConversations : 0,
    bounceRate: totalConversations > 0 ? (bounceCount / totalConversations) * 100 : 0
  }

  // Calculate content metrics
  const content: ContentMetrics = {
    averageMessageLength: totalMessages > 0 ? totalMessageLength / totalMessages : 0,
    messageContentDistribution: {}, // Would need NLP to categorize message content
    topUserQueries: Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count })),
    commonKeywords: Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }))
  }

  // Calculate performance metrics
  const performance: PerformanceMetrics = {
    firstResponseTime: firstResponseTimes.length > 0 
      ? firstResponseTimes.reduce((a, b) => a + b, 0) / firstResponseTimes.length 
      : 0,
    resolutionTime: totalConversations > 0 ? totalSessionDuration / totalConversations : 0,
    handoffRate: 0, // Would need to track handoffs in message content
    successRate: 0, // Would need success criteria in data
    averageResponseTime: totalConversations > 0 ? totalResponseTime / totalConversations : 0
  }

  // Messages by date (last 7 days)
  const last7Days = new Array(7).fill(0).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse() // Reverse to show oldest to newest

  const messagesByDate = last7Days.map(date => {
    const dayMessages = conversations.reduce((sum, conv) => {
      // Check if the conversation has any messages from this date
      const messagesOnDate = conv.messages.filter(msg => {
        if (!msg.timestamp) return false
        return msg.timestamp.startsWith(date)
      }).length
      return sum + messagesOnDate
    }, 0)

    return {
      date,
      count: dayMessages
    }
  })

  // Calculate growth metrics (simplified - could be more sophisticated)
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const conversationGrowth = {
    daily: conversations.filter(c => new Date(c.created_at) > dayAgo).length,
    weekly: conversations.filter(c => new Date(c.created_at) > weekAgo).length,
    monthly: conversations.filter(c => new Date(c.created_at) > monthAgo).length
  }

  return {
    // Existing metrics
    totalConversations,
    totalMessages,
    totalUsers: uniqueUsers,
    engagementRate: totalConversations > 0 
      ? totalEngagementRate / totalConversations 
      : 0,
    averageResponseTime: totalConversations > 0 
      ? totalResponseTime / totalConversations 
      : 0,
    responseTimeDistribution,
    sourceDistribution,
    messagesByDate,

    // New metrics
    conversationLengthDistribution,
    timeOfDayDistribution,
    userEngagement,
    content,
    performance,
    
    // Growth metrics
    userRetention: {
      daily: 0,  // Would need historical user data to calculate retention
      weekly: 0,
      monthly: 0
    },
    conversationGrowth
  }
} 