'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { StatsOverview } from '@/components/analytics/stats-overview'
import { PerformanceOverview } from '@/components/analytics/performance-overview'
import { MessagesChart } from '@/components/analytics/messages-chart'
import { GrowthAndRetention } from '@/components/analytics/growth-and-retention'
import { CountryAnalytics } from '@/components/analytics/country-analytics'
import { ContentAnalysis } from '@/components/analytics/content-analysis'
import { DistributionCard } from '@/components/analytics/distribution-card'
import { PageContainer } from '@/components/new-version/page-container'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { addDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import type { AnalyticsResponse } from '@/lib/utils/analytics'
import { ChatbotRequired } from '@/components/ui/chatbot-required'
import { useSettings } from '@/lib/store/settings'

export default function AnalyticsPage() {
  const { chatbotId, isConfigured } = useSettings()
  const { getToken } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null)

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      const params = new URLSearchParams({
        chatbotId: chatbotId || '',
        startDate: dateRange.from?.toISOString() || '',
        endDate: dateRange.to?.toISOString() || ''
      })

      const response = await fetch(`/api/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAnalyticsData(data as AnalyticsResponse)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConfigured && dateRange.from && dateRange.to) {
      fetchAnalytics()
    }
  }, [isConfigured, dateRange, getToken])

  if (!isConfigured) {
    return <ChatbotRequired />
  }

  return (
    <PageContainer
      title="Analytics Dashboard"
      description="Track and analyze your chatbot's performance"
      headerContent={
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      }
    >
      {error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-500">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Main Stats */}
          <StatsOverview
            analytics={analyticsData}
            isLoading={isLoading}
          />

          {/* Row 2: Performance Stats */}
          <PerformanceOverview
            analytics={analyticsData}
            isLoading={isLoading}
          />

          {/* Row 3: Messages Chart and Content Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MessagesChart
              analytics={analyticsData}
              isLoading={isLoading}
              dateRange={dateRange}
            />
            <ContentAnalysis
              content={analyticsData?.content || {
                topUserQueries: [],
                commonKeywords: [],
                averageMessageLength: 0,
                messageContentDistribution: {}
              }}
            />
          </div>

          {/* Row 4: Response Time and Conversation Length Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DistributionCard
              title="Response Time Distribution"
              items={analyticsData?.responseTimeDistribution ? 
                Object.entries(analyticsData.responseTimeDistribution).map(([key, value]) => ({
                  key,
                  value,
                  label: key === 'fast' ? '< 1 minute' : key === 'medium' ? '1-5 minutes' : '> 5 minutes'
                })) : []
              }
            />
            <DistributionCard
              title="Conversation Length Distribution"
              items={analyticsData?.conversationLengthDistribution ? 
                Object.entries(analyticsData.conversationLengthDistribution).map(([key, value]) => ({
                  key,
                  value,
                  label: key === 'short' ? '1-5 messages' : key === 'medium' ? '6-15 messages' : '> 15 messages'
                })) : []
              }
            />
          </div>

          {/* Row 5: Time of Day and Source Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DistributionCard
              title="Time of Day Distribution"
              items={analyticsData?.timeOfDayDistribution ? 
                Object.entries(analyticsData.timeOfDayDistribution)
                  .filter(([key]) => ['morning', 'afternoon', 'evening', 'night'].includes(key))
                  .map(([key, value]) => ({
                    key,
                    value,
                    label: key === 'morning' ? '6-12' : key === 'afternoon' ? '12-18' : key === 'evening' ? '18-24' : '0-6'
                  })) : []
              }
            />
            <DistributionCard
              title="Source Distribution"
              items={analyticsData?.sourceDistribution ? 
                Object.entries(analyticsData.sourceDistribution)
                  .map(([key, value]) => ({
                    key,
                    value,
                    label: key
                  })) : []
              }
            />
          </div>

          {/* Row 6: Country Map and Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CountryAnalytics
              analytics={analyticsData}
              isLoading={isLoading}
            />
            <DistributionCard
              title="Country Distribution"
              items={analyticsData?.countryDistribution ? 
                Object.entries(analyticsData.countryDistribution)
                  .map(([key, value]) => ({
                    key,
                    value,
                    label: key
                  })) : []
              }
            />
          </div>
        </div>
      )}
    </PageContainer>
  )
} 