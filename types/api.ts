export interface Message {
  id?: string
  role: string
  content: string
  score?: string
  timestamp?: string
}

export interface Conversation {
  id: string
  chatbot_id: string
  source: string
  whatsapp_number: string | null
  customer: string | null
  messages: Message[]
  min_score: number | null
  form_submission?: any | null
  country: string | null
  created_at: string
  updated_at: string
  last_message_at?: string
  metadata?: Record<string, any>
}

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
  repeatUserRate: number
  averageSessionDuration: number
  bounceRate: number
}

export interface ContentMetrics {
  averageMessageLength: number
  messageContentDistribution: Record<string, number>
  topUserQueries: Array<{ query: string, count: number }>
  commonKeywords: Array<{ keyword: string, count: number }>
}

export interface PerformanceMetrics {
  firstResponseTime: number
  resolutionTime: number
  handoffRate: number
  successRate: number
  averageResponseTime: number
}

export interface AnalyticsResponse {
  // Basic metrics
  totalConversations: number
  totalMessages: number
  totalUsers: number
  engagementRate: number
  averageResponseTime: number
  
  // Distributions
  responseTimeDistribution: ResponseTimeDistribution
  conversationLengthDistribution: ConversationLengthDistribution
  timeOfDayDistribution: TimeOfDayDistribution
  sourceDistribution: Record<string, number>
  
  // Detailed metrics
  userEngagement: UserEngagementMetrics
  content: ContentMetrics
  performance: PerformanceMetrics
  
  // Time-based analysis
  messagesByDate: Array<{ date: string, count: number }>
  
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