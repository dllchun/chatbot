import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Users, Clock, TrendingUp } from 'lucide-react'
import type { AnalyticsResponse } from '@/lib/utils/analytics'
import { useTranslation } from 'react-i18next'

interface StatsOverviewProps {
  analytics: AnalyticsResponse | null
  isLoading: boolean
}

export function StatsOverview({ analytics, isLoading }: StatsOverviewProps) {
  const {t} = useTranslation()
  // Calculate percentage changes based on previous period
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return '0'
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const stats = [
    {
      name: t("components.analytics.stats.totalConversations"),
      value: analytics?.totalConversations || 0,
      change: analytics ? calculateChange(
        analytics.totalConversations,
        analytics.conversationGrowth.daily
      ) : '0',
      icon: MessageSquare
    },
    {
      name: t("components.analytics.stats.totalUsers"),
      value: analytics?.totalUsers || 0,
      change: analytics ? calculateChange(
        analytics.totalUsers,
        analytics.userEngagementMetrics.averageConversationsPerUser
      ) : '0',
      icon: Users
    },
    {
      name: t("components.analytics.stats.avgResponseTime"),
      value: analytics?.averageResponseTime ? `${Math.round(analytics.averageResponseTime / 1000)}s` : '0s',
      change: analytics ? calculateChange(
        analytics.averageResponseTime,
        analytics.performanceMetrics.averageResponseTime
      ) : '0',
      icon: Clock
    },
    {
      name: t("components.analytics.stats.engagementRate"),
      value: analytics?.engagementRate ? `${Math.round(analytics.engagementRate)}%` : '0%',
      change: analytics ? calculateChange(
        analytics.engagementRate,
        analytics.userEngagementMetrics.repeatUserRate
      ) : '0',
      icon: TrendingUp
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
                  {stat.change !== '0' && (
                    <span className={`text-xs ${
                      !stat.change.startsWith('-') ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {!stat.change.startsWith('-') ? '+' : ''}{stat.change}%
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