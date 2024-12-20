import { Clock, ThumbsUp, Users, ThumbsDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsResponse } from '@/lib/utils/analytics'

interface PerformanceOverviewProps {
  analytics: AnalyticsResponse | null
  isLoading: boolean
}

export function PerformanceOverview({ analytics, isLoading }: PerformanceOverviewProps) {
  const stats = [
    {
      name: 'Avg. Response Time',
      value: analytics?.performance?.averageResponseTime ? 
        `${(analytics.performance.averageResponseTime / 1000).toFixed(1)}s` : '0s',
      change: analytics?.performanceMetrics?.averageResponseTime ? 
        ((analytics.performance.averageResponseTime - analytics.performanceMetrics.averageResponseTime) / 
        analytics.performanceMetrics.averageResponseTime * 100).toFixed(1) + '%' : '0%',
      icon: Clock
    },
    {
      name: 'Success Rate',
      value: analytics?.performance?.successRate ? 
        `${analytics.performance.successRate.toFixed(1)}%` : '0%',
      change: analytics?.performanceMetrics?.successRate ? 
        ((analytics.performance.successRate - analytics.performanceMetrics.successRate) / 
        analytics.performanceMetrics.successRate * 100).toFixed(1) + '%' : '0%',
      icon: ThumbsUp
    },
    {
      name: 'Handoff Rate',
      value: analytics?.performance?.handoffRate ? 
        `${analytics.performance.handoffRate.toFixed(1)}%` : '0%',
      change: analytics?.performanceMetrics?.handoffRate ? 
        ((analytics.performance.handoffRate - analytics.performanceMetrics.handoffRate) / 
        analytics.performanceMetrics.handoffRate * 100).toFixed(1) + '%' : '0%',
      icon: Users
    },
    {
      name: 'Bounce Rate',
      value: analytics?.userEngagement?.bounceRate ? 
        `${analytics.userEngagement.bounceRate.toFixed(1)}%` : '0%',
      change: analytics?.userEngagementMetrics?.bounceRate ? 
        ((analytics.userEngagement.bounceRate - analytics.userEngagementMetrics.bounceRate) / 
        analytics.userEngagementMetrics.bounceRate * 100).toFixed(1) + '%' : '0%',
      icon: ThumbsDown
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">{stat.name}</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-semibold">{stat.value}</h3>
                  {stat.change !== '0%' && (
                    <span className={`text-xs ${
                      !stat.change.startsWith('-') ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {!stat.change.startsWith('-') ? '+' : ''}{stat.change}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 