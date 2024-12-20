import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart } from '@/components/analytics/line-chart'
import type { AnalyticsResponse } from '@/lib/utils/analytics'

interface MessagesChartProps {
  messagesByDate: AnalyticsResponse['messagesByDate']
}

export function MessagesChart({ messagesByDate }: MessagesChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Messages by Date</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] sm:h-[400px]">
          <LineChart
            title=""
            data={messagesByDate}
            dataKey="count"
            height={undefined}
          />
        </div>
      </CardContent>
    </Card>
  )
} 