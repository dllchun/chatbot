import { type Message } from '@/lib/api/chatbase'

// Analytics Types
export interface ResponseTimeDistribution {
  fast: number    // < 1 minute
  medium: number  // 1-5 minutes
  slow: number    // > 5 minutes
  [key: string]: number
}

export interface ConversationLengthDistribution {
  short: number   // 1-5 messages
  medium: number  // 6-15 messages
  long: number    // > 15 messages
  [key: string]: number
}

export interface TimeOfDayDistribution {
  morning: number    // 6-12
  afternoon: number  // 12-18
  evening: number    // 18-24
  night: number      // 0-6
  [key: string]: number
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

export interface CountryDistribution {
  [country: string]: number;
}

export interface AnalyticsResponse {
  totalConversations: number
  totalMessages: number
  totalUsers: number
  averageResponseTime: number
  engagementRate: number
  messagesByDate: Array<{
    date: string
    count: number
  }>
  countryDistribution: Record<string, number>
  sourceDistribution: Record<string, number>
  performance: {
    averageResponseTime: number
    successRate: number
    handoffRate: number
  }
  userEngagement: {
    bounceRate: number
  }
  responseTimeTrend: Array<{
    date: string
    averageTime: number
  }>
  content: ContentMetrics
  conversationGrowth: {
    daily: number
    weekly: number
    monthly: number
  }
  responseTimeDistribution: ResponseTimeDistribution
  conversationLengthDistribution: ConversationLengthDistribution
  timeOfDayDistribution: TimeOfDayDistribution
  userEngagementMetrics: UserEngagementMetrics
  performanceMetrics: PerformanceMetrics
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
        
        if (!isNaN(currentTime) && !isNaN(previousTime) && currentTime > previousTime) {
          const responseTime = currentTime - previousTime
          // Only include reasonable response times (less than 1 hour)
          if (responseTime > 0 && responseTime < 3600000) {
            totalResponseTime += responseTime
            responseCount++
          }
        }
      }
    }
  }

  // If no timestamps, estimate based on message order (assume 30 seconds average)
  if (responseCount === 0) {
    const botResponseCount = messages.filter(m => m.role === 'assistant').length
    return botResponseCount > 0 ? 30000 : 0 // 30 seconds default
  }

  return totalResponseTime / responseCount
}

export function calculateEngagementRate(messages: Message[]): number {
  const userMessages = messages.filter(m => m.role === 'user').length
  const botMessages = messages.filter(m => m.role === 'assistant').length
  // Engagement rate: percentage of user messages that got bot responses
  if (userMessages === 0) return 0
  return Math.min((botMessages / userMessages) * 100, 100)
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
  country?: string | null
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

  // Initialize keyword tracking for user messages only
  const userKeywordCounts: Record<string, number> = {}
  let totalUserMessageLength = 0
  let userMessageCount = 0
  const userQueries: Record<string, number> = {}

  // Initialize country distribution
  const countryDistribution: CountryDistribution = {};

  conversations.forEach(conv => {
    const messages = Array.isArray(conv.messages) ? conv.messages : []
    const messageCount = messages.length
    
    // Skip conversations with no messages
    if (messageCount === 0) return
    
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

    // Extract keywords and message lengths from user messages only
    messages.forEach(msg => {
      if (msg.role === 'user') {
        userMessageCount++
        totalUserMessageLength += msg.content.length
        
        // Store the complete user query
        userQueries[msg.content.toLowerCase()] = (userQueries[msg.content.toLowerCase()] || 0) + 1
        
        // Extract keywords from user messages
        extractKeywords(msg.content).forEach(keyword => {
          userKeywordCounts[keyword] = (userKeywordCounts[keyword] || 0) + 1
        })
      }
    })

    // Track country distribution
    if (conv.country) {
      countryDistribution[conv.country] = (countryDistribution[conv.country] || 0) + 1;
    }
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

  // Calculate content metrics for user messages only
  const content: ContentMetrics = {
    averageMessageLength: userMessageCount > 0 ? totalUserMessageLength / userMessageCount : 0,
    messageContentDistribution: {}, // Would need NLP to categorize message content
    topUserQueries: Object.entries(userQueries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count })),
    commonKeywords: Object.entries(userKeywordCounts)
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
    successRate: totalConversations > 0 ? ((totalConversations - bounceCount) / totalConversations) * 100 : 0,
    averageResponseTime: totalConversations > 0 ? totalResponseTime / totalConversations : 0
  }

  // Messages by date (last 7 days with proper date handling)
  const messagesByDate = (() => {
    const dates: { [key: string]: number } = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Initialize last 7 days with 0 counts
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dates[dateStr] = 0
    }

    // Count conversations by creation date
    conversations.forEach(conv => {
      const convDate = new Date(conv.created_at)
      convDate.setHours(0, 0, 0, 0)
      const dateStr = convDate.toISOString().split('T')[0]
      
      if (dates.hasOwnProperty(dateStr)) {
        // Count the number of messages in this conversation
        const messageCount = conv.messages.length
        dates[dateStr] += messageCount
      }
    })

    // Convert to array format and ensure dates are sorted
    return Object.entries(dates)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  })()

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

  // Calculate response time trend
  const responseTimeTrend = messagesByDate.map(({ date }) => ({
    date,
    averageTime: conversations
      .filter(conv => conv.created_at.startsWith(date))
      .reduce((sum, conv) => sum + calculateResponseTime(conv.messages), 0) / 
      conversations.filter(conv => conv.created_at.startsWith(date)).length || 0
  }))

  // Filter out conversations with valid messages for more accurate calculations
  const validConversations = conversations.filter(conv => 
    Array.isArray(conv.messages) && conv.messages.length > 0)
  const validConversationCount = validConversations.length

  return {
    totalConversations,
    totalMessages,
    totalUsers: uniqueUsers,
    engagementRate: validConversationCount > 0 
      ? totalEngagementRate / validConversationCount 
      : 0,
    averageResponseTime: validConversationCount > 0 
      ? totalResponseTime / validConversationCount 
      : 0,
    responseTimeDistribution,
    sourceDistribution,
    messagesByDate,
    conversationLengthDistribution,
    timeOfDayDistribution,
    userEngagement,
    content,
    performance: {
      ...performance,
      averageResponseTime: validConversationCount > 0 
        ? totalResponseTime / validConversationCount 
        : 0
    },
    conversationGrowth,
    countryDistribution,
    userEngagementMetrics: userEngagement,
    performanceMetrics: {
      ...performance,
      averageResponseTime: validConversationCount > 0 
        ? totalResponseTime / validConversationCount 
        : 0
    },
    responseTimeTrend
  }
} 