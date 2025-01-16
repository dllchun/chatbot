'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Download } from 'lucide-react'

interface ApiResponse {
  status: number
  data: any
  error?: string
  headers?: Record<string, string>
}

export default function ApiTestPage() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({})
  const [chatbotId, setChatbotId] = useState('')

  const handleApiCall = async (endpoint: string, method: string = 'GET') => {
    try {
      // Clear previous responses
      setResponses({})
      setLoading(prev => ({ ...prev, [endpoint]: true }))
      
      const token = await getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Build URL with parameters
      const url = new URL(`/api${endpoint}`, window.location.origin)
      if (chatbotId) {
        url.searchParams.set('chatbotId', chatbotId)
      }

      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const contentType = response.headers.get('Content-Type')
      const contentDisposition = response.headers.get('Content-Disposition')
      const isDownloadable = contentType?.includes('text/csv') || contentDisposition?.includes('attachment')

      if (isDownloadable) {
        // Handle file download
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'download.csv'
        
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)

        // Show success response
        setResponses({
          [endpoint]: {
            status: response.status,
            data: `File "${filename}" downloaded successfully`,
            headers: Object.fromEntries(response.headers.entries())
          }
        })
      } else {
        // Handle JSON/text response
        let data
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text()
        }

        setResponses({
          [endpoint]: {
            status: response.status,
            data,
            headers: Object.fromEntries(response.headers.entries())
          }
        })
      }
    } catch (error: any) {
      setResponses({
        [endpoint]: {
          status: 500,
          data: null,
          error: error.message
        }
      })
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }))
    }
  }

  const endpoints = [
    { path: '/conversations', name: 'List Conversations' },
    { path: '/conversations/export', name: 'Export Conversations', icon: Download },
    { path: '/analytics', name: 'Get Analytics' },
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Global Parameters</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Chatbot ID"
            value={chatbotId}
            onChange={(e) => setChatbotId(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </Card>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card className="p-4">
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <div key={endpoint.path} className="flex items-center gap-4 p-4 border rounded">
                  <div className="flex-1">
                    <h3 className="font-medium">{endpoint.name}</h3>
                    <p className="text-sm text-gray-500">{endpoint.path}</p>
                  </div>
                  <Button
                    onClick={() => handleApiCall(endpoint.path)}
                    disabled={loading[endpoint.path]}
                  >
                    {loading[endpoint.path] ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        {endpoint.icon && <endpoint.icon className="w-4 h-4 mr-2" />}
                        Test Endpoint
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card className="p-4">
            <div className="space-y-4">
              {Object.entries(responses).map(([endpoint, response]) => (
                <div key={endpoint} className="border rounded p-4">
                  <h3 className="font-medium mb-2">{endpoint}</h3>
                  <div className="text-sm">
                    <p>Status: {response.status}</p>
                    {response.error ? (
                      <p className="text-red-500">Error: {response.error}</p>
                    ) : (
                      <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                        {typeof response.data === 'string' 
                          ? response.data 
                          : JSON.stringify(response.data, null, 2)}
                      </pre>
                    )}
                    {response.headers && (
                      <div className="mt-2">
                        <p className="font-medium text-xs text-gray-500">Headers:</p>
                        <pre className="mt-1 p-2 bg-gray-50 rounded overflow-auto text-xs">
                          {JSON.stringify(response.headers, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 