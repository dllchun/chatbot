import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorldMap } from '@/components/analytics/world-map'
import { DistributionCard } from '@/components/analytics/distribution-card'
import type { CountryDistribution } from '@/lib/utils/analytics'

interface CountryAnalyticsProps {
  countryDistribution: CountryDistribution
}

export function CountryAnalytics({ countryDistribution }: CountryAnalyticsProps) {
  const formatDistributionData = (data: CountryDistribution) => {
    return Object.entries(data).map(([key, value]) => ({
      key,
      value,
    }))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Country Map</CardTitle>
        </CardHeader>
        <CardContent>
          <WorldMap countryDistribution={countryDistribution} />
        </CardContent>
      </Card>

      <DistributionCard
        title="Country Distribution"
        items={formatDistributionData(countryDistribution)}
      />
    </div>
  )
} 