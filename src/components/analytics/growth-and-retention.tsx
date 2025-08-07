import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsResponse } from '@/lib/utils/analytics'

interface GrowthAndRetentionProps {
  analytics: AnalyticsResponse | null
  isLoading: boolean
}

export function GrowthAndRetention({ analytics, isLoading }: GrowthAndRetentionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth & Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth & Retention</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <h4 className="mb-2 font-medium">Conversation Growth</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted">Daily</span>
              <span className="font-medium">+{analytics.conversationGrowth.daily}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted">Weekly</span>
              <span className="font-medium">+{analytics.conversationGrowth.weekly}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted">Monthly</span>
              <span className="font-medium">+{analytics.conversationGrowth.monthly}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 