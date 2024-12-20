import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalyticsResponse } from '@/lib/utils/analytics'

interface GrowthAndRetentionProps {
  analytics: AnalyticsResponse
}

export function GrowthAndRetention({ analytics }: GrowthAndRetentionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth & Retention</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <h4 className="mb-2 font-medium">User Retention</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Daily</span>
                <span className="font-medium">{analytics.userRetention.daily}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Weekly</span>
                <span className="font-medium">{analytics.userRetention.weekly}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Monthly</span>
                <span className="font-medium">{analytics.userRetention.monthly}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 