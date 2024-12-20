import { Clock, ThumbsUp, Users, ThumbsDown } from 'lucide-react'
import { StatsCard } from '@/components/analytics/stats-card'
import type { AnalyticsResponse } from '@/lib/utils/analytics'

interface PerformanceOverviewProps {
  analytics: AnalyticsResponse
}

export function PerformanceOverview({ analytics }: PerformanceOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Avg. Response Time"
        value={`${(analytics.averageResponseTime / 1000).toFixed(1)}s`}
        trend={{ 
          value: -((analytics.performance.averageResponseTime - analytics.averageResponseTime) / analytics.performance.averageResponseTime * 100), 
          label: "improvement" 
        }}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatsCard
        title="Success Rate"
        value={`${analytics.performance.successRate.toFixed(1)}%`}
        trend={{ 
          value: analytics.performance.successRate, 
          label: "success rate" 
        }}
        icon={<ThumbsUp className="h-4 w-4" />}
      />
      <StatsCard
        title="Handoff Rate"
        value={`${analytics.performance.handoffRate.toFixed(1)}%`}
        trend={{ 
          value: -analytics.performance.handoffRate, 
          label: "automation rate" 
        }}
        icon={<Users className="h-4 w-4" />}
      />
      <StatsCard
        title="Bounce Rate"
        value={`${analytics.userEngagement.bounceRate.toFixed(1)}%`}
        trend={{ 
          value: -analytics.userEngagement.bounceRate, 
          label: "engagement rate" 
        }}
        icon={<ThumbsDown className="h-4 w-4" />}
      />
    </div>
  )
} 