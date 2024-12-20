'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { MessageSquare, Users, Clock, Globe, ThumbsUp, ThumbsDown, MessageCircle, BarChart3 } from 'lucide-react'
import { StatsCard } from '@/components/analytics/stats-card'
import { LineChart } from '@/components/analytics/line-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  // Check if chatbot is configured before making API calls
  if (!isConfigured) {
    return <ChatbotRequired />
  }

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

    fetchAnalytics()
  }, [getToken, chatbotId])

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Conversations"
            value={analytics.totalConversations.toLocaleString()}
            trend={{ 
              value: analytics.conversationGrowth.daily, 
              label: "from yesterday" 
            }}
            icon={<MessageSquare className="h-4 w-4" />}
          />
          <StatsCard
            title="Total Messages"
            value={analytics.totalMessages.toLocaleString()}
            trend={{ 
              value: analytics.userEngagement.averageMessagesPerUser, 
              label: "avg per user" 
            }}
            icon={<MessageCircle className="h-4 w-4" />}
          />
          <StatsCard
            title="Total Users"
            value={analytics.totalUsers.toLocaleString()}
            trend={{ 
              value: analytics.userRetention.daily, 
              label: "retention rate" 
            }}
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Engagement Rate"
            value={`${analytics.engagementRate.toFixed(1)}%`}
            trend={{ 
              value: analytics.userEngagement.repeatUserRate, 
              label: "repeat users" 
            }}
            icon={<BarChart3 className="h-4 w-4" />}
          />
        </div>

        {/* Performance Overview */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Avg. Response Time"
            value={`${(analytics.averageResponseTime / 1000).toFixed(1)}s`}
            trend={{ 
              value: -((analytics.performance.averageResponseTime - analytics.averageResponseTime) / analytics.performance.averageResponseTime * 100), 
              label: "improvement" 
            }}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatsCard
            title="Success Rate"
            value={`${analytics.performance.successRate.toFixed(1)}%`}
            trend={{ 
              value: analytics.performance.successRate, 
              label: "success rate" 
            }}
            icon={<ThumbsUp className="h-4 w-4" />}
          />
          <StatsCard
            title="Handoff Rate"
            value={`${analytics.performance.handoffRate.toFixed(1)}%`}
            trend={{ 
              value: -analytics.performance.handoffRate, 
              label: "automation rate" 
            }}
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Bounce Rate"
            value={`${analytics.userEngagement.bounceRate.toFixed(1)}%`}
            trend={{ 
              value: -analytics.userEngagement.bounceRate, 
              label: "engagement rate" 
            }}
            icon={<ThumbsDown className="h-4 w-4" />}
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Messages by Date</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] sm:h-[400px]">
                <LineChart
                  title=""
                  data={analytics.messagesByDate}
                  dataKey="count"
                  height={undefined}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time of Day Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.timeOfDayDistribution).map(([time, count]) => (
                  <div key={time} className="flex items-center">
                    <div className="w-24 flex-shrink-0 sm:w-40">
                      <p className="text-sm font-medium capitalize">{time}</p>
                      <p className="text-xs text-muted">
                        {time === 'morning' ? '6-12' : 
                         time === 'afternoon' ? '12-18' : 
                         time === 'evening' ? '18-24' : 
                         '0-6'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${(count / Object.values(analytics.timeOfDayDistribution).reduce((a, b) => a + b, 0)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 w-12 text-right">
                      <p className="text-sm font-medium">{count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Time and Conversation Length */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.responseTimeDistribution).map(([speed, count]) => (
                  <div key={speed} className="flex items-center">
                    <div className="w-24 flex-shrink-0 sm:w-40">
                      <p className="text-sm font-medium capitalize">{speed}</p>
                      <p className="text-xs text-muted">
                        {speed === 'fast' ? '< 1 min' : 
                         speed === 'medium' ? '1-5 min' : 
                         '> 5 min'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${(count / Object.values(analytics.responseTimeDistribution).reduce((a, b) => a + b, 0)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 w-12 text-right">
                      <p className="text-sm font-medium">{count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation Length Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.conversationLengthDistribution).map(([length, count]) => (
                  <div key={length} className="flex items-center">
                    <div className="w-24 flex-shrink-0 sm:w-40">
                      <p className="text-sm font-medium capitalize">{length}</p>
                      <p className="text-xs text-muted">
                        {length === 'short' ? '1-5 messages' : 
                         length === 'medium' ? '6-15 messages' : 
                         '> 15 messages'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${(count / Object.values(analytics.conversationLengthDistribution).reduce((a, b) => a + b, 0)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 w-12 text-right">
                      <p className="text-sm font-medium">{count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Source Distribution and Growth */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Source Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.sourceDistribution).map(([source, count]) => (
                  <div key={source} className="flex items-center">
                    <div className="w-24 flex-shrink-0 sm:w-40">
                      <p className="text-sm font-medium">{source}</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${(count / Object.values(analytics.sourceDistribution).reduce((a, b) => a + b, 0)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 w-12 text-right">
                      <p className="text-sm font-medium">{count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
        </div>

        {/* Content Analysis */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="mb-4 font-medium">Top User Queries</h4>
                  <div className="space-y-2">
                    {analytics.content.topUserQueries.map(({ query, count }) => (
                      <div key={query} className="flex justify-between">
                        <span className="text-sm">{query}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-4 font-medium">Common Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.content.commonKeywords.map(({ keyword, count }) => (
                      <div
                        key={keyword}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs"
                      >
                        {keyword} ({count})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 