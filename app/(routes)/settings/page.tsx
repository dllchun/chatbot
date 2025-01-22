'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Monitor, Moon, Sun, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useChatbotPreference } from '@/lib/hooks/useChatbotPreference'
import { PageContainer } from '@/components/new-version/page-container'
import { useTranslation } from 'next-i18next'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { 
    chatbotId, 
    isConfigured, 
    isLoading: isPreferenceLoading,
    setChatbotId 
  } = useChatbotPreference()
  const { getToken, isLoaded: isAuthLoaded } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [newChatbotId, setNewChatbotId] = useState(chatbotId || '')
  const [loading, setLoading] = useState(false)

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (chatbotId) {
      setNewChatbotId(chatbotId)
    }
  }, [chatbotId])

  if (!mounted || !isAuthLoaded) {
    return null
  }

  const handleSaveChatbotId = async () => {
    if (newChatbotId.trim() === '') {
      toast.error('Chatbot ID cannot be empty')
      return
    }

    setLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No auth token available')
      }

      const response = await fetch('/api/user/chatbot-preference', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatbotId: newChatbotId })
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMessage = 'Failed to save preference'
        try {
          const errorData = JSON.parse(text)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
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
    <PageContainer
      title={t("components.sidebar.menu.settings")}
      description={t("pages.settings.description")}
    >
      {!isConfigured && (
        <Alert className="mb-6 border-orange-500 text-orange-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            Please configure your Chatbot ID to enable all features. 
            This ID is required for the application to function properly.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        {/* Theme Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("pages.settings.section.theme.title")}</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              {t("common.theme.light")}
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              {t("common.theme.dark")}
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              {t("common.theme.system")}
            </Button>
          </div>
        </Card>

        {/* Chatbot Configuration */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("pages.settings.sections.chatbotConfiguration.label")}</h2>
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
                  {loading ? t("common.actions.saving") : t("common.actions.save")}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("pages.settings.sections.chatbotConfiguration.chatbotid.description")}
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
        </Card>
      </div>
    </PageContainer>
  )
} 