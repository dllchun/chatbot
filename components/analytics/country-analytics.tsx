import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorldMap } from '@/components/analytics/world-map'
import { DistributionCard } from '@/components/analytics/distribution-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsResponse } from '@/lib/utils/analytics'

interface CountryAnalyticsProps {
  analytics: AnalyticsResponse | null
  isLoading: boolean
}

export function CountryAnalytics({ analytics, isLoading }: CountryAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!analytics?.countryDistribution) {
    return null
  }

  const formatDistributionData = (data: AnalyticsResponse['countryDistribution']) => {
    return Object.entries(data).map(([key, value]) => ({
      key,
      value,
    }))
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Country Map</CardTitle>
        </CardHeader>
        <CardContent>
          <WorldMap countryDistribution={analytics.countryDistribution} />
        </CardContent>
      </Card>

     
    </div>
  )
} 