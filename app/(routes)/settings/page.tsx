'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useSettings } from '@/lib/store/settings'
import { useAuth, useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Monitor, Moon, Sun, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { chatbotId, setChatbotId, isConfigured } = useSettings()
  const { getToken, isLoaded: isAuthLoaded } = useAuth()
  const { isLoaded: isUserLoaded } = useUser()
  const [mounted, setMounted] = useState(false)
  const [newChatbotId, setNewChatbotId] = useState(chatbotId || '')
  const [loading, setLoading] = useState(false)

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch preferred chatbot ID on mount
  useEffect(() => {
    const fetchPreference = async () => {
      try {
        // Wait for auth to be ready
        if (!isAuthLoaded || !isUserLoaded) {
          console.log('Auth not ready yet');
          return
        }

        // Get token from Clerk
        const token = await getToken()
        if (!token) {
          console.error('No auth token available')
          return
        }

        console.log('Making API request with token');
        const response = await fetch('/api/user/chatbot-preference', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        })

        console.log('API response status:', response.status);
        const text = await response.text()
        console.log('Raw response:', text)

        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.error('Failed to parse response:', e)
          return
        }

        console.log('Parsed data:', data)

        if (data.chatbotId) {
          setNewChatbotId(data.chatbotId)
          setChatbotId(data.chatbotId)
        }
      } catch (error) {
        console.error('Error fetching chatbot ID:', error)
      }
    }

    if (mounted) {
      fetchPreference()
    }
  }, [mounted, setChatbotId, getToken, isAuthLoaded, isUserLoaded])

  if (!mounted || !isAuthLoaded || !isUserLoaded) {
    return null
  }

  const handleSaveChatbotId = async () => {
    if (newChatbotId.trim() === '') {
      toast.error('Chatbot ID cannot be empty')
      return
    }

    setLoading(true)
    try {
      // Get token from Clerk (using same approach as fetch)
      const token = await getToken()
      if (!token) {
        throw new Error('No auth token available')
      }

      console.log('Making save request with token');
      const response = await fetch('/api/user/chatbot-preference', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatbotId: newChatbotId })
      })

      console.log('Save response status:', response.status);
      if (!response.ok) {
        const text = await response.text()
        console.error('Save error response:', text)
        let errorMessage = 'Failed to save preference'
        try {
          const errorData = JSON.parse(text)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // Use text as is if not JSON
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }

      setChatbotId(newChatbotId)
      toast.success('Chatbot ID updated successfully')
    } catch (error) {
      console.error('Error saving chatbot ID:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save Chatbot ID')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {!isConfigured && (
        <Alert className="border-orange-500 text-orange-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            Please configure your Chatbot ID to enable all features. 
            This ID is required for the application to function properly.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Theme Settings */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Chatbot Configuration</h2>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="chatbotId">
                Chatbot ID
                {!isConfigured && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="chatbotId"
                  value={newChatbotId}
                  onChange={(e) => setNewChatbotId(e.target.value)}
                  placeholder="Enter your chatbot ID"
                  disabled={loading}
                  className={!isConfigured ? "border-orange-500" : ""}
                />
                <Button 
                  onClick={handleSaveChatbotId}
                  disabled={loading}
                  variant={!isConfigured ? "default" : "outline"}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This ID will be used for all API calls and iframe integrations.
                {!isConfigured && (
                  <span className="text-orange-500 block mt-1">
                    Required for the application to function properly.
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Current Configuration</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Theme:</span>{' '}
                  <span className="capitalize">{theme}</span>
                </p>
                <p>
                  <span className="font-medium">Chatbot ID:</span>{' '}
                  <span className="font-mono">{chatbotId || 'Not set'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Integration Examples */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Integration Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Iframe Integration</h3>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
              <code>{`<iframe
  src="https://www.chatbase.co/chatbot-iframe/${chatbotId || '[YOUR-CHATBOT-ID]'}"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">API Endpoint</h3>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
              <code>{`/api/conversations?chatbotId=${chatbotId || '[YOUR-CHATBOT-ID]'}`}</code>
            </pre>
          </div>
        </div>
      </Card>
    </div>
  )
} 