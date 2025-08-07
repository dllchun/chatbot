import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart } from '@/components/analytics/line-chart'
import type { DateRange } from 'react-day-picker'
import type { AnalyticsResponse } from '@/lib/utils/analytics'
import { isWithinInterval, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'

interface MessagesChartProps {
  analytics: AnalyticsResponse | null
  isLoading: boolean
  dateRange: DateRange
}

export function MessagesChart({ analytics, isLoading, dateRange }: MessagesChartProps) {
  const {t} = useTranslation()
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[350px] w-full" />
      </Card>
    )
  }

  if (!analytics?.messagesByDate || !dateRange.from || !dateRange.to) {
    return null
  }

  // Filter data based on date range
  const filteredData = analytics.messagesByDate.filter(item => {
    const date = parseISO(item.date)
    return isWithinInterval(date, { start: dateRange.from!, end: dateRange.to! })
  })

  return (
    <LineChart
      title={t("components.analytics.messagesChart.title")}
      data={filteredData}
      dataKey="count"
      height={350}
    />
  )
} 