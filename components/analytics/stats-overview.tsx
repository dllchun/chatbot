import { MessageSquare, Users, MessageCircle, BarChart3 } from 'lucide-react'
import { StatsCard } from '@/components/analytics/stats-card'
import type { AnalyticsResponse } from '@/lib/utils/analytics'

interface StatsOverviewProps {
  analytics: AnalyticsResponse
}

export function StatsOverview({ analytics }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Conversations"
        value={analytics.totalConversations.toLocaleString()}
        trend={{ 
          value: analytics.conversationGrowth.daily, 
          label: "from yesterday" 
        }}
        icon={<MessageSquare className="h-4 w-4" />}
      />
      <StatsCard
        title="Total Messages"
        value={analytics.totalMessages.toLocaleString()}
        trend={{ 
          value: analytics.userEngagement.averageMessagesPerUser, 
          label: "avg per user" 
        }}
        icon={<MessageCircle className="h-4 w-4" />}
      />
      <StatsCard
        title="Total Users"
        value={analytics.totalUsers.toLocaleString()}
        trend={{ 
          value: analytics.userRetention.daily, 
          label: "retention rate" 
        }}
        icon={<Users className="h-4 w-4" />}
      />
      <StatsCard
        title="Engagement Rate"
        value={`${analytics.engagementRate.toFixed(1)}%`}
        trend={{ 
          value: analytics.userEngagement.repeatUserRate, 
          label: "repeat users" 
        }}
        icon={<BarChart3 className="h-4 w-4" />}
      />
    </div>
  )
} 