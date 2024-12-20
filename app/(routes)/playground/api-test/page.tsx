'use client'

import { useState } from 'react'
import { useAuth, SignIn } from '@clerk/nextjs'
import { getConversations } from '@/lib/api/chatbase'
import type { AnalyticsResponse } from '@/lib/utils/analytics'
import type { ChatbaseResponse, Conversation } from '@/lib/api/chatbase'

// Test configuration
const TEST_CONFIG = {
  CHATBOT_ID: 'PTnQaHCF4UkuO5mxwItxv',
} as const

export default function ApiTestPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [conversationsResponse, setConversationsResponse] = useState<ChatbaseResponse<Conversation[]> | null>(null)
  const [analyticsResponse, setAnalyticsResponse] = useState<AnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<any>(null)

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return <div>Loading...</div>
  }

  // Show sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SignIn />
      </div>
    )
  }

  const testGetConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get Clerk session token
      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      const apiUrl = `/api/conversations?chatbotId=${TEST_CONFIG.CHATBOT_ID}`
      console.log('Making conversations API request:', {
        url: apiUrl,
        chatbotId: TEST_CONFIG.CHATBOT_ID,
        hasToken: !!token
      })

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })
      
      // Log response details for debugging
      const responseDetails = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }
      console.log('Conversations response details:', responseDetails)

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorText = await response.text()
          console.error('Response error:', {
            ...responseDetails,
            body: errorText
          })
          // Try to parse error as JSON
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorMessage
          } catch {
            // If not JSON, use the text as is
            errorMessage = errorText || errorMessage
          }
        } catch (e) {
          console.error('Error reading response:', e)
        }
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log('Conversations data:', data)
      setConversationsResponse(data)
      setError(null)
    } catch (err) {
      console.error('Conversations API Error:', {
        error: err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      })
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setConversationsResponse(null)
    } finally {
      setLoading(false)
    }
  }

  const testAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      setAnalyticsResponse(null)

      // Get Clerk session token
      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Make the analytics request
      const apiUrl = `/api/analytics?chatbotId=${TEST_CONFIG.CHATBOT_ID}`
      console.log('Making analytics API request:', {
        url: apiUrl,
        chatbotId: TEST_CONFIG.CHATBOT_ID,
        hasToken: !!token
      })

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      // Log response details for debugging
      const responseDetails = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }
      console.log('Analytics response details:', responseDetails)

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorText = await response.text()
          console.error('Response error:', {
            ...responseDetails,
            body: errorText
          })
          // Try to parse error as JSON
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorMessage
          } catch {
            // If not JSON, use the text as is
            errorMessage = errorText || errorMessage
          }
        } catch (e) {
          console.error('Error reading response:', e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Analytics data:', data)

      if (!data) {
        throw new Error('No data received from analytics API')
      }

      setAnalyticsResponse(data)
      setError(null)
    } catch (err) {
      console.error('Analytics API Error:', {
        error: err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      })
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setAnalyticsResponse(null)
    } finally {
      setLoading(false)
    }
  }

  const testEnvironment = async () => {
    try {
      setLoading(true)
      setError(null)
      setTestResponse(null)

      // Get Supabase token from Clerk
      const token = await getToken({ template: 'supabase' })
      if (!token) {
        throw new Error('Not authenticated')
      }

      console.log('Making test request with token:', token ? '[exists]' : '[missing]')

      const response = await fetch('/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Test response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Test endpoint error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Test response data:', data)
      setTestResponse(data)
      setError(null)
    } catch (err) {
      console.error('Test Error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setTestResponse(null)
    } finally {
      setLoading(false)
    }
  }

  const testHello = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Testing hello endpoint...')
      const response = await fetch('/api/hello')
      
      console.log('Hello response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Hello endpoint error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Hello endpoint data:', data)
    } catch (err) {
      console.error('Hello endpoint error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">API Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Test Hello API</h2>
          <button
            onClick={testHello}
            disabled={loading}
            className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50 mr-2"
          >
            {loading ? 'Loading...' : 'Test Hello'}
          </button>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Test Environment</h2>
          <button
            onClick={testEnvironment}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Environment'}
          </button>

          {testResponse && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Environment Check:</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold">Environment Variables</h4>
                  <div className="space-y-2">
                    <p>Supabase URL: {testResponse.environment.supabase.url}</p>
                    <p>Supabase Anon Key: {testResponse.environment.supabase.anonKey}</p>
                    <p>Chatbase API Key: {testResponse.environment.chatbase.apiKey}</p>
                    <p>Supabase Token: {testResponse.environment.auth.supabaseToken}</p>
                  </div>
                </div>

                {testResponse.supabase && (
                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold">Supabase Connection</h4>
                    <div className="space-y-2">
                      <p>Connected: {testResponse.supabase.connected ? 'Yes' : 'No'}</p>
                      {testResponse.supabase.error && (
                        <p className="text-red-500">Error: {testResponse.supabase.error}</p>
                      )}
                      {testResponse.supabase.data && (
                        <p>Data: {JSON.stringify(testResponse.supabase.data)}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold">Config Check</h4>
                  <div className="space-y-2">
                    <p>Supabase URL: {testResponse.config.supabase.url}</p>
                    <p>Supabase Anon Key: {testResponse.config.supabase.anonKey}</p>
                    <p>Chatbase API Key: {testResponse.config.chatbase.apiKey}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">Test Conversations API</h2>
          <button
            onClick={testGetConversations}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Get Conversations'}
          </button>

          {conversationsResponse && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Conversations Response:</h3>
              <pre className="bg-gray-50 p-4 rounded overflow-auto">
                {JSON.stringify(conversationsResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">Test Analytics API</h2>
          <button
            onClick={testAnalytics}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Analytics'}
          </button>

          {analyticsResponse && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Analytics Overview:</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold">Basic Metrics</h4>
                  <p>Total Conversations: {analyticsResponse.totalConversations}</p>
                  <p>Total Messages: {analyticsResponse.totalMessages}</p>
                  <p>Total Users: {analyticsResponse.totalUsers}</p>
                  <p>Engagement Rate: {analyticsResponse.engagementRate.toFixed(2)}%</p>
                  <p>Avg Response Time: {(analyticsResponse.averageResponseTime / 1000).toFixed(2)}s</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold">Response Times</h4>
                  <p>Fast (&lt;1min): {analyticsResponse.responseTimeDistribution.fast}</p>
                  <p>Medium (1-5min): {analyticsResponse.responseTimeDistribution.medium}</p>
                  <p>Slow (&gt;5min): {analyticsResponse.responseTimeDistribution.slow}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded mb-4">
                <h4 className="font-semibold mb-2">Source Distribution</h4>
                {Object.entries(analyticsResponse.sourceDistribution).map(([source, count]) => (
                  <div key={source} className="flex justify-between">
                    <span>{source}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">Messages by Date</h4>
                {analyticsResponse.messagesByDate.map(({ date, count }) => (
                  <div key={date} className="flex justify-between">
                    <span>{date}:</span>
                    <span>{count} messages</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-500 rounded">
          {error}
        </div>
      )}
    </div>
  )
} 
