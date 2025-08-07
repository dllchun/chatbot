'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { StatsOverview } from '@/components/analytics/stats-overview'
import { PerformanceOverview } from '@/components/analytics/performance-overview'
import { MessagesChart } from '@/components/analytics/messages-chart'
import { CountryAnalytics } from '@/components/analytics/country-analytics'
import { ContentAnalysis } from '@/components/analytics/content-analysis'
import { DistributionCard } from '@/components/analytics/distribution-card'
import { PageContainer } from '@/components/new-version/page-container'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { addDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import type { AnalyticsResponse } from '@/lib/utils/analytics'
import { ChatbotRequired } from '@/components/ui/chatbot-required'
import { useSettings } from '@/lib/store/settings'
import { useTranslation } from 'react-i18next'

export default function AnalyticsPage() {
  const {t} = useTranslation()
  const { chatbotId, isConfigured } = useSettings()
  const { getToken } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  const fetchAnalytics = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const abortController = new AbortController()
    abortControllerRef.current = abortController
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
        },
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAnalyticsData(data as AnalyticsResponse)
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Failed to fetch analytics:', err)
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [chatbotId, dateRange])

  useEffect(() => {
    if (isConfigured && dateRange.from && dateRange.to && chatbotId) {
      fetchAnalytics()
    }
  }, [isConfigured, dateRange, chatbotId, fetchAnalytics])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  if (!isConfigured) {
    return <ChatbotRequired />
  }

  return (
    <PageContainer
      title= {t("pages.analytics.title")}
      description={t("pages.analytics.description")}
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
              title={t("components.analytics.distributionCard.responseTimeDistribution")}
              items={analyticsData?.responseTimeDistribution ? 
                Object.entries(analyticsData.responseTimeDistribution).map(([key, value]) => ({
                  key,
                  value,
                  label: key === 'fast' ? '< 1 minute' : key === 'medium' ? '1-5 minutes' : '> 5 minutes'
                })) : []
              }
            />
            <DistributionCard
              title={t("components.analytics.distributionCard.conversationLengthDistribution")}
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
              title={t("components.analytics.distributionCard.timeOfDayDistribution")}
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
              title={t("components.analytics.distributionCard.sourceDistribution")}
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
              title={t("components.analytics.distributionCard.countryDistribution")}
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