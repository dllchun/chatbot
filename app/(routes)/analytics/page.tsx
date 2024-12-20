'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { StatsOverview } from '@/components/analytics/stats-overview'
import { PerformanceOverview } from '@/components/analytics/performance-overview'
import { MessagesChart } from '@/components/analytics/messages-chart'
import { DistributionCard } from '@/components/analytics/distribution-card'
import { ContentAnalysis } from '@/components/analytics/content-analysis'
import { GrowthAndRetention } from '@/components/analytics/growth-and-retention'
import { CountryAnalytics } from '@/components/analytics/country-analytics'
import { LoadingCard } from '@/components/ui/loading'
import type { AnalyticsResponse } from '@/lib/utils/analytics'
import { useSettings } from '@/lib/store/settings'
import { ChatbotRequired } from '@/components/ui/chatbot-required'

export default function AnalyticsPage() {
  const { getToken } = useAuth()
  const { chatbotId, isConfigured } = useSettings()
  const [timeframe] = useState('30d') // For future timeframe selector
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        setError(null)

        const token = await getToken()
        if (!token) {
          throw new Error('Not authenticated')
        }

        const response = await fetch(`/api/analytics?chatbotId=${chatbotId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    if (isConfigured) {
      fetchAnalytics()
    }
  }, [getToken, chatbotId, isConfigured])

  // Check if chatbot is configured before rendering
  if (!isConfigured) {
    return <ChatbotRequired />
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 p-4">
        <div className="rounded-lg bg-red-50 p-4 text-red-500">
          {error}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 p-4">
        <div className="text-muted">No analytics data available</div>
      </div>
    )
  }

  function formatDistributionData<T extends { [key: string]: number }>(
    data: T,
    labelMap?: Record<string, string>
  ) {
    return Object.entries(data).map(([key, value]) => ({
      key,
      value,
      label: labelMap?.[key]
    }))
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your chatbot performance and user engagement
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview analytics={analytics} />

        {/* Performance Overview */}
        <div className="mt-6">
          <PerformanceOverview analytics={analytics} />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MessagesChart messagesByDate={analytics.messagesByDate} />
          <DistributionCard
            title="Time of Day Distribution"
            items={formatDistributionData(analytics.timeOfDayDistribution, {
              morning: '6-12',
              afternoon: '12-18',
              evening: '18-24',
              night: '0-6'
            })}
          />
        </div>

        {/* Response Time and Conversation Length */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DistributionCard
            title="Response Time Distribution"
            items={formatDistributionData(analytics.responseTimeDistribution, {
              fast: '< 1 min',
              medium: '1-5 min',
              slow: '> 5 min'
            })}
          />
          <DistributionCard
            title="Conversation Length Distribution"
            items={formatDistributionData(analytics.conversationLengthDistribution, {
              short: '1-5 messages',
              medium: '6-15 messages',
              long: '> 15 messages'
            })}
          />
        </div>

        {/* Source Distribution and Growth */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DistributionCard
            title="Source Distribution"
            items={formatDistributionData(analytics.sourceDistribution)}
          />
          <GrowthAndRetention analytics={analytics} />
        </div>

        {/* Content Analysis */}
        <div className="mt-6">
          <ContentAnalysis content={analytics.content} />
        </div>

        {/* Country Distribution */}
        <div className="mt-6">
          <CountryAnalytics countryDistribution={analytics.countryDistribution} />
        </div>
      </div>
    </div>
  )
} 